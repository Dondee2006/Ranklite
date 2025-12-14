import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, url")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: settings } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  if (!settings || !settings.enabled) {
    return NextResponse.json({ success: false, message: "Autopilot disabled" });
  }

  const now = new Date();
  const hourUtc = now.getUTCHours();
  const startHour = settings.publish_time_start ?? 7;
  const endHour = settings.publish_time_end ?? 9;
  const withinWindow = startHour <= endHour
    ? hourUtc >= startHour && hourUtc <= endHour
    : hourUtc >= startHour || hourUtc <= endHour;

  if (!withinWindow) {
    return NextResponse.json({ success: false, message: "Outside publish window" });
  }

  const today = now.toISOString().split("T")[0];

  const { data: publishedToday, error: publishedError } = await supabase
    .from("articles")
    .select("id")
    .eq("site_id", site.id)
    .eq("scheduled_date", today)
    .eq("status", "published");

  if (publishedError) {
    return NextResponse.json({ error: publishedError.message }, { status: 500 });
  }

  const alreadyPublished = publishedToday?.length || 0;
  const targetCount = Math.max(settings.articles_per_day || 1, 1);

  if (alreadyPublished >= targetCount) {
    return NextResponse.json({ success: true, message: "Already published for today" });
  }

  const remaining = targetCount - alreadyPublished;

  const { data: candidates } = await supabase
    .from("articles")
    .select("*")
    .eq("site_id", site.id)
    .eq("scheduled_date", today)
    .in("status", ["planned", "generated", "draft"])
    .limit(remaining);

  const seedsNeeded = remaining - (candidates?.length || 0);
  const seedKeywords = generateKeywordsForNiche(site.name || "your niche", seedsNeeded);
  const newArticles: Array<{ id: string; title: string; slug: string; keyword: string; status: string }> = [];

  for (let i = 0; i < seedsNeeded; i++) {
    const articleType = pickArticleType(settings.preferred_article_types);
    const keyword = seedKeywords[i] || `${site.name || "brand"} guide`;
    const title = generateTitle(keyword, articleType);
    const searchIntent = determineSearchIntent(articleType);
    const { data: inserted } = await supabase
      .from("articles")
      .insert({
        site_id: site.id,
        title,
        slug: generateSlug(title),
        keyword,
        secondary_keywords: generateSecondaryKeywords(keyword),
        search_intent: searchIntent,
        article_type: articleType,
        word_count: 1500,
        cta_placement: "end",
        status: "planned",
        scheduled_date: today,
      })
      .select()
      .single();

    if (inserted) {
      newArticles.push(inserted);
    }
  }

  const toPublish = [...(candidates || []), ...newArticles].slice(0, remaining);

  if (!toPublish.length) {
    return NextResponse.json({ success: false, message: "Nothing to publish" });
  }

  const published: Array<Record<string, unknown>> = [];

  for (const article of toPublish) {
    const { data: existingArticles } = await supabase
      .from("articles")
      .select("id, title, slug, keyword")
      .eq("site_id", site.id)
      .neq("id", article.id)
      .not("content", "is", null);

    const outline = generateOutline(article.title, article.keyword, article.article_type);
    const content = article.content && article.status === "generated" ? article.content : generateArticleContent(
      article.title,
      article.keyword,
      article.secondary_keywords || [],
      outline
    );

    const internalLinks = detectInternalLinks(content, existingArticles || [], site.url || "");
    const externalLinks = generateExternalLinks(article.keyword);
    const images = generateImagePlaceholders(article.title, article.keyword);
    const htmlContent = generateHTML(content, article.title, images, internalLinks, externalLinks);
    const markdownContent = generateMarkdown(content, article.title, images, internalLinks, externalLinks);
    const metaDescription = generateMetaDescription(article.keyword);
    const slug = article.slug || generateSlug(article.title);

    const cmsExports = {
      wordpress: {
        title: article.title,
        slug,
        content: htmlContent,
        excerpt: metaDescription,
        status: "publish",
        categories: [article.category || "Blog"],
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

    const { data: updated, error } = await supabase
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
        status: "published",
        published_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", article.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    published.push(updated);
  }

  return NextResponse.json({ success: true, published_count: published.length, articles: published });
}

function pickArticleType(preferred: string[] | null | undefined) {
  if (preferred && preferred.length) {
    const index = Math.floor(Math.random() * preferred.length);
    return preferred[index];
  }
  return selectArticleType();
}

function selectArticleType(): string {
  const types = [
    { type: "listicle", weight: 20 },
    { type: "how-to", weight: 25 },
    { type: "guide", weight: 20 },
    { type: "comparison", weight: 10 },
    { type: "review", weight: 10 },
    { type: "q-and-a", weight: 5 },
    { type: "tutorial", weight: 5 },
    { type: "problem-solution", weight: 5 },
  ];

  const total = types.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * total;
  for (const t of types) {
    random -= t.weight;
    if (random <= 0) return t.type;
  }
  return "guide";
}

function generateKeywordsForNiche(niche: string, count: number) {
  const templates = [
    `best ${niche}`,
    `${niche} guide`,
    `how to ${niche}`,
    `${niche} tips`,
    `${niche} for beginners`,
    `advanced ${niche}`,
    `${niche} strategies`,
    `${niche} tools`,
    `${niche} examples`,
    `${niche} best practices`,
    `${niche} tutorial`,
    `${niche} review`,
    `${niche} comparison`,
    `${niche} alternatives`,
    `${niche} mistakes`,
    `${niche} benefits`,
    `${niche} vs`,
    `free ${niche}`,
    `${niche} checklist`,
    `${niche} templates`,
    `${niche} case study`,
    `${niche} statistics`,
    `${niche} trends 2025`,
    `${niche} software`,
    `${niche} services`,
    `top ${niche}`,
    `${niche} pricing`,
    `${niche} features`,
    `${niche} solutions`,
    `${niche} workflow`,
  ];

  return templates.slice(0, Math.max(count, 0));
}

function generateTitle(keyword: string, articleType: string): string {
  const templates: Record<string, string[]> = {
    listicle: [
      `10 Best ${capitalizeFirst(keyword)} Tips for 2025`,
      `7 ${capitalizeFirst(keyword)} Strategies That Actually Work`,
      `15 Proven Ways to Master ${capitalizeFirst(keyword)}`,
      `12 ${capitalizeFirst(keyword)} Ideas You Haven't Tried`,
    ],
    comparison: [
      `${capitalizeFirst(keyword)}: Complete Comparison Guide`,
      `${capitalizeFirst(keyword)} vs Alternatives: Honest Review`,
      `Comparing the Best ${capitalizeFirst(keyword)} Options`,
    ],
    "how-to": [
      `How to ${capitalizeFirst(keyword)}: Step-by-Step Guide`,
      `How to ${capitalizeFirst(keyword)} (Complete 2025 Guide)`,
      `The Right Way to ${capitalizeFirst(keyword)}`,
    ],
    guide: [
      `Ultimate Guide to ${capitalizeFirst(keyword)}`,
      `The Complete ${capitalizeFirst(keyword)} Guide for 2025`,
      `${capitalizeFirst(keyword)}: Everything You Need to Know`,
    ],
    review: [
      `${capitalizeFirst(keyword)} Review: Is It Worth It?`,
      `Honest ${capitalizeFirst(keyword)} Review 2025`,
      `${capitalizeFirst(keyword)}: Pros, Cons & Verdict`,
    ],
    "q-and-a": [
      `${capitalizeFirst(keyword)}: Your Questions Answered`,
      `FAQ: Everything About ${capitalizeFirst(keyword)}`,
      `${capitalizeFirst(keyword)} Q&A: Expert Answers`,
    ],
    tutorial: [
      `${capitalizeFirst(keyword)} Tutorial for Beginners`,
      `Master ${capitalizeFirst(keyword)}: Complete Tutorial`,
      `Learn ${capitalizeFirst(keyword)} in 30 Minutes`,
    ],
    "problem-solution": [
      `${capitalizeFirst(keyword)} Problems? Here's How to Fix Them`,
      `Solving Common ${capitalizeFirst(keyword)} Issues`,
      `${capitalizeFirst(keyword)} Not Working? Try This`,
    ],
  };

  const options = templates[articleType] || templates.guide;
  return options[Math.floor(Math.random() * options.length)];
}

function determineSearchIntent(articleType: string): string {
  const intents: Record<string, string> = {
    listicle: "informational",
    comparison: "commercial",
    "how-to": "informational",
    guide: "informational",
    review: "commercial",
    "q-and-a": "informational",
    tutorial: "informational",
    "problem-solution": "transactional",
  };
  return intents[articleType] || "informational";
}

function generateSecondaryKeywords(primary: string): string[] {
  const variations = [
    `${primary} 2025`,
    `best ${primary}`,
    `${primary} tips`,
    `${primary} guide`,
    `how to ${primary}`,
  ];
  return variations.slice(0, 5);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

function generateArticleContent(
  title: string,
  keyword: string,
  secondaryKeywords: string[],
  outline: object
): string {
  const sections = (outline as { sections: { title: string; wordCount: number }[] }).sections;
  let content = "";

  for (const section of sections) {
    content += `## ${section.title}\n\n`;
    content += generateSectionContent(section.title, keyword, secondaryKeywords, section.wordCount);
    content += "\n\n";
  }

  return content.trim();
}

function generateSectionContent(sectionTitle: string, keyword: string, secondaryKeywords: string[], wordCount: number): string {
  const paragraphs = Math.ceil(wordCount / 80);
  let content = "";

  const templates = [
    `When it comes to ${keyword}, understanding the fundamentals is crucial for success. Many professionals in this field have discovered that taking a systematic approach yields the best results. The key is to focus on what truly matters and eliminate distractions that don't contribute to your goals.`,
    `${keyword} has become increasingly important in today's competitive landscape. Organizations that master these concepts gain a significant advantage over their competitors. By implementing proven strategies and staying up-to-date with industry trends, you can achieve remarkable outcomes.`,
    `One of the most effective ways to approach ${keyword} is to start with a solid foundation. This means understanding the core principles before diving into advanced techniques. Take the time to learn the basics, and you'll find that more complex concepts become much easier to grasp.`,
    `Research shows that successful implementation of ${keyword} requires both strategic planning and tactical execution. Without a clear roadmap, it's easy to get lost in the details and lose sight of your ultimate objectives. Creating a step-by-step plan helps ensure consistent progress.`,
    `The landscape of ${keyword} continues to evolve rapidly. What worked yesterday may not be as effective tomorrow, which is why staying informed about the latest developments is essential. Subscribe to industry publications, attend conferences, and network with other professionals to stay ahead.`,
    `Many experts recommend focusing on quality over quantity when it comes to ${keyword}. Instead of trying to do everything at once, concentrate on a few key areas and excel in those before expanding your efforts. This approach leads to more sustainable, long-term success.`,
    `Understanding your audience is fundamental to ${keyword} success. Take the time to research their needs, preferences, and pain points. This knowledge allows you to tailor your approach and deliver solutions that truly resonate with your target market.`,
    `Data-driven decision making is becoming increasingly important in ${keyword}. By tracking key metrics and analyzing results, you can identify what's working and what needs improvement. This iterative approach helps optimize your strategy over time.`,
  ];

  for (let i = 0; i < paragraphs; i++) {
    const template = templates[i % templates.length];
    content += template + "\n\n";

    if (secondaryKeywords.length > 0 && i % 2 === 0) {
      const secondaryKw = secondaryKeywords[i % secondaryKeywords.length];
      content += `Additionally, considering ${secondaryKw} can further enhance your results. Integrating these complementary concepts creates a more comprehensive approach that addresses multiple aspects of the challenge.\n\n`;
    }
  }

  return content.trim();
}

function detectInternalLinks(content: string, existingArticles: { id: string; title: string; slug: string; keyword: string }[], domain: string): object[] {
  const links: object[] = [];

  for (const article of existingArticles.slice(0, 5)) {
    links.push({
      title: article.title,
      url: domain ? `https://${domain}/blog/${article.slug}` : `/blog/${article.slug}`,
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

function generateMetaDescription(keyword: string): string {
  const templates = [
    `Discover everything you need to know about ${keyword}. Our comprehensive guide covers tips, strategies, and expert insights to help you succeed.`,
    `Learn ${keyword} with our detailed guide. Get actionable tips, best practices, and proven strategies from industry experts.`,
    `Master ${keyword} with this complete guide. Includes step-by-step instructions, examples, and expert recommendations for 2025.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)].slice(0, 160);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}