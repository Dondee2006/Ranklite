import { NextResponse } from "next/server";

async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(id);
    return response;
  } catch {
    clearTimeout(id);
    throw new Error("Request timed out");
  }
}

function extractMetaContent(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'");
    }
  }
  return null;
}

const COUNTRY_MAPPING: Record<string, string> = {
  "us": "United States", "usa": "United States", "united states": "United States", "america": "United States",
  "uk": "United Kingdom", "gb": "United Kingdom", "united kingdom": "United Kingdom", "britain": "United Kingdom", "england": "United Kingdom",
  "ca": "Canada", "canada": "Canada",
  "au": "Australia", "australia": "Australia",
  "de": "Germany", "germany": "Germany", "deutschland": "Germany",
  "fr": "France", "france": "France",
  "es": "Spain", "spain": "Spain", "españa": "Spain",
  "it": "Italy", "italy": "Italy", "italia": "Italy",
  "nl": "Netherlands", "netherlands": "Netherlands", "holland": "Netherlands",
  "be": "Belgium", "belgium": "Belgium",
  "ch": "Switzerland", "switzerland": "Switzerland",
  "at": "Austria", "austria": "Austria",
  "se": "Sweden", "sweden": "Sweden",
  "no": "Norway", "norway": "Norway",
  "dk": "Denmark", "denmark": "Denmark",
  "fi": "Finland", "finland": "Finland",
  "ie": "Ireland", "ireland": "Ireland",
  "pt": "Portugal", "portugal": "Portugal",
  "pl": "Poland", "poland": "Poland",
  "cz": "Czech Republic", "czech republic": "Czech Republic", "czechia": "Czech Republic",
  "gr": "Greece", "greece": "Greece",
  "ru": "Russia", "russia": "Russia",
  "jp": "Japan", "japan": "Japan",
  "cn": "China", "china": "China",
  "kr": "South Korea", "south korea": "South Korea", "korea": "South Korea",
  "in": "India", "india": "India",
  "br": "Brazil", "brazil": "Brazil",
  "mx": "Mexico", "mexico": "Mexico",
  "ar": "Argentina", "argentina": "Argentina",
  "za": "South Africa", "south africa": "South Africa",
  "ae": "United Arab Emirates", "uae": "United Arab Emirates", "united arab emirates": "United Arab Emirates",
  "sg": "Singapore", "singapore": "Singapore",
  "hk": "Hong Kong", "hong kong": "Hong Kong",
  "nz": "New Zealand", "new zealand": "New Zealand",
  "il": "Israel", "israel": "Israel",
  "tr": "Turkey", "turkey": "Turkey",
  "th": "Thailand", "thailand": "Thailand",
  "my": "Malaysia", "malaysia": "Malaysia",
  "id": "Indonesia", "indonesia": "Indonesia",
  "ph": "Philippines", "philippines": "Philippines",
  "vn": "Vietnam", "vietnam": "Vietnam",
  "pk": "Pakistan", "pakistan": "Pakistan",
  "ng": "Nigeria", "nigeria": "Nigeria",
  "eg": "Egypt", "egypt": "Egypt",
  "sa": "Saudi Arabia", "saudi arabia": "Saudi Arabia",
  "ug": "Uganda", "uganda": "Uganda",
  "ke": "Kenya", "kenya": "Kenya",
  "tz": "Tanzania", "tanzania": "Tanzania",
  "rw": "Rwanda", "rwanda": "Rwanda",
  "et": "Ethiopia", "ethiopia": "Ethiopia",
  "gh": "Ghana", "ghana": "Ghana",
  "sn": "Senegal", "senegal": "Senegal",
  "ci": "Ivory Coast", "ivory coast": "Ivory Coast", "côte d'ivoire": "Ivory Coast",
  "cm": "Cameroon", "cameroon": "Cameroon",
  "ma": "Morocco", "morocco": "Morocco",
  "dz": "Algeria", "algeria": "Algeria",
  "tn": "Tunisia", "tunisia": "Tunisia",
  "ly": "Libya", "libya": "Libya",
  "sd": "Sudan", "sudan": "Sudan",
  "ao": "Angola", "angola": "Angola",
  "mz": "Mozambique", "mozambique": "Mozambique",
  "zm": "Zambia", "zambia": "Zambia",
  "zw": "Zimbabwe", "zimbabwe": "Zimbabwe",
  "bw": "Botswana", "botswana": "Botswana",
  "na": "Namibia", "namibia": "Namibia",
  "mw": "Malawi", "malawi": "Malawi",
  "mg": "Madagascar", "madagascar": "Madagascar",
  "mu": "Mauritius", "mauritius": "Mauritius",
  "sc": "Seychelles", "seychelles": "Seychelles",
  "cd": "Congo (DRC)", "congo": "Congo (DRC)", "drc": "Congo (DRC)",
  "cg": "Congo (Republic)", "congo republic": "Congo (Republic)",
  "ga": "Gabon", "gabon": "Gabon",
  "gq": "Equatorial Guinea", "equatorial guinea": "Equatorial Guinea",
  "bf": "Burkina Faso", "burkina faso": "Burkina Faso",
  "ml": "Mali", "mali": "Mali",
  "ne": "Niger", "niger": "Niger",
  "td": "Chad", "chad": "Chad",
  "so": "Somalia", "somalia": "Somalia",
  "er": "Eritrea", "eritrea": "Eritrea",
  "dj": "Djibouti", "djibouti": "Djibouti",
  "ss": "South Sudan", "south sudan": "South Sudan",
  "sl": "Sierra Leone", "sierra leone": "Sierra Leone",
  "lr": "Liberia", "liberia": "Liberia",
  "gn": "Guinea", "guinea": "Guinea",
  "gw": "Guinea-Bissau", "guinea-bissau": "Guinea-Bissau",
  "cv": "Cabo Verde", "cabo verde": "Cabo Verde", "cape verde": "Cabo Verde",
  "gm": "Gambia", "gambia": "Gambia",
  "mr": "Mauritania", "mauritania": "Mauritania",
  "bj": "Benin", "benin": "Benin",
  "tg": "Togo", "togo": "Togo",
  "ls": "Lesotho", "lesotho": "Lesotho",
  "sz": "Eswatini", "eswatini": "Eswatini", "swaziland": "Eswatini",
  "bi": "Burundi", "burundi": "Burundi",
  "cf": "Central African Republic", "central african republic": "Central African Republic",
  "st": "Sao Tome and Principe", "sao tome": "Sao Tome and Principe",
  "km": "Comoros", "comoros": "Comoros",
};

function normalizeCountry(country: string): string | null {
  if (!country) return null;
  const normalized = country.toLowerCase().trim();
  return COUNTRY_MAPPING[normalized] || null;
}

function extractCompetitors(html: string, businessUrl: string): string[] {
  const competitors: Set<string> = new Set();
  const businessDomain = new URL(businessUrl).hostname.replace("www.", "").toLowerCase();
  
  const excludedDomains = [
    "facebook.com", "twitter.com", "instagram.com", "linkedin.com", "youtube.com",
    "tiktok.com", "pinterest.com", "reddit.com", "google.com", "apple.com",
    "microsoft.com", "github.com", "stackoverflow.com", "medium.com", "wordpress.org",
    "w3.org", "schema.org", "cloudflare.com", "amazonaws.com", "gstatic.com",
    "googletagmanager.com", "googlesyndication.com", "googleadservices.com",
    "doubleclick.net", "facebook.net", "fbcdn.net", "twimg.com", "cdninstagram.com",
    "gravatar.com", "wp.com", "bootstrapcdn.com", "jquery.com", "jsdelivr.net",
    "unpkg.com", "cloudfront.net", "akamaihd.net", "typekit.net", "fonts.googleapis.com"
  ];
  
  const linkPattern = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    try {
      const linkUrl = new URL(match[1]);
      const linkDomain = linkUrl.hostname.replace("www.", "").toLowerCase();
      
      if (
        linkDomain !== businessDomain &&
        !excludedDomains.some(excluded => linkDomain.includes(excluded)) &&
        !linkDomain.includes("cdn") &&
        !linkDomain.includes("static") &&
        linkDomain.includes(".")
      ) {
        competitors.add(linkDomain);
      }
    } catch {
      continue;
    }
  }
  
  const vsPattern = /\b(?:vs\.?|versus|compared to|alternative to|competitor|rivals?)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)/gi;
  while ((match = vsPattern.exec(html)) !== null) {
    const potentialCompetitor = match[1].trim();
    if (potentialCompetitor.length > 2 && potentialCompetitor.length < 30) {
      competitors.add(potentialCompetitor.toLowerCase() + ".com");
    }
  }

  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const jsonContent = script.replace(/<script[^>]*>|<\/script>/gi, "");
        const data = JSON.parse(jsonContent);
        
        const findCompetitors = (obj: Record<string, unknown>) => {
          if (obj.competitor || obj.competitors) {
            const compList = obj.competitor || obj.competitors;
            if (Array.isArray(compList)) {
              compList.forEach((c) => {
                if (typeof c === "string") competitors.add(c);
                else if (c && typeof c === "object" && (c as Record<string, unknown>).name) {
                  competitors.add((c as Record<string, unknown>).name as string);
                }
              });
            }
          }
        };
        
        if (Array.isArray(data)) {
          data.forEach((item) => findCompetitors(item as Record<string, unknown>));
        } else if (data["@graph"]) {
          (data["@graph"] as Record<string, unknown>[]).forEach((item) => findCompetitors(item));
        } else {
          findCompetitors(data as Record<string, unknown>);
        }
      } catch {
        continue;
      }
    }
  }
  
  return Array.from(competitors).slice(0, 5);
}

function extractSitemapUrl(html: string, baseUrl: string): string | null {
  const sitemapPatterns = [
    /<link[^>]*rel=["']sitemap["'][^>]*href=["']([^"']+)["']/i,
    /<a[^>]*href=["']([^"']*sitemap\.xml)["']/i,
  ];
  
  for (const pattern of sitemapPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const sitemapUrl = match[1];
      if (sitemapUrl.startsWith("http")) {
        return sitemapUrl;
      }
      const urlObj = new URL(baseUrl);
      return `${urlObj.origin}${sitemapUrl.startsWith("/") ? "" : "/"}${sitemapUrl}`;
    }
  }
  
  const urlObj = new URL(baseUrl);
  return `${urlObj.origin}/sitemap.xml`;
}

function extractBlogUrl(html: string, baseUrl: string): string | null {
  const blogPatterns = [
    /<a[^>]*href=["']([^"']*\/blog\/?)[^"']*["'][^>]*>(?:Blog|Articles|News)/i,
    /<a[^>]*href=["']([^"']*\/articles\/?)[^"']*["']/i,
    /<a[^>]*href=["']([^"']*\/news\/?)[^"']*["']/i,
    /<a[^>]*href=["']([^"']*\/posts\/?)[^"']*["']/i,
    /<a[^>]*href=["'](\/blog\/?)[^"']*["']/i,
    /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
  ];
  
  for (const pattern of blogPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const blogPath = match[1];
      if (blogPath.startsWith("http")) {
        return blogPath.replace(/\/feed\/?$/, "").replace(/\/$/, "");
      }
      const urlObj = new URL(baseUrl);
      return `${urlObj.origin}${blogPath.startsWith("/") ? "" : "/"}${blogPath}`.replace(/\/feed\/?$/, "").replace(/\/$/, "");
    }
  }
  
  const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/gi);
  if (navMatch) {
    for (const nav of navMatch) {
      const blogLinkMatch = nav.match(/<a[^>]*href=["']([^"']+)["'][^>]*>[^<]*(?:blog|articles|news|posts)[^<]*<\/a>/i);
      if (blogLinkMatch && blogLinkMatch[1]) {
        const blogPath = blogLinkMatch[1];
        if (blogPath.startsWith("http")) {
          return blogPath;
        }
        const urlObj = new URL(baseUrl);
        return `${urlObj.origin}${blogPath.startsWith("/") ? "" : "/"}${blogPath}`;
      }
    }
  }
  
  return null;
}

function extractRssFeed(html: string, baseUrl: string): string | null {
  const rssPatterns = [
    /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
    /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i,
    /<a[^>]*href=["']([^"']*\/feed\/?)[^"']*["']/i,
    /<a[^>]*href=["']([^"']*\/rss\/?)[^"']*["']/i,
  ];
  
  for (const pattern of rssPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const feedUrl = match[1];
      if (feedUrl.startsWith("http")) {
        return feedUrl;
      }
      const urlObj = new URL(baseUrl);
      return `${urlObj.origin}${feedUrl.startsWith("/") ? "" : "/"}${feedUrl}`;
    }
  }
  
  return null;
}

function extractBusinessInfo(html: string, url: string) {
  const title = extractMetaContent(html, [
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = extractMetaContent(html, [
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
  ]);

  const siteName = extractMetaContent(html, [
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["']/i,
  ]);

  const keywords = extractMetaContent(html, [
    /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i,
  ]);

  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const orgInfo: { name?: string; description?: string; country?: string; address?: string } = {};
  
  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const jsonContent = script.replace(/<script[^>]*>|<\/script>/gi, "");
        const data = JSON.parse(jsonContent);
        
        const processSchema = (schema: Record<string, unknown>) => {
          if (schema["@type"] === "Organization" || schema["@type"] === "LocalBusiness" || schema["@type"] === "Corporation") {
            orgInfo.name = orgInfo.name || (schema.name as string);
            orgInfo.description = orgInfo.description || (schema.description as string);
            
            const address = schema.address as Record<string, unknown>;
            if (address) {
              if (typeof address === "string") {
                orgInfo.address = address;
              } else if (address.addressCountry) {
                orgInfo.country = normalizeCountry(address.addressCountry as string) || (address.addressCountry as string);
              }
            }
          }
          if (schema["@type"] === "WebSite" && schema.name) {
            orgInfo.name = orgInfo.name || (schema.name as string);
          }
        };
        
        if (Array.isArray(data)) {
          data.forEach((item) => processSchema(item as Record<string, unknown>));
        } else if (data["@graph"]) {
          (data["@graph"] as Record<string, unknown>[]).forEach((item) => processSchema(item));
        } else {
          processSchema(data as Record<string, unknown>);
        }
      } catch {
        continue;
      }
    }
  }

  let country = orgInfo.country;
  
  if (!country) {
    const geoCountry = extractMetaContent(html, [
      /<meta[^>]*name=["']geo\.country["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*property=["']og:country-name["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*property=["']business:contact_data:country_name["'][^>]*content=["']([^"']+)["']/i,
    ]);
    if (geoCountry) {
      country = normalizeCountry(geoCountry) || geoCountry;
    }
  }

  if (!country) {
    const geoRegion = extractMetaContent(html, [
      /<meta[^>]*name=["']geo\.region["'][^>]*content=["']([^"']+)["']/i,
    ]);
    if (geoRegion) {
      const regionCountry = geoRegion.split("-")[0];
      country = normalizeCountry(regionCountry);
    }
  }

  if (!country) {
    const urlObj = new URL(url);
    const tld = urlObj.hostname.split(".").pop()?.toLowerCase();
    if (tld && tld.length === 2 && tld !== "io" && tld !== "co" && tld !== "ai") {
      country = normalizeCountry(tld);
    }
  }

  const urlObj = new URL(url);
  const domainParts = urlObj.hostname.replace("www.", "").split(".");
  const domainName = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);

  const businessName = orgInfo.name || siteName || title?.split(/[-|–]/).map(s => s.trim())[0] || domainName;
  const businessDescription = orgInfo.description || description || "";

  const audiences: string[] = [];
  if (keywords) {
    const keywordList = keywords.split(",").map(k => k.trim()).filter(k => k.length > 2).slice(0, 3);
    audiences.push(...keywordList);
  }

  const suggestedCompetitors = extractCompetitors(html, url);
  const sitemapUrl = extractSitemapUrl(html, url);
  const blogUrl = extractBlogUrl(html, url);
  const rssFeedUrl = extractRssFeed(html, url);

  return {
    businessName: businessName.substring(0, 100),
    description: businessDescription.substring(0, 500),
    suggestedAudiences: audiences,
    language: extractLanguage(html),
    country: country || null,
    suggestedCompetitors,
    sitemapUrl,
    blogUrl,
    rssFeedUrl,
  };
}

function extractLanguage(html: string): string {
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  if (langMatch) {
    const lang = langMatch[1].toLowerCase();
    if (lang.startsWith("en")) return "English";
    if (lang.startsWith("es")) return "Spanish";
    if (lang.startsWith("fr")) return "French";
    if (lang.startsWith("de")) return "German";
    if (lang.startsWith("pt")) return "Portuguese";
    if (lang.startsWith("it")) return "Italian";
  }
  return "English";
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const response = await fetchWithTimeout(normalizedUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const businessInfo = extractBusinessInfo(html, normalizedUrl);

    return NextResponse.json({
      success: true,
      data: businessInfo,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website information. Please enter details manually." },
      { status: 500 }
    );
  }
}