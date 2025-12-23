import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkPostGenerationLimit, incrementPostUsage } from "@/lib/usage-limits";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitCheck = await checkPostGenerationLimit(user.id);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { 
        error: limitCheck.message,
        usage: limitCheck.usage,
        limits: limitCheck.limits,
        percentUsed: limitCheck.percentUsed
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { articleId } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id, url, name, niche, target_audience, brand_voice, description")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .eq("site_id", site.id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const { data: existingArticles } = await supabase
    .from("articles")
    .select("id, title, slug, keyword")
    .eq("site_id", site.id)
    .neq("id", articleId)
    .not("content", "is", null);

  const outline = generateOutline(article.title, article.keyword, article.article_type);
  const content = await generateArticleContent(
    article.title,
    article.keyword,
    article.secondary_keywords || [],
    outline,
    site
  );

  const domain = site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname : "";
  const internalLinks = detectInternalLinks(content, existingArticles || [], domain);
  const externalLinks = generateExternalLinks(article.keyword);
  const images = generateImagePlaceholders(article.title, article.keyword);

  const htmlContent = generateHTML(content, article.title, images, internalLinks, externalLinks);
  const markdownContent = generateMarkdown(content, article.title, images, internalLinks, externalLinks);
  const metaDescription = await generateMetaDescription(article.keyword, article.title, site);
  const slug = article.slug || generateSlug(article.title);

  const cmsExports = {
    wordpress: {
      title: article.title,
      slug,
      content: htmlContent,
      excerpt: metaDescription,
      status: "draft",
      categories: [article.category || "Uncategorized"],
      tags: article.tags || [],
      featured_media: (images as unknown as { url: string }[])[0]?.url || null,
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

  const { data: updatedArticle, error } = await supabase
    .from("articles")
    .update({
      content,
      html_content: htmlContent,
      markdown_content: markdownContent,
      meta_description: metaDescription,
      slug,
      outline,
      internal_links: internalLinks,
      external_links: externalLinks,
      images,
      featured_image: (images as unknown as { url: string }[])[0]?.url || null,
      cms_exports: cmsExports,
      word_count: content.split(/\s+/).length,
      status: "generated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await incrementPostUsage(user.id);

  return NextResponse.json({
    article: updatedArticle,
    output: {
      title: article.title,
      meta_description: metaDescription,
      keyword_list: [article.keyword, ...(article.secondary_keywords || [])],
      outline,
      full_article: content,
      image_set: images,
      internal_links: internalLinks,
      external_links: externalLinks,
      html_version: htmlContent,
      markdown_version: markdownContent,
      cms_export_package: cmsExports,
    },
  });
}

function generateOutline(title: string, keyword: string, articleType: string): object {
  const outlines: Record<string, object> = {
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

async function generateArticleContent(
  title: string,
  keyword: string,
  secondaryKeywords: string[],
  outline: object,
  site: any
): Promise<string> {
  const sections = (outline as { sections: { title: string; wordCount: number }[] }).sections;
  let content = "";

  for (const section of sections) {
    content += `## ${section.title}\n\n`;
    const sectionContent = await generateSectionContent(section.title, keyword, secondaryKeywords, section.wordCount, site, title);
    content += sectionContent;
    content += "\n\n";
  }

  return content.trim();
}

async function generateSectionContent(
  sectionTitle: string,
  keyword: string,
  secondaryKeywords: string[],
  wordCount: number,
  site: any,
  articleTitle: string
): Promise<string> {
  try {
    const { text } = await generateText({
      model: requesty("openai/gpt-4o"),
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
- Brand Voice: ${site.brand_voice || "Empathetic, expert, and actionable"}
- Description: ${site.description || ""}

REQUIREMENTS:
1. "SMART CONTENT" STYLE: Use a conversational yet authoritative tone. Use metaphors, analogies, or practical examples to make points clear. Speak directly to the reader ("you").
2. EMPATHETIC & ACTIONABLE: Acknowledge the reader's pain points and provide specific, high-value advice. Avoid generic fluff or surface-level "professional" filler.
3. KEYWORD INTEGRATION: Naturally weave the primary and secondary keywords into the narrative.
4. STRUCTURE: Use short paragraphs (2-3 sentences), bold key terms for scannability, and use bullet points or numbered lists if it adds value.
5. FLOW: Ensure the section transitions logically and maintains high engagement.
6. NO TITLE: Do NOT include the section title or the article title in the output.

Generate the section content now:`,
      maxOutputTokens: Math.ceil(wordCount * 2),
    });

    return text.trim();
  } catch (error: any) {
    console.error("OpenAI generation error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return `[ERROR: ${errorMsg}] Content about ${keyword} related to ${sectionTitle}. This section covers important aspects of ${keyword} and provides valuable insights for readers. ${secondaryKeywords.length > 0 ? `Additionally, we explore related topics including ${secondaryKeywords.slice(0, 2).join(" and ")}.` : ""}`;
  }
}

function detectInternalLinks(content: string, existingArticles: { id: string; title: string; slug: string; keyword: string }[], domain: string): object[] {
  const links: object[] = [];

  for (const article of existingArticles.slice(0, 5)) {
    links.push({
      title: article.title,
      url: `https://${domain}/blog/${article.slug}`,
      anchor_text: article.keyword || article.title,
      context: `Related reading: ${article.title}`,
    });
  }

  return links;
}

function generateExternalLinks(keyword: string): object[] {
  const authoritative = [
    { domain: "wikipedia.org", name: "Wikipedia" },
    { domain: "google.com/support", name: "Google Support" },
    { domain: "hubspot.com", name: "HubSpot" },
    { domain: "moz.com", name: "Moz" },
    { domain: "semrush.com", name: "SEMrush" },
    { domain: "ahrefs.com", name: "Ahrefs" },
  ];

  return authoritative.slice(0, 4).map((source) => ({
    title: `${keyword} - ${source.name}`,
    url: `https://${source.domain}`,
    anchor_text: `Learn more about ${keyword}`,
    source: source.name,
    authority_score: 90 + Math.floor(Math.random() * 10),
  }));
}

function generateImagePlaceholders(title: string, keyword: string): object[] {
  const imageTypes = [
    { type: "featured", size: "1200x630" },
    { type: "inline", size: "800x450" },
    { type: "infographic", size: "800x1200" },
    { type: "diagram", size: "800x600" },
  ];

  return imageTypes.map((img, index) => ({
    id: `img-${index + 1}`,
    type: img.type,
    size: img.size,
    alt: `${title} - ${img.type} image`,
    caption: `Visual representation of ${keyword}`,
    url: `https://placehold.co/${img.size}/22C55E/FFFFFF?text=${encodeURIComponent(keyword.slice(0, 20))}`,
    placeholder: true,
  }));
}

function generateHTML(content: string, title: string, images: object[], internalLinks: object[], externalLinks: object[]): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
<article>
<h1>${title}</h1>
`;

  const sections = content.split("## ");
  for (let i = 1; i < sections.length; i++) {
    const [heading, ...paragraphs] = sections[i].split("\n\n");
    html += `<h2>${heading}</h2>\n`;

    if (i === 1 && (images as { url: string }[])[0]) {
      html += `<figure><img src="${(images as { url: string }[])[0].url}" alt="${(images as { alt: string }[])[0].alt}"><figcaption>${(images as { caption: string }[])[0].caption}</figcaption></figure>\n`;
    }

    for (const p of paragraphs) {
      if (p.trim()) {
        html += `<p>${p.trim()}</p>\n`;
      }
    }

    if (i === 2 && internalLinks.length > 0) {
      html += `<aside class="related-content"><h3>Related Articles</h3><ul>`;
      for (const link of internalLinks.slice(0, 3) as { url: string; anchor_text: string }[]) {
        html += `<li><a href="${link.url}">${link.anchor_text}</a></li>`;
      }
      html += `</ul></aside>\n`;
    }
  }

  if (externalLinks.length > 0) {
    html += `<section class="references"><h3>Further Reading</h3><ul>`;
    for (const link of externalLinks as { url: string; anchor_text: string; source: string }[]) {
      html += `<li><a href="${link.url}" target="_blank" rel="noopener">${link.source}</a></li>`;
    }
    html += `</ul></section>\n`;
  }

  html += `</article>\n</body>\n</html>`;
  return html;
}

function generateMarkdown(content: string, title: string, images: object[], internalLinks: object[], externalLinks: object[]): string {
  let md = `# ${title}\n\n`;

  if ((images as { url: string; alt: string }[])[0]) {
    md += `![${(images as { alt: string }[])[0].alt}](${(images as { url: string }[])[0].url})\n\n`;
  }

  md += content;

  if (internalLinks.length > 0) {
    md += `\n\n## Related Articles\n\n`;
    for (const link of internalLinks as { url: string; anchor_text: string }[]) {
      md += `- [${link.anchor_text}](${link.url})\n`;
    }
  }

  if (externalLinks.length > 0) {
    md += `\n\n## Further Reading\n\n`;
    for (const link of externalLinks as { url: string; source: string }[]) {
      md += `- [${link.source}](${link.url})\n`;
    }
  }

  return md;
}

async function generateMetaDescription(keyword: string, title: string, site: any): Promise<string> {
  try {
    const { text } = await generateText({
      model: requesty("openai/gpt-4o"),
      prompt: `Write a compelling, high-CTR "Smart Content" meta description for an article titled "${title}".

PRIMARY KEYWORD: ${keyword}
WEBSITE: ${site.name} (${site.niche})
AUDIENCE: ${site.target_audience}

REQUIREMENTS:
- Exact length: 140-155 characters.
- Tone: Empathetic, expert, and intriguing.
- Goal: Make the reader feel that this article is the definitive solution to their problem.
- Keywords: Naturally include the Primary Keyword.
- No quotes or special formatting.
- Active voice.

Write only the meta description text:`,
      maxOutputTokens: 100,
    });

    return text.trim().slice(0, 160);
  } catch (error) {
    console.error("Meta description generation error:", error);
    return `Discover everything you need to know about ${keyword}. Our comprehensive guide covers tips, strategies, and expert insights to help you succeed.`.slice(0, 160);
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}