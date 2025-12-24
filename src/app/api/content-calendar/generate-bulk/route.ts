import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const ARTICLE_TYPES = [
  { type: "listicle", weight: 20 },
  { type: "how-to", weight: 25 },
  { type: "guide", weight: 20 },
  { type: "comparison", weight: 10 },
  { type: "review", weight: 10 },
  { type: "q-and-a", weight: 5 },
  { type: "tutorial", weight: 5 },
  { type: "problem-solution", weight: 5 },
];

const TARGET_ARTICLE_COUNT = 30;

function selectArticleType(): string {
  const total = ARTICLE_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * total;
  for (const t of ARTICLE_TYPES) {
    random -= t.weight;
    if (random <= 0) return t.type;
  }
  return "guide";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, year, niche, keywords, generateContent = true } = body;
  console.log("Generate Bulk Request:", { month, year, niche, keywords_count: keywords?.length, generateContent });

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, name")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  // Fetch article settings for this site
  const { data: settings } = await supabase
    .from("article_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  const startDate = new Date(year, month, 1);
  const today = new Date();
  const startDay = month === today.getMonth() && year === today.getFullYear()
    ? Math.max(today.getDate(), 1)
    : 1;
  startDate.setDate(startDay);
  const startDateStr = formatDate(startDate);

  await supabase
    .from("articles")
    .delete()
    .eq("site_id", site.id)
    .eq("status", "planned")
    .gte("scheduled_date", startDateStr);

  const { data: existingArticles, error: existingError } = await supabase
    .from("articles")
    .select("scheduled_date")
    .eq("site_id", site.id)
    .gte("scheduled_date", startDateStr);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const usedDates = new Set<string>((existingArticles || []).map(a => a.scheduled_date));

  // Phase 1: AI-Powered Topic Clustering
  const clustersData = await generateTopicClusters(niche || site.name, TARGET_ARTICLE_COUNT);

  const articles = [];
  const currentDate = new Date(startDate);
  let articleIndex = 0;

  // Flatten clusters into a sequence of 30 slots
  // We want to distribute Pillars first, then Spokes
  const planSlots: any[] = new Array(TARGET_ARTICLE_COUNT).fill(null);

  // Assign Pillars to Mondays (or first available day of week)
  let pillarIndex = 0;
  for (let i = 0; i < TARGET_ARTICLE_COUNT && pillarIndex < clustersData.length; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    if (d.getDay() === 1) { // Monday
      const cluster = clustersData[pillarIndex];
      planSlots[i] = {
        keyword: cluster.pillar.keyword,
        volume: cluster.pillar.volume,
        difficulty: cluster.pillar.difficulty,
        cluster_name: cluster.topic,
        is_pillar: true,
        article_type: "guide"
      };
      pillarIndex++;
    }
  }

  // Fill remaining slots with Spokes
  let currentClusterIdx = 0;
  let currentSpokeIdx = 0;
  for (let i = 0; i < TARGET_ARTICLE_COUNT; i++) {
    if (planSlots[i]) continue;

    // Find next available spoke
    while (currentClusterIdx < clustersData.length) {
      const cluster = clustersData[currentClusterIdx];
      if (currentSpokeIdx < cluster.spokes.length) {
        const spoke = cluster.spokes[currentSpokeIdx];
        planSlots[i] = {
          keyword: spoke.keyword,
          volume: spoke.volume,
          difficulty: spoke.difficulty,
          cluster_name: cluster.topic,
          is_pillar: false,
          article_type: selectArticleType()
        };
        currentSpokeIdx++;
        break;
      } else {
        currentClusterIdx++;
        currentSpokeIdx = 0;
      }
    }

    // Safety fallback if AI didn't give enough spokes
    if (!planSlots[i]) {
      planSlots[i] = {
        keyword: `${niche} article ${i}`,
        volume: 100 + Math.floor(Math.random() * 500),
        difficulty: 10 + Math.floor(Math.random() * 20),
        cluster_name: "General",
        is_pillar: false,
        article_type: selectArticleType()
      };
    }
  }

  // Phase 2: Generation Loop
  for (let i = 0; i < TARGET_ARTICLE_COUNT; i++) {
    const dateStr = formatDate(currentDate);
    if (usedDates.has(dateStr)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const slot = planSlots[i];
    const { keyword, volume, difficulty, cluster_name, is_pillar, article_type } = slot;
    const searchIntent = determineSearchIntent(article_type);
    const title = generateTitle(keyword, article_type);

    const articleData: Record<string, unknown> = {
      site_id: site.id,
      user_id: user.id, // Ensure user_id is set
      title,
      slug: generateSlug(title),
      keyword: keyword,
      secondary_keywords: generateSecondaryKeywords(keyword),
      search_intent: searchIntent,
      article_type,
      word_count: is_pillar ? 2500 + Math.floor(Math.random() * 500) : 1500 + Math.floor(Math.random() * 500),
      cta_placement: ["beginning", "middle", "end", "both"][Math.floor(Math.random() * 4)],
      status: "planned",
      scheduled_date: dateStr,
      cluster_name,
      is_pillar,
      volume,
      difficulty
    };

    if (generateContent) {
      try {
        const content = await generateArticleContent({
          title: articleData.title as string,
          keyword: articleData.keyword as string,
          secondaryKeywords: articleData.secondary_keywords as string[],
          articleType: articleData.article_type as string,
          wordCount: articleData.word_count as number,
          siteName: site.name,
          searchIntent: articleData.search_intent as string,
          settings: settings || {},
        });

        if (content) {
          articleData.content = content.content;
          articleData.html_content = content.htmlContent;
          articleData.markdown_content = content.markdownContent;
          articleData.meta_description = content.metaDescription;
          articleData.outline = content.outline;
          articleData.status = "generated";
          articleData.seo_score = (content.seoScore as number) || 85;
          articleData.readability_score = (content.readabilityScore as number) || 75;
        }
      } catch (error) {
        console.error(`Failed to generate content for article ${articles.length + 1}:`, error);
      }
    }

    articles.push(articleData);
    usedDates.add(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const { data, error } = await supabase
    .from("articles")
    .insert(articles)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

    return NextResponse.json({ success: true, articles: data, count: data?.length || 0 });
}

async function generateArticleContent(params: {
  title: string;
  keyword: string;
  secondaryKeywords: string[];
  articleType: string;
  wordCount: number;
  siteName: string;
  searchIntent: string;
  settings: any;
}): Promise<Record<string, unknown> | null> {
  const { settings } = params;

  const styleMap: Record<string, string> = {
    Informative: "Maintain a factual, educational, and objective tone. Focus on providing clear information and depth.",
    Conversational: "Write in a friendly, relatable, and engaging tone. Use 'you' and 'we' to connect with the reader.",
    Professional: "Use formal, sophisticated language. Maintain authority and industry-standard terminology.",
    Casual: "Keep it light, relaxed, and easy to read. Use simple language and a breezy pace."
  };

  const styleInstructions = styleMap[settings?.article_style as string] || "Professional and informative.";

  const prompt = `Write a comprehensive, SEO-optimized article with the following specifications:

Title: ${params.title}
Primary Keyword: ${params.keyword}
Secondary Keywords: ${params.secondaryKeywords.join(", ")}
Article Type: ${params.articleType}
Target Word Count: ${params.wordCount}
Search Intent: ${params.searchIntent}
Site Name: ${params.siteName}

TONE AND STYLE:
${styleInstructions}

${settings?.global_instructions ? `GLOBAL USER INSTRUCTIONS (CRITICAL):
${settings.global_instructions}` : ""}

ADDITIONAL REQUIREMENTS:
1. Write in a natural, engaging, human tone (avoid AI patterns).
2. Include proper heading structure (H2, H3).
3. Use the primary keyword naturally throughout.
4. Incorporate secondary keywords where relevant.
5. Include a compelling introduction and conclusion.
6. Add specific examples and actionable advice.
${settings?.include_emojis ? "7. STRATEGIC EMOJI USAGE: Use relevant emojis to enhance engagement and visual appeal throughout the text." : "7. Do not use emojis."}
${settings?.youtube_video ? "8. YOUTUBE VIDEO PLACEHOLDER: Find a highly relevant YouTube search query for this topic and include a placeholder in the format [YOUTUBE_VIDEO: Search Query] right after the first H2 section." : ""}
${settings?.call_to_action ? "9. CALL TO ACTION: Include a professional CTA section at the end of the article encouraging users to visit ${params.siteName}." : ""}
10. Write in markdown format.

Return a JSON object with:
{
  "content": "full article content in plain text",
  "htmlContent": "article in HTML format (use standard tags, no head/body tags)",
  "markdownContent": "article in markdown format",
  "metaDescription": "160 character SEO meta description",
  "outline": { "sections": ["section titles"] },
  "seoScore": 85,
  "readabilityScore": 75
}`;

  const { text } = await generateText({
    model: requesty("openai/gpt-4o"),
    system:
      "You are an expert SEO content writer. Follow the user's brand settings and style precisely. Return ONLY valid JSON.",
    prompt,
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a JSON object");
    }

  let result = JSON.parse(jsonMatch[0]);

  // Handle YouTube Embedding if requested
  if (settings?.youtube_video && result.markdownContent.includes("[YOUTUBE_VIDEO:")) {
    const videoMatch = result.markdownContent.match(/\[YOUTUBE_VIDEO:\s*(.*?)\]/);
    if (videoMatch) {
      const searchQuery = videoMatch[1];
      // In a real production app, you would call YouTube API here.
      // For now, we provide a placeholder that the frontend can render or we can simulate.
      const videoEmbed = `\n\n<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}" frameborder="0" allowfullscreen></iframe></div>\n\n`;
      result.markdownContent = result.markdownContent.replace(videoMatch[0], videoEmbed);
      result.htmlContent = result.htmlContent.replace(videoMatch[0], videoEmbed);
    }
  }

  return result;
}

async function generateTopicClusters(niche: string, targetCount: number): Promise<any[]> {
  console.log(`Generating clusters for niche: "${niche}"`);

  const prompt = `Act as a senior SEO Strategist. Create a detailed "Hub and Spoke" topic cluster map for a website in the "${niche}" niche.

TARGET: Total of ${targetCount} articles.
STRUCTURE:
1. Identify 3-4 major semantic topics (Clusters).
2. For each Cluster, define 1 "Pillar" article (comprehensive, broad authority).
3. For each Cluster, define 8-9 "Spoke" articles (specific, long-tail keywords that support the Pillar).

OUTPUT: Return a JSON array of clusters:
[
  {
    "topic": "Cluster Category Name",
    "pillar": { "keyword": "Primary Authority Keyword", "volume": 1200, "difficulty": 45 },
    "spokes": [
      { "keyword": "Keyword 1", "volume": 400, "difficulty": 12 },
      { "keyword": "Keyword 2", "volume": 150, "difficulty": 8 }
      ... 
    ]
  }
]

Quality Requirements:
- Volume should be a realistic monthly search estimate (e.g., 50 to 5000+).
- Difficulty should be a score from 0 to 100.
- Keywords must be high-volume/low-competition style.
- The Spokes must logically connect to their Cluster Pillar.
- Ensure diversity across all 30 keywords.
- RETURN ONLY VALID JSON.`;

  try {
    const { text } = await generateText({
      model: requesty("openai/gpt-4o-mini"),
      system: "You are a world-class SEO strategist. You only speak JSON.",
      prompt,
      temperature: 0.8,
    });

    console.log("AI Cluster Response:", text.substring(0, 100) + "...");

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI cluster JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to generate AI clusters:", error);
    // Fallback static clusters with metrics
    return [
      {
        topic: "Fundamentals",
        pillar: { keyword: `${niche} guide`, volume: 2400, difficulty: 65 },
        spokes: [
          { keyword: `best ${niche} tips`, volume: 850, difficulty: 25 },
          { keyword: `how to ${niche}`, volume: 1200, difficulty: 40 },
          { keyword: `${niche} for beginners`, volume: 600, difficulty: 15 },
          { keyword: `${niche} tools`, volume: 450, difficulty: 30 },
          { keyword: `${niche} benefits`, volume: 300, difficulty: 10 },
          { keyword: `${niche} myths`, volume: 150, difficulty: 5 },
          { keyword: `${niche} history`, volume: 100, difficulty: 2 },
          { keyword: `${niche} checklist`, volume: 200, difficulty: 12 },
          { keyword: `${niche} tutorial`, volume: 400, difficulty: 20 }
        ]
      },
      {
        topic: "Advanced",
        pillar: { keyword: `advanced ${niche}`, volume: 1100, difficulty: 75 },
        spokes: [
          { keyword: `${niche} strategies`, volume: 500, difficulty: 35 },
          { keyword: `${niche} automation`, volume: 350, difficulty: 45 },
          { keyword: `${niche} scaling`, volume: 200, difficulty: 55 },
          { keyword: `${niche} psychology`, volume: 150, difficulty: 30 },
          { keyword: `${niche} future`, volume: 300, difficulty: 20 },
          { keyword: `${niche} expert tips`, volume: 250, difficulty: 50 },
          { keyword: `${niche} case studies`, volume: 180, difficulty: 40 },
          { keyword: `${niche} ROI`, volume: 220, difficulty: 35 },
          { keyword: `${niche} methodology`, volume: 140, difficulty: 25 }
        ]
      },
      {
        topic: "Commercial",
        pillar: { keyword: `best ${niche} solutions`, volume: 1500, difficulty: 80 },
        spokes: [
          { keyword: `${niche} reviews`, volume: 900, difficulty: 45 },
          { keyword: `${niche} comparison`, volume: 750, difficulty: 50 },
          { keyword: `${niche} vs alternatives`, volume: 600, difficulty: 55 },
          { keyword: `top ${niche} software`, volume: 450, difficulty: 60 },
          { keyword: `${niche} pricing`, volume: 400, difficulty: 40 },
          { keyword: `${niche} features`, volume: 300, difficulty: 30 },
          { keyword: `${niche} services`, volume: 250, difficulty: 35 },
          { keyword: `${niche} ROI analysis`, volume: 180, difficulty: 25 },
          { keyword: `${niche} testimonials`, volume: 120, difficulty: 15 }
        ]
      }
    ];
  }
}

function generateSecondaryKeywords(primary: string): string[] {
  const words = primary.split(" ");
  const variations = [
    `${primary} 2025`,
    `best ${primary}`,
    `${primary} tips`,
    `${primary} guide`,
    `how to ${primary}`,
  ];
  return variations.slice(0, 5);
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

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
