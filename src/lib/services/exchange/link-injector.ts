import { requesty } from "@/lib/ai";
import { generateText } from "ai";

export interface InjectionRequest {
    content: string;
    targetUrl: string;
    anchorText: string;
    anchorType: string;
    niche: string;
    contentType: "html" | "markdown";
}

export class LinkInjector {
    /**
     * Inject a link contextually into content using AI to find the best spot
     */
    static async injectLink(request: InjectionRequest): Promise<{
        content: string;
        success: boolean;
        placementLabel?: string;
    }> {
        const { content, targetUrl, anchorText, anchorType, niche, contentType } = request;

        try {
            const { text: processedContent } = await generateText({
                model: requesty("openai/gpt-4o-mini"),
                prompt: `You are an SEO expert specializing in natural, contextual link building.
        
TASK:
Find the most relevant and natural place in the provided ${contentType.toUpperCase()} content to insert a contextual backlink.

TARGET URL: ${targetUrl}
ANCHOR TEXT: ${anchorText}
ANCHOR TYPE: ${anchorType}
TOPIC/NICHE: ${niche}

RULES:
1. DO NOT change the existing meaning of the content.
2. The link MUST be placed inside a paragraph in the body text.
3. DO NOT place the link in a heading, list, footer, or "Related Reading" section.
4. If the exact anchor text "${anchorText}" exists, wrap the link around it.
5. If the exact anchor text doesn't exist, modify a single sentence naturally to incorporate it or find a highly relevant phrase.
6. The resulting ${contentType} must be valid.
7. Return the FULL updated content. No explanations.

CONTENT:
${content}
`,
            });

            if (!processedContent || processedContent === content) {
                return { content, success: false };
            }

            return {
                content: processedContent.trim(),
                success: true,
                placementLabel: "Contextual AI Placement"
            };
        } catch (error) {
            console.error("Link injection error:", error);
            return { content, success: false };
        }
    }

    /**
     * Heuristic-based rotation for anchor text types
     */
    static getAnchorType(ratios: {
        branded: number;
        naked: number;
        keyword: number;
        generic: number;
    }): string {
        const rand = Math.random();
        if (rand < ratios.branded) return "branded";
        if (rand < ratios.branded + ratios.naked) return "naked";
        if (rand < ratios.branded + ratios.naked + ratios.keyword) return "keyword";
        return "generic";
    }

    /**
     * Generate anchor text based on type and target
     */
    static async suggestAnchorText(
        targetUrl: string,
        type: string,
        topic: string
    ): Promise<string> {
        const domain = new URL(targetUrl).hostname.replace("www.", "").split(".")[0];

        switch (type) {
            case "branded":
                return domain.charAt(0).toUpperCase() + domain.slice(1);
            case "naked":
                return targetUrl.replace(/^https?:\/\//, "");
            case "generic":
                const generic = ["click here", "visit site", "this article", "source", "read more"];
                return generic[Math.floor(Math.random() * generic.length)];
            case "keyword":
            default:
                // Use AI to generate a relevant partial match keyword
                try {
                    const { text } = await generateText({
                        model: requesty("openai/gpt-4o-mini"),
                        prompt: `Generate a natural, short (2-4 words) anchor text for a backlink to a site about "${topic}". The domain is "${domain}". Type: Partial Match. Return only the text.`,
                    });
                    return text.trim();
                } catch {
                    return topic;
                }
        }
    }
}
