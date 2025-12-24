import { requesty } from "@/lib/ai";
import { generateText } from "ai";
import { marked } from "marked";
import { generateAndUploadImage, ImageStyle } from "@/lib/image-gen";

export interface ArticleEngineOptions {
    site: any;
    settings: any;
    article: any;
    existingArticles: any[];
}

export class ArticleEngine {
    static async generateCompleteArticle(options: ArticleEngineOptions) {
        const { site, settings, article, existingArticles } = options;

        // 1. Generate Outline
        const outline = this.generateOutline(article.title, article.keyword, article.article_type);

        // 2. Search Video
        const youtubeVideoId = settings?.youtube_video ? await this.searchYouTubeVideo(article.keyword, article.title) : null;

        // 3. Generate Content
        const content = await this.generateArticleContent(
            article.title,
            article.keyword,
            article.secondary_keywords || [],
            outline,
            site,
            settings,
            youtubeVideoId
        );

        // 4. Links & Images
        const domain = site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname : "";
        const internalLinks = this.detectInternalLinks(content, existingArticles || [], domain, settings?.internal_links);
        const externalLinks = this.generateExternalLinks(article.keyword);
        const images = await this.generateImageSet(article.title, article.keyword, settings);

        // 5. Formats
        const htmlContent = this.generateHTML(content, article.title, images, internalLinks, externalLinks, settings);
        const markdownContent = this.generateMarkdown(content, article.title, images, internalLinks, externalLinks);
        const metaDescription = await this.generateMetaDescription(article.keyword, article.title, site);
        const slug = article.slug || this.generateSlug(article.title);

        // 6. CMS Exports
        const cmsExports = {
            wordpress: {
                title: article.title,
                slug,
                content: htmlContent,
                excerpt: metaDescription,
                status: "draft",
                categories: [article.category || "Uncategorized"],
                tags: article.tags || [],
                featured_media: (images as any[])[0]?.url || null,
            },
            shopify: {
                title: article.title,
                handle: slug,
                body_html: htmlContent,
                summary_html: `<p>${metaDescription}</p>`,
                tags: (article.tags || []).join(", "),
                image: images[0] || null,
            },
        };

        return {
            content,
            htmlContent,
            markdownContent,
            metaDescription,
            slug,
            outline,
            internalLinks,
            externalLinks,
            images,
            cmsExports,
            wordCount: content.split(/\s+/).length
        };
    }

    static generateOutline(title: string, keyword: string, articleType: string): any {
        const outlines: Record<string, any> = {
            listicle: {
                sections: [
                    { type: "intro", title: "Introduction & Theoretical Framework", wordCount: 300 },
                    { type: "item", title: `1. The ${keyword} Foundation`, wordCount: 200 },
                    { type: "item", title: `2. Strategic ${keyword} Implementation`, wordCount: 200 },
                    { type: "item", title: `3. Advanced ${keyword} Methodologies`, wordCount: 200 },
                    { type: "item", title: `4. Optimizing ${keyword} for Growth`, wordCount: 200 },
                    { type: "item", title: `5. Essential ${keyword} Tooling`, wordCount: 200 },
                    { type: "item", title: `6. ${keyword} Psychology and User Intent`, wordCount: 200 },
                    { type: "item", title: `7. Data-Driven ${keyword} Analytics`, wordCount: 200 },
                    { type: "item", title: `8. Case Study: ${keyword} in Practice`, wordCount: 200 },
                    { type: "item", title: `9. Common ${keyword} Pitfalls and Resilience`, wordCount: 200 },
                    { type: "item", title: `10. The Future of ${keyword} Trends`, wordCount: 200 },
                    { type: "item", title: `11. Scalability and ${keyword}`, wordCount: 200 },
                    { type: "item", title: `12. ${keyword} for High-Performance Teams`, wordCount: 200 },
                    { type: "item", title: `13. Ethical Considerations in ${keyword}`, wordCount: 200 },
                    { type: "item", title: `14. Competitive Edge through ${keyword}`, wordCount: 200 },
                    { type: "item", title: `15. Final ${keyword} Masterclass Tips`, wordCount: 200 },
                    { type: "conclusion", title: "Conclusion & Strategic Roadmap", wordCount: 300 },
                ],
            },
            "how-to": {
                sections: [
                    { type: "intro", title: "Introduction: Why This Process Matters", wordCount: 300 },
                    { type: "prerequisites", title: "Comprehensive Prerequisites & Environment Setup", wordCount: 300 },
                    { type: "step", title: "Phase 1: Discovery & Strategy Alignment", wordCount: 350 },
                    { type: "step", title: "Phase 2: Initial Execution and Core Mechanics", wordCount: 400 },
                    { type: "step", title: "Phase 3: Advanced Optimization Techniques", wordCount: 400 },
                    { type: "step", title: "Phase 4: Scaling and Automation", wordCount: 350 },
                    { type: "step", title: "Phase 5: Monitoring, Analytics, and KPI Tracking", wordCount: 350 },
                    { type: "step", title: "Phase 6: Troubleshooting & Common Roadblocks", wordCount: 350 },
                    { type: "tips", title: "Industry Secrets & Professional Best Practices", wordCount: 350 },
                    { type: "conclusion", title: "Conclusion: Achieving Mastery", wordCount: 250 },
                ],
            },
            guide: {
                sections: [
                    { type: "intro", title: "Executive Summary & Introduction", wordCount: 300 },
                    { type: "overview", title: `Deep Dive: What is ${keyword} Really?`, wordCount: 400 },
                    { type: "benefits", title: `The Multi-Dimensional Benefits of ${keyword}`, wordCount: 350 },
                    { type: "main", title: `The Mechanics of ${keyword}: A Technical Overview`, wordCount: 400 },
                    { type: "strategy", title: `Designing a High-Impact ${keyword} Strategy`, wordCount: 400 },
                    { type: "examples", title: "In-Depth Real-World Case Studies", wordCount: 400 },
                    { type: "tips", title: "Expert Tips for Sustained Success", wordCount: 350 },
                    { type: "faq", title: "Comprehensive FAQ & Expert Clarifications", wordCount: 350 },
                    { type: "conclusion", title: "Final Summary & Next Steps", wordCount: 300 },
                ],
            },
            comparison: {
                sections: [
                    { type: "intro", title: "Critical Comparison Introduction", wordCount: 300 },
                    { type: "overview", title: "Market Landscape & Contextual Overview", wordCount: 300 },
                    { type: "option1", title: "Primary Solution: Comprehensive Analysis", wordCount: 500 },
                    { type: "option2", title: "Secondary Competitors: Feature Breakdown", wordCount: 500 },
                    { type: "comparison", title: "Head-to-Head: Performance, Cost, & Scalability", wordCount: 450 },
                    { type: "user_experience", title: "UX and Integration Depth Comparison", wordCount: 400 },
                    { type: "verdict", title: "The Definitive Verdict: Which Should You Choose?", wordCount: 350 },
                    { type: "conclusion", title: "Final Recommendations", wordCount: 250 },
                ],
            },
            review: {
                sections: [
                    { type: "intro", title: "Unbiased Review Introduction", wordCount: 300 },
                    { type: "overview", title: "Full Product/Service Ecosystem Overview", wordCount: 350 },
                    { type: "features", title: "Deep Feature Analysis & Capability Check", wordCount: 450 },
                    { type: "usability", title: "User Experience and Interface deep-dive", wordCount: 400 },
                    { type: "pros", title: "The Highs: What Sets It Apart (Pros)", wordCount: 350 },
                    { type: "cons", title: "The Lows: Where It Falls Short (Cons)", wordCount: 300 },
                    { type: "pricing", title: "ROI & Pricing Structural Analysis", wordCount: 300 },
                    { type: "verdict", title: "The Final Verdict & Recommendation Score", wordCount: 350 },
                    { type: "conclusion", title: "Closing Thoughts", wordCount: 200 },
                ],
            },
            "q-and-a": {
                sections: [
                    { type: "intro", title: "Comprehensive Q&A Introduction", wordCount: 250 },
                    { type: "qa", title: `Defining the Scope: What is ${keyword}?`, wordCount: 350 },
                    { type: "qa", title: `The Strategic 'Why': Is ${keyword} Essential?`, wordCount: 350 },
                    { type: "qa", title: `Implementation: How Do I Master ${keyword}?`, wordCount: 400 },
                    { type: "qa", title: `Common Roadblocks: Fixing ${keyword} Issues`, wordCount: 350 },
                    { type: "qa", title: `Cost vs Value: Analyzing ${keyword} ROI`, wordCount: 300 },
                    { type: "qa", title: `The Stack: Top ${keyword} Tools & Resources`, wordCount: 350 },
                    { type: "qa", title: `Future-Proofing: Is ${keyword} Sustainable?`, wordCount: 350 },
                    { type: "qa", title: "Expert Opinions & Industry Predictions", wordCount: 350 },
                    { type: "conclusion", title: "Conclusion: Final Takeaways", wordCount: 200 },
                ],
            },
            tutorial: {
                sections: [
                    { type: "intro", title: "Masterclass Introduction", wordCount: 300 },
                    { type: "prerequisites", title: "The Technical Foundation & Tools Required", wordCount: 350 },
                    { type: "setup", title: "Environment Configuration & Setup Phase", wordCount: 350 },
                    { type: "tutorial", title: "Step-by-Step Execution: The Core Workflow", wordCount: 600 },
                    { type: "advanced", title: "Advanced Optimizations and Pro Maneuvers", wordCount: 450 },
                    { type: "scenarios", title: "Real-World Scenarios and Adaptations", wordCount: 400 },
                    { type: "troubleshooting", title: "Solving Edge Cases and Common Bugs", wordCount: 350 },
                    { type: "conclusion", title: "Conclusion: Graduation and Next Steps", wordCount: 300 },
                ],
            },
            "problem-solution": {
                sections: [
                    { type: "intro", title: "Problem Context & Impact Analysis", wordCount: 350 },
                    { type: "problem", title: "The Root Cause: Why Most People Fail with ${keyword}", wordCount: 450 },
                    { type: "symptoms", title: "Identifying the Symptoms in Your Current Setup", wordCount: 350 },
                    { type: "solution", title: "The Definitive Solution: A New Paradigm", wordCount: 600 },
                    { type: "implementation", title: "Execution Roadmap: From Crisis to Success", wordCount: 450 },
                    { type: "validation", title: "Validating the Fix and Measuring Results", wordCount: 350 },
                    { type: "prevention", title: "Building Long-Term Resilience & Prevention", wordCount: 350 },
                    { type: "conclusion", title: "Conclusion: Peace of Mind Achieved", wordCount: 250 },
                ],
            },
        };

        return outlines[articleType] || outlines.guide;
    }

    static async generateArticleContent(
        title: string,
        keyword: string,
        secondaryKeywords: string[],
        outline: any,
        site: any,
        settings: any,
        youtubeVideoId?: string | null
    ): Promise<string> {
        const sections = outline.sections;
        let content = "";

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            content += `## ${section.title}\n\n`;
            const sectionContent = await this.generateSectionContent(section.title, keyword, secondaryKeywords, section.wordCount, site, title, settings);
            content += sectionContent;
            content += "\n\n";

            if (i === 0 && settings?.youtube_video && youtubeVideoId) {
                content += `<!-- YOUTUBE:${youtubeVideoId} -->\n\n`;
            }
        }

        return content.trim();
    }

    static async generateSectionContent(
        sectionTitle: string,
        keyword: string,
        secondaryKeywords: string[],
        wordCount: number,
        site: any,
        articleTitle: string,
        settings: any
    ): Promise<string> {
        try {
            const { text } = await generateText({
                model: requesty("openai/gpt-4o-mini"),
                prompt: `Write a "Smart Content" section for an SEO article that readers actually enjoy.

ARTICLE TITLE: ${articleTitle}
SECTION TITLE: ${sectionTitle}
PRIMARY KEYWORD: ${keyword}
SECONDARY KEYWORDS: ${secondaryKeywords.join(", ")}
TARGET LENGTH: ~${wordCount} words

WEBSITE CONTEXT:
- Site Name: ${site.name}
- Niche: ${site.niche || "General"}
- Target Audience: ${site.target_audience || "General readers"}
- Brand Voice: ${settings?.article_style || site.brand_voice || "Empathetic, expert, and actionable"}
- Description: ${site.description || ""}

${settings?.global_instructions ? `CUSTOM INSTRUCTIONS:
${settings.global_instructions}` : ""}

REQUIREMENTS:
1. "SMART CONTENT" STYLE: Use a ${settings?.article_style?.toLowerCase() || "conversational"} yet authoritative tone. Use metaphors, analogies, or practical examples to make points clear. Speak directly to the reader ("you").
2. EMPATHETIC & ACTIONABLE: Acknowledge the reader's pain points and provide specific, high-value advice. Avoid generic fluff or surface-level "professional" filler.
3. KEYWORD INTEGRATION (CRITICAL):
   - Use the PRIMARY keyword "${keyword}" ONLY 1-2 times in this section
   - Use SYNONYMS and related concepts instead of repeating the exact keyword
   - Naturally incorporate secondary keywords: ${secondaryKeywords.join(", ")}
4. STRUCTURE: Use short paragraphs (2-3 sentences), bold key terms for scannability, and use bullet points or numbered lists if it adds value.
${settings?.include_emojis ? '5. EMOJIS: Include appropriate emojis naturally throughout the text to increase engagement.' : ''}
${settings?.include_emojis ? '6' : '5'}. FLOW: Ensure the section transitions logically and maintains high engagement.
${settings?.include_emojis ? '7' : '6'}. NO TITLE: Do NOT include the section title or the article title in the output.

Generate the section content now:`,
                maxOutputTokens: Math.ceil(wordCount * 2),
            });

            return text.trim();
        } catch (error: any) {
            console.error("OpenAI generation error:", error);
            return `[ERROR: ${error instanceof Error ? error.message : "Unknown error"}] Content about ${keyword}.`;
        }
    }

    static detectInternalLinks(content: string, existingArticles: any[], domain: string, limitSetting?: string): any[] {
        const limitMatch = limitSetting?.match(/\d+/);
        const limit = limitMatch ? parseInt(limitMatch[0]) : 3;

        return existingArticles.slice(0, limit).map(article => ({
            title: article.title,
            url: `https://${domain}/blog/${article.slug}`,
            anchor_text: article.keyword || article.title,
            context: `Related reading: ${article.title}`,
        }));
    }

    static generateExternalLinks(keyword: string): any[] {
        const sources = [
            { domain: "wikipedia.org", name: "Wikipedia" },
            { domain: "hubspot.com", name: "HubSpot" },
            { domain: "moz.com", name: "Moz" },
            { domain: "semrush.com", name: "SEMrush" },
        ];

        return sources.map(source => ({
            title: `${keyword} - ${source.name}`,
            url: `https://${source.domain}`,
            anchor_text: `Learn more about ${keyword}`,
            source: source.name,
            authority_score: 90 + Math.floor(Math.random() * 10),
        }));
    }

    static async searchYouTubeVideo(keyword: string, title: string): Promise<string | null> {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) return null;

        try {
            const searchQuery = encodeURIComponent(`${keyword} tutorial guide`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=medium&videoDefinition=high&maxResults=1&key=${apiKey}`;
            const res = await fetch(url);
            const data = await res.json();
            return data.items?.[0]?.id?.videoId || null;
        } catch {
            return null;
        }
    }

    static async generateImageSet(title: string, keyword: string, settings: any): Promise<any[]> {
        const imageTypes = [
            { type: "featured", size: "1792x1024" as const, prompt: `Featured image for "${title}" themed on ${keyword}.` },
            { type: "inline", size: "1024x1024" as const, prompt: `Inline image for ${keyword}.` },
        ];

        const brandColor = settings?.brand_color || '#22C55E';
        const imageStyle = (settings?.image_style || 'brand-text') as ImageStyle;

        return Promise.all(imageTypes.map(async (img, index) => {
            const publicUrl = await generateAndUploadImage({
                prompt: img.prompt,
                style: imageStyle,
                brandColor,
                size: img.size,
            });

            return {
                id: `img-${index + 1}`,
                type: img.type,
                size: img.size,
                alt: `${title} - ${img.type} image`,
                caption: `Visual of ${keyword}`,
                url: publicUrl || `https://placehold.co/${img.size.replace('x', 'x')}/${brandColor.replace('#', '')}/FFFFFF?text=${encodeURIComponent(keyword)}`,
                placeholder: !publicUrl,
            };
        }));
    }

    static generateHTML(content: string, title: string, images: any[], internalLinks: any[], externalLinks: any[], settings: any): string {
        let parsedContent = marked.parse(content) as string;

        parsedContent = parsedContent.replace(/<!--\s*YOUTUBE:([a-zA-Z0-9_-]+)\s*-->/g, (_, videoId) => {
            return `<div class="video-container" style="margin: 2rem 0; aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
        });

        let html = `<!DOCTYPE html><html><head><title>${title}</title></head><body><article><h1>${title}</h1>`;

        if (images[0]) {
            html += `<figure><img src="${images[0].url}" alt="${images[0].alt}"><figcaption>${images[0].caption}</figcaption></figure>`;
        }

        html += parsedContent;

        if (internalLinks.length > 0) {
            html += `<h3>Related Articles</h3><ul>` + internalLinks.map(l => `<li><a href="${l.url}">${l.anchor_text}</a></li>`).join('') + `</ul>`;
        }

        if (externalLinks.length > 0) {
            html += `<h3>Further Reading</h3><ul>` + externalLinks.map(l => `<li><a href="${l.url}" target="_blank">${l.source}</a></li>`).join('') + `</ul>`;
        }

        if (settings?.call_to_action) {
            html += `<section class="cta" style="margin-top: 4rem; padding: 3rem; background: ${settings.brand_color || '#10b981'}; color: white; border-radius: 1.5rem; text-align: center;"><a href="/signup" style="background: white; color: ${settings.brand_color || '#10b981'}; padding: 1rem 2rem; border-radius: 0.75rem;">Get Started &rarr;</a></section>`;
        }

        html += `</article></body></html>`;
        return html;
    }

    static generateMarkdown(content: string, title: string, images: any[], internalLinks: any[], externalLinks: any[]): string {
        let md = `# ${title}\n\n`;
        if (images[0]) md += `![${images[0].alt}](${images[0].url})\n\n`;
        md += content;
        if (internalLinks.length > 0) md += `\n\n## Related\n\n` + internalLinks.map(l => `- [${l.anchor_text}](${l.url})`).join('\n');
        return md;
    }

    static async generateMetaDescription(keyword: string, title: string, site: any): Promise<string> {
        try {
            const { text } = await generateText({
                model: requesty("openai/gpt-4o-mini"),
                prompt: `Write meta description for "${title}" using keyword "${keyword}". 140-155 chars.`,
                maxOutputTokens: 50,
            });
            return text.trim().slice(0, 160);
        } catch {
            return `Learn about ${keyword} in our guide to ${title}.`.slice(0, 160);
        }
    }

    static generateSlug(title: string): string {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
}
