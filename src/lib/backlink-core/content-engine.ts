import { requesty } from "@/lib/ai";
import { generateText } from "ai";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ContentType = 
  | "syndication"
  | "parasite_opinion"
  | "summary"
  | "snippet"
  | "abstract"
  | "quote_collection"
  | "micro_content"
  | "exchange_placement";

export interface ContentRequest {
  sourceTitle: string;
  sourceContent: string;
  keyword: string;
  secondaryKeywords?: string[];
  niche?: string;
  contentType: ContentType;
  maxLength: number;
  targetUrl?: string;
  anchorText?: string;
  requiresUniqueIntro: boolean;
  requiresUniqueConclusion: boolean;
}

export interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  uniquenessScore: number;
}

export interface ContentPlacement {
  content: string;
  placementPosition: "contextual" | "bio" | "footer";
  anchorHtml: string;
}

const CONTENT_TYPE_CONFIGS: Record<ContentType, { maxWords: number; style: string }> = {
  syndication: { maxWords: 1500, style: "informative blog post" },
  parasite_opinion: { maxWords: 2000, style: "thought-leader opinion piece" },
  summary: { maxWords: 150, style: "brief summary" },
  snippet: { maxWords: 50, style: "micro-snippet" },
  abstract: { maxWords: 100, style: "professional abstract" },
  quote_collection: { maxWords: 200, style: "quotable insights" },
  micro_content: { maxWords: 30, style: "single sentence" },
  exchange_placement: { maxWords: 300, style: "contextual paragraph" },
};

export class ContentEngine {
  static async generateContent(request: ContentRequest): Promise<GeneratedContent> {
    const config = CONTENT_TYPE_CONFIGS[request.contentType];
    const effectiveMaxLength = Math.min(request.maxLength, config.maxWords);

    const prompt = this.buildPrompt(request, effectiveMaxLength, config.style);

    try {
      const { text } = await generateText({
        model: requesty("openai/gpt-4o-mini"),
        prompt,
        maxOutputTokens: effectiveMaxLength * 4,
      });

      const parsed = this.parseGeneratedContent(text, request.sourceTitle);
      
      return {
        ...parsed,
        wordCount: parsed.content.split(/\s+/).length,
        uniquenessScore: this.estimateUniqueness(parsed.content, request.sourceContent),
      };
    } catch (error) {
      console.error("Content generation error:", error);
      return {
        title: request.sourceTitle,
        content: request.sourceContent.slice(0, effectiveMaxLength * 5),
        excerpt: request.sourceContent.slice(0, 200),
        wordCount: 0,
        uniquenessScore: 0,
      };
    }
  }

  private static buildPrompt(request: ContentRequest, maxLength: number, style: string): string {
    const uniqueInstructions = [];
    if (request.requiresUniqueIntro) {
      uniqueInstructions.push("Write a COMPLETELY NEW and UNIQUE introduction (different angle/hook from original)");
    }
    if (request.requiresUniqueConclusion) {
      uniqueInstructions.push("Write a NEW conclusion with different takeaways");
    }

    const linkInstruction = request.targetUrl && request.anchorText
      ? `Naturally include this contextual link: <a href="${request.targetUrl}">${request.anchorText}</a>`
      : "";

    return `Create a ${style} based on this source material.

SOURCE TITLE: "${request.sourceTitle}"
KEYWORD: ${request.keyword}
${request.secondaryKeywords?.length ? `SECONDARY KEYWORDS: ${request.secondaryKeywords.join(", ")}` : ""}
${request.niche ? `NICHE: ${request.niche}` : ""}
SOURCE CONTENT (excerpt): ${request.sourceContent.slice(0, 2000)}

REQUIREMENTS:
${uniqueInstructions.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}
${uniqueInstructions.length ? `${uniqueInstructions.length + 1}. ` : "1. "}Keep it under ${maxLength} words
${linkInstruction ? `${uniqueInstructions.length + 2}. ${linkInstruction}` : ""}
- DO NOT duplicate the original - make it unique enough to rank separately
- Write in a natural, editorial style

Output format:
TITLE: [Title - different from original if syndication/opinion]
CONTENT: [Full content]`;
  }

  private static parseGeneratedContent(text: string, fallbackTitle: string): { title: string; content: string; excerpt: string } {
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);

    const title = titleMatch?.[1]?.trim() || fallbackTitle;
    const content = contentMatch?.[1]?.trim() || text;

    return {
      title,
      content,
      excerpt: content.slice(0, 200),
    };
  }

  private static estimateUniqueness(generated: string, source: string): number {
    const generatedWords = new Set(generated.toLowerCase().split(/\s+/));
    const sourceWords = new Set(source.toLowerCase().split(/\s+/));
    
    let overlap = 0;
    for (const word of generatedWords) {
      if (sourceWords.has(word)) overlap++;
    }
    
    const overlapRatio = overlap / generatedWords.size;
    return Math.round((1 - overlapRatio) * 100);
  }

  static async createContextualPlacement(
    existingContent: string,
    linkUrl: string,
    anchorText: string,
    topicContext: string
  ): Promise<ContentPlacement> {
    const prompt = `Add a contextual paragraph to this content that naturally introduces a link.

EXISTING CONTENT CONTEXT: ${existingContent.slice(0, 500)}
TOPIC: ${topicContext}
LINK TO INSERT: ${linkUrl}
ANCHOR TEXT: ${anchorText}

Write a 2-3 sentence paragraph that:
1. Flows naturally from the existing content
2. Provides value/context to the reader
3. Includes the link naturally with anchor: <a href="${linkUrl}">${anchorText}</a>

Just output the paragraph, nothing else.`;

    try {
      const { text } = await generateText({
        model: requesty("openai/gpt-4o-mini"),
        prompt,
        maxOutputTokens: 300,
      });

      return {
        content: text.trim(),
        placementPosition: "contextual",
        anchorHtml: `<a href="${linkUrl}">${anchorText}</a>`,
      };
    } catch (error) {
      return {
        content: `For more information, check out <a href="${linkUrl}">${anchorText}</a>.`,
        placementPosition: "footer",
        anchorHtml: `<a href="${linkUrl}">${anchorText}</a>`,
      };
    }
  }

  static async checkContentUniqueness(content: string, userId: string): Promise<{
    isUnique: boolean;
    similarContentIds: string[];
    similarityScore: number;
  }> {
    const { data: existingContent } = await supabaseAdmin
      .from("content_derivatives")
      .select("id, content")
      .eq("user_id", userId)
      .limit(50);

    if (!existingContent?.length) {
      return { isUnique: true, similarContentIds: [], similarityScore: 0 };
    }

    const contentWords = new Set(content.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const similarIds: string[] = [];
    let maxSimilarity = 0;

    for (const existing of existingContent) {
      const existingWords = new Set(existing.content?.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3) || []);
      
      let overlap = 0;
      for (const word of contentWords) {
        if (existingWords.has(word)) overlap++;
      }
      
      const similarity = overlap / contentWords.size;
      if (similarity > 0.7) {
        similarIds.push(existing.id);
      }
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }

    return {
      isUnique: maxSimilarity < 0.7,
      similarContentIds: similarIds,
      similarityScore: Math.round(maxSimilarity * 100),
    };
  }
}
