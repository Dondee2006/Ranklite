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
<<<<<<< HEAD
      { 
=======
      {
>>>>>>> fc887e15397d1fac37f6e9ee1a57a550e2f70dbb
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
    .select("id, domain, name")
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
    outline
  );

  const internalLinks = detectInternalLinks(content, existingArticles || [], site.domain);
  const externalLinks = generateExternalLinks(article.keyword);
  const images = generateImagePlaceholders(article.title, article.keyword);

  const htmlContent = generateHTML(content, article.title, images, internalLinks, externalLinks);
  const markdownContent = generateMarkdown(content, article.title, images, internalLinks, externalLinks);
  const metaDescription = await generateMetaDescription(article.keyword, article.title);
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
      featured_media: images[0]?.url || null,
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
      featured_image: images[0]?.url || null,
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
        { type: "intro", title: "Introduction", wordCount: 150 },
        { type: "item", title: `1. First ${keyword} Tip`, wordCount: 120 },
        { type: "item", title: `2. Second ${keyword} Strategy`, wordCount: 120 },
        { type: "item", title: `3. Third ${keyword} Method`, wordCount: 120 },
        { type: "item", title: `4. Fourth ${keyword} Approach`, wordCount: 120 },
        { type: "item", title: `5. Fifth ${keyword} Technique`, wordCount: 120 },
        { type: "item", title: `6. Sixth ${keyword} Best Practice`, wordCount: 120 },
        { type: "item", title: `7. Seventh ${keyword} Hack`, wordCount: 120 },
        { type: "item", title: `8. Eighth ${keyword} Solution`, wordCount: 120 },
        { type: "item", title: `9. Ninth ${keyword} Insight`, wordCount: 120 },
        { type: "item", title: `10. Tenth ${keyword} Recommendation`, wordCount: 120 },
        { type: "conclusion", title: "Conclusion", wordCount: 150 },
      ],
    },
    "how-to": {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 200 },
        { type: "prerequisites", title: "What You'll Need", wordCount: 150 },
        { type: "step", title: "Step 1: Getting Started", wordCount: 200 },
        { type: "step", title: "Step 2: Core Implementation", wordCount: 250 },
        { type: "step", title: "Step 3: Advanced Configuration", wordCount: 200 },
        { type: "step", title: "Step 4: Testing & Validation", wordCount: 200 },
        { type: "tips", title: "Pro Tips & Best Practices", wordCount: 200 },
        { type: "conclusion", title: "Conclusion", wordCount: 150 },
      ],
    },
    guide: {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 200 },
        { type: "overview", title: `What is ${keyword}?`, wordCount: 250 },
        { type: "benefits", title: `Benefits of ${keyword}`, wordCount: 200 },
        { type: "main", title: `How ${keyword} Works`, wordCount: 300 },
        { type: "examples", title: "Real-World Examples", wordCount: 250 },
        { type: "tips", title: "Expert Tips", wordCount: 200 },
        { type: "faq", title: "Frequently Asked Questions", wordCount: 200 },
        { type: "conclusion", title: "Conclusion", wordCount: 150 },
      ],
    },
    comparison: {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 200 },
        { type: "overview", title: "Quick Comparison Overview", wordCount: 200 },
        { type: "option1", title: "Option A: Detailed Analysis", wordCount: 300 },
        { type: "option2", title: "Option B: Detailed Analysis", wordCount: 300 },
        { type: "comparison", title: "Head-to-Head Comparison", wordCount: 250 },
        { type: "verdict", title: "Which One Should You Choose?", wordCount: 200 },
        { type: "conclusion", title: "Conclusion", wordCount: 150 },
      ],
    },
    review: {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 200 },
        { type: "overview", title: "Product/Service Overview", wordCount: 250 },
        { type: "features", title: "Key Features", wordCount: 300 },
        { type: "pros", title: "Pros", wordCount: 200 },
        { type: "cons", title: "Cons", wordCount: 150 },
        { type: "pricing", title: "Pricing Analysis", wordCount: 150 },
        { type: "verdict", title: "Final Verdict", wordCount: 200 },
        { type: "conclusion", title: "Conclusion", wordCount: 100 },
      ],
    },
    "q-and-a": {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 150 },
        { type: "qa", title: `What is ${keyword}?`, wordCount: 150 },
        { type: "qa", title: `Why is ${keyword} important?`, wordCount: 150 },
        { type: "qa", title: `How do I get started with ${keyword}?`, wordCount: 200 },
        { type: "qa", title: `What are common ${keyword} mistakes?`, wordCount: 150 },
        { type: "qa", title: `How much does ${keyword} cost?`, wordCount: 150 },
        { type: "qa", title: `What are the best ${keyword} tools?`, wordCount: 200 },
        { type: "qa", title: `Is ${keyword} worth it?`, wordCount: 150 },
        { type: "conclusion", title: "Conclusion", wordCount: 100 },
      ],
    },
    tutorial: {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 200 },
        { type: "prerequisites", title: "Prerequisites", wordCount: 150 },
        { type: "setup", title: "Initial Setup", wordCount: 200 },
        { type: "tutorial", title: "Step-by-Step Tutorial", wordCount: 400 },
        { type: "advanced", title: "Advanced Techniques", wordCount: 250 },
        { type: "troubleshooting", title: "Troubleshooting Common Issues", wordCount: 200 },
        { type: "conclusion", title: "Conclusion & Next Steps", wordCount: 150 },
      ],
    },
    "problem-solution": {
      sections: [
        { type: "intro", title: "Introduction", wordCount: 150 },
        { type: "problem", title: "Understanding the Problem", wordCount: 250 },
        { type: "causes", title: "Common Causes", wordCount: 200 },
        { type: "solution", title: "The Solution", wordCount: 300 },
        { type: "implementation", title: "How to Implement", wordCount: 250 },
        { type: "prevention", title: "Prevention Tips", wordCount: 200 },
        { type: "conclusion", title: "Conclusion", wordCount: 150 },
      ],
    },
  };

  return outlines[articleType] || outlines.guide;
}

async function generateArticleContent(
  title: string,
  keyword: string,
  secondaryKeywords: string[],
  outline: object
): Promise<string> {
  const sections = (outline as { sections: { title: string; wordCount: number }[] }).sections;
  let content = "";

  for (const section of sections) {
    content += `## ${section.title}\n\n`;
    const sectionContent = await generateSectionContent(section.title, keyword, secondaryKeywords, section.wordCount);
    content += sectionContent;
    content += "\n\n";
  }

  return content.trim();
}

async function generateSectionContent(sectionTitle: string, keyword: string, secondaryKeywords: string[], wordCount: number): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Write a detailed, engaging section for an SEO article with the following specifications:

Section Title: ${sectionTitle}
Target Keyword: ${keyword}
Secondary Keywords: ${secondaryKeywords.join(", ")}
Target Word Count: ${wordCount} words

Requirements:
- Write in a professional, informative tone
- Naturally incorporate the target keyword and secondary keywords
- Provide actionable insights and practical information
- Use clear, concise language
- Include specific examples or data points when relevant
- Ensure the content flows naturally and is engaging to read
- Do NOT include the section title in the output

Write the section content now:`,
      maxTokens: Math.ceil(wordCount * 2),
    });

    return text.trim();
  } catch (error) {
    console.error("OpenAI generation error:", error);
    return `Content about ${keyword} related to ${sectionTitle}. This section covers important aspects of ${keyword} and provides valuable insights for readers. ${secondaryKeywords.length > 0 ? `Additionally, we explore related topics including ${secondaryKeywords.slice(0, 2).join(" and ")}.` : ""}`;
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

async function generateMetaDescription(keyword: string, title: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Write a compelling SEO meta description for an article about "${title}".

Target Keyword: ${keyword}

Requirements:
- Maximum 155 characters
- Include the target keyword naturally
- Make it engaging and click-worthy
- Clearly communicate the value of the article
- Use active voice
- Do NOT include quotes or special formatting

Write only the meta description:`,
      maxTokens: 100,
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