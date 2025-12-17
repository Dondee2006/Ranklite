/**
 * Link Suggestion Engine
 * Uses AI to generate internal linking suggestions
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface PageData {
    url: string;
    title: string;
    textContent: string;
}

export interface LinkSuggestion {
    sourceUrl: string;
    targetUrl: string;
    anchorText: string;
    relevanceScore: number;
    reasoning: string;
}

/**
 * Generate internal link suggestions using AI
 */
export async function generateLinkSuggestions(
    pages: PageData[],
    maxSuggestions = 50
): Promise<LinkSuggestion[]> {
    if (pages.length < 2) {
        return [];
    }

    const prompt = buildPrompt(pages, maxSuggestions);

    try {
        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt,
            temperature: 0.7,

        });

        return parseSuggestions(text);
    } catch (error) {
        console.error('Error generating link suggestions:', error);
        throw new Error(`Failed to generate link suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Build the prompt for the AI model
 */
function buildPrompt(pages: PageData[], maxSuggestions: number): string {
    // Truncate content to avoid token limits
    const truncatedPages = pages.map(page => ({
        url: page.url,
        title: page.title,
        excerpt: page.textContent.substring(0, 800), // First 800 chars
    }));

    return `You are an SEO expert specializing in internal linking strategies. Analyze the following pages and suggest internal linking opportunities.

PAGES:
${truncatedPages.map((page, idx) => `
${idx + 1}. URL: ${page.url}
   Title: ${page.title}
   Content Excerpt: ${page.excerpt}
`).join('\n')}

TASK:
Generate up to ${maxSuggestions} internal link suggestions that would improve SEO and user experience. For each suggestion:
1. Identify a source page and target page
2. Suggest natural anchor text (2-5 words)
3. Provide a relevance score (0-100)
4. Explain why this link makes sense

RULES:
- Only suggest links between pages in the list above
- Anchor text should be natural and contextually relevant
- Prioritize topical relevance and user value
- Avoid over-optimization (no exact match keywords unless natural)
- Consider semantic relationships between topics

OUTPUT FORMAT (JSON array):
[
  {
    "sourceUrl": "full URL of source page",
    "targetUrl": "full URL of target page",
    "anchorText": "natural anchor text",
    "relevanceScore": 85,
    "reasoning": "Brief explanation of why this link is valuable"
  }
]

Return ONLY the JSON array, no additional text.`;
}

/**
 * Parse AI response into structured suggestions
 */
function parseSuggestions(response: string): LinkSuggestion[] {
    try {
        // Extract JSON from response (handle cases where AI adds extra text)
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }

        // Validate and normalize suggestions
        return parsed
            .filter(isValidSuggestion)
            .map(normalizeSuggestion)
            .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
    } catch (error) {
        console.error('Error parsing suggestions:', error);
        console.error('Raw response:', response);
        return [];
    }
}

/**
 * Validate a suggestion object
 */
function isValidSuggestion(suggestion: unknown): boolean {
    const s = suggestion as Record<string, unknown>;
    return (
        typeof s === 'object' &&
        s !== null &&
        typeof s.sourceUrl === 'string' &&
        typeof s.targetUrl === 'string' &&
        typeof s.anchorText === 'string' &&
        typeof s.relevanceScore === 'number' &&
        s.sourceUrl !== s.targetUrl &&
        s.relevanceScore >= 0 &&
        s.relevanceScore <= 100
    );
}

/**
 * Normalize a suggestion object
 */
function normalizeSuggestion(suggestion: unknown): LinkSuggestion {
    const s = suggestion as {
        sourceUrl: string;
        targetUrl: string;
        anchorText: string;
        relevanceScore: number;
        reasoning?: string;
    };
    return {
        sourceUrl: s.sourceUrl.trim(),
        targetUrl: s.targetUrl.trim(),
        anchorText: s.anchorText.trim(),
        relevanceScore: Math.min(100, Math.max(0, Math.round(s.relevanceScore))),
        reasoning: (s.reasoning || '').trim(),
    };
}

/**
 * Calculate relevance score based on content similarity
 * (Fallback method if AI doesn't provide scores)
 */
export function calculateRelevanceScore(
    sourceContent: string,
    targetContent: string
): number {
    // Simple keyword overlap scoring
    const sourceWords = new Set(
        sourceContent.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );
    const targetWords = new Set(
        targetContent.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );

    const intersection = new Set(
        [...sourceWords].filter(word => targetWords.has(word))
    );

    const similarity = intersection.size / Math.max(sourceWords.size, targetWords.size);
    return Math.round(similarity * 100);
}

/**
 * Batch pages for processing (to avoid token limits)
 */
export function batchPages(pages: PageData[], batchSize = 20): PageData[][] {
    const batches: PageData[][] = [];
    for (let i = 0; i < pages.length; i += batchSize) {
        batches.push(pages.slice(i, i + batchSize));
    }
    return batches;
}
