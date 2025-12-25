import { Client } from '@notionhq/client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  status: 'Published' | 'Draft';
  category: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: string;
}

export interface NotionConfig {
  accessToken: string;
  databaseId: string;
}

export class NotionClient {
  private client: Client;
  private databaseId: string;
  private accessToken: string;

  constructor(config: NotionConfig) {
    this.accessToken = config.accessToken;
    this.client = new Client({
      auth: config.accessToken,
      notionVersion: '2022-06-28', // Use older API version that supports databases.query
      timeoutMs: 60000, // Increase timeout to 60s
    });
    this.databaseId = config.databaseId;
  }

  async getBlogPosts(preview = false): Promise<BlogPost[]> {
    try {
      console.log('Fetching Notion posts via raw fetch...');

      // Use raw fetch to avoid SDK issues
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_size: 100,
          // Try with sort first
          sorts: [{ property: 'Published Date', direction: 'descending' }]
        }),
        next: { revalidate: 60 } // Cache for 1 minute
      });

      let data;

      if (!response.ok) {
        // If sort fails (likely due to missing property), try without sort
        console.warn(`Notion API error: ${response.status} ${response.statusText}. Retrying without sort...`);

        const retryResponse = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page_size: 100 }),
          next: { revalidate: 60 }
        });

        if (!retryResponse.ok) {
          const errorText = await retryResponse.text();
          throw new Error(`Notion API failed: ${retryResponse.status} - ${errorText}`);
        }

        data = await retryResponse.json();
      } else {
        data = await response.json();
      }

      console.log(`Notion API returned ${data.results.length} raw pages`);
      const transformed = data.results.map((page: any) => this.transformPageToPost(page));
      return transformed;

    } catch (error: any) {
      console.error('Error fetching blog posts from Notion:', error);
      return [{
        id: 'error-post',
        slug: 'error',
        title: `Error: ${error.message}`,
        excerpt: `Please check server logs.`,
        date: new Date().toISOString(),
        status: 'Published',
        category: 'Error',
        readTime: '0 min',
      }];
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      console.log(`Getting blog post for slug: ${slug}`);

      // Check if slug looks like a UUID (Notion ID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) ||
        /^[0-9a-f]{32}$/i.test(slug);

      if (isUUID) {
        console.log(`Slug looks like UUID, fetching page directly...`);
        const response = await fetch(`https://api.notion.com/v1/pages/${slug}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Notion-Version': '2022-06-28',
          },
          next: { revalidate: 3600 }
        });

        if (response.ok) {
          const page = await response.json();
          return this.transformPageToPost(page);
        }
        console.warn(`Direct page fetch failed: ${response.status}`);
      }

      // Fallback: Query by slug property
      console.log(`Querying Notion Database by Slug: ${slug}`);
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Slug', // Note: this relies on "Slug" property existing
            rich_text: { equals: slug }
          }
        }),
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        console.error(`Notion Query failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      if (data.results.length === 0) {
        return null;
      }

      return this.transformPageToPost(data.results[0] as any);
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
      return null;
    }
  }

  async getPageBlocks(pageId: string) {
    try {
      // Use raw fetch for blocks too
      const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
        },
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.status}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error(`Error fetching blocks for page ${pageId}:`, error);
      return [];
    }
  }

  async publishArticle(article: {
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    featured_image?: string;
    category?: string;
    tags?: string[];
  }) {
    try {
      // 1. Fetch database structure to check which properties exist
      const database: any = await (this.client.databases as any).retrieve({
        database_id: this.databaseId,
      });

      if (!database || !database.properties) {
        const isSynced = database && (database.data_sources || database.source);
        const logMsg = `Properties missing. Synced detected: ${!!isSynced}. Attempting blind create...`;

        try {
          const fs = require('fs');
          fs.appendFileSync("publish-debug.log", `${new Date().toISOString()} - ${logMsg}\n`);

          // Try a Hail Mary create with just the title. Notion often handles this even if retrieve() lies about properties.
          // Note: We use "title" lowercase because that is the standard for basic pages

          let cover: any = undefined;
          if (article.featured_image) {
            cover = {
              type: "external",
              external: { url: article.featured_image }
            };
          }

          const response = await this.client.pages.create({
            parent: { database_id: this.databaseId },
            cover: cover,
            properties: {
              "title": { title: [{ text: { content: article.title } }] }
            },
            children: this.htmlToBlocks(article.content) as any,
          });

          fs.appendFileSync("publish-debug.log", `${new Date().toISOString()} - Blind create SUCCESS!\n`);
          return {
            id: response.id,
            url: (response as any).url,
            cmsPostId: response.id,
            publishedUrl: (response as any).url,
          };
        } catch (blindError: any) {
          const fs = require('fs');
          fs.appendFileSync("publish-debug.log", `${new Date().toISOString()} - Blind create FAILED: ${blindError.message}\n`);

          const errorMsg = isSynced
            ? 'Your Notion database appears to be a "Synced Database". These are read-only mirrors of external data and cannot be published to.'
            : 'Notion database properties not found. Your database might be a "Wiki" or a private view.';

          throw new Error(`${errorMsg} Please create a standard "Table" database in Notion and ensure your Integration is "connected" to it. Details: ${blindError.message}`);
        }
      }

      const dbProperties = database.properties;

      // 2. Build properties object dynamically based on what's available
      const properties: any = {};

      // Match properties case-insensitively or by common names
      const findProp = (name: string) => {
        if (!dbProperties) return null;
        const exact = Object.keys(dbProperties).find(k => k.toLowerCase() === name.toLowerCase());
        return exact || null;
      };

      // Title is usually "Title" or "Name" and is required to be a title type
      const titleKey = Object.keys(dbProperties).find(k => dbProperties[k].type === 'title') || 'Title';
      properties[titleKey] = { title: [{ text: { content: article.title } }] };

      // Optional properties - only add if they exist in the DB
      const slugKey = findProp('Slug');
      if (slugKey && dbProperties[slugKey].type === 'rich_text') {
        properties[slugKey] = { rich_text: [{ text: { content: article.slug } }] };
      }

      const metaKey = findProp('Meta Description') || findProp('SEO Description');
      if (metaKey && dbProperties[metaKey].type === 'rich_text') {
        properties[metaKey] = { rich_text: [{ text: { content: article.meta_description || '' } }] };
      }

      const catKey = findProp('Category');
      if (catKey && (dbProperties[catKey].type === 'select' || dbProperties[catKey].type === 'multi_select')) {
        const optionName = article.category || 'General';
        if (dbProperties[catKey].type === 'select') {
          properties[catKey] = { select: { name: optionName } };
        } else {
          properties[catKey] = { multi_select: [{ name: optionName }] };
        }
      }

      const dateKey = findProp('Published Date') || findProp('Date');
      if (dateKey && dbProperties[dateKey].type === 'date') {
        properties[dateKey] = { date: { start: new Date().toISOString() } };
      }

      const statusKey = findProp('Status');
      if (statusKey && dbProperties[statusKey].type === 'select') {
        properties[statusKey] = { select: { name: 'Draft' } };
      }

      const blocks = this.htmlToBlocks(article.content);

      // Prepare cover image if provided
      let cover: any = undefined;
      if (article.featured_image) {
        cover = {
          type: "external",
          external: { url: article.featured_image }
        };
      }

      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        cover: cover,
        properties,
        children: blocks as any,
      });

      return {
        id: response.id,
        url: (response as any).url,
        cmsPostId: response.id,
        publishedUrl: (response as any).url,
      };
    } catch (error) {
      console.error('Error publishing to Notion:', error);
      throw error;
    }
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
  }

  private htmlToBlocks(html: string): any[] {
    const blocks: any[] = [];

    // Simple regex-based parser for common tags
    // In a production app, use a proper HTML parser like node-html-parser or cheerio
    const parts = html.split(/(<h[123]>.*?<\/h[123]>|<p>.*?<\/p>|<ul>.*?<\/ul>|<ol>.*?<\/ol>|<img.*?>|<iframe.*?>.*?<\/iframe>|<iframe.*?\/>)/i);

    for (const part of parts) {
      if (!part.trim()) continue;

      if (part.match(/<h1/i)) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: { rich_text: [{ text: { content: this.decodeHtmlEntities(part.replace(/<[^>]*>/g, '')) } }] },
        });
      } else if (part.match(/<h2/i)) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: { rich_text: [{ text: { content: this.decodeHtmlEntities(part.replace(/<[^>]*>/g, '')) } }] },
        });
      } else if (part.match(/<h3/i)) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: { rich_text: [{ text: { content: this.decodeHtmlEntities(part.replace(/<[^>]*>/g, '')) } }] },
        });
      } else if (part.match(/<p/i)) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: this.decodeHtmlEntities(part.replace(/<[^>]*>/g, '')) } }] },
        });
      } else if (part.match(/<img/i)) {
        const srcMatch = part.match(/src="([^"]+)"/i);
        if (srcMatch) {
          blocks.push({
            object: 'block',
            type: 'image',
            image: { type: 'external', external: { url: srcMatch[1] } },
          });
        }
      } else if (part.match(/<iframe/i)) {
        const srcMatch = part.match(/src="([^"]+)"/i);
        if (srcMatch) {
          let videoUrl = srcMatch[1];
          // Handle YouTube shortcode style or relative URLs if any, but mostly external
          blocks.push({
            object: 'block',
            type: 'video',
            video: { type: 'external', external: { url: videoUrl } },
          });
        }
      } else if (part.match(/<li/i)) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ text: { content: this.decodeHtmlEntities(part.replace(/<[^>]*>/g, '')) } }] },
        });
      }
    }

    // fallback for plain text if no tags found or split failed to catch everything
    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: this.decodeHtmlEntities(html.replace(/<[^>]*>/g, '').substring(0, 2000)) } }] },
      });
    }

    return blocks.slice(0, 100); // Notion limit is usually 100 children per request
  }

  private transformPageToPost(page: any): BlogPost {
    const properties = page.properties;


    // Handle Title - check for "Title" or "Name" (case insensitive/standard)
    const titleKey = Object.keys(properties).find(k => k.toLowerCase() === 'title' || k.toLowerCase() === 'name') || 'Name';
    const title = properties[titleKey]?.title?.[0]?.plain_text || 'Untitled';

    // Handle Slug - check for "Slug" or use ID
    const slugKey = Object.keys(properties).find(k => k.toLowerCase() === 'slug');
    const slug = slugKey ? (properties[slugKey]?.rich_text?.[0]?.plain_text || page.id) : page.id;

    const excerpt = properties.Excerpt?.rich_text?.[0]?.plain_text || '';

    // Handle Date - check for "Published Date", "Date" or use created_time
    const dateKey = Object.keys(properties).find(k => k.toLowerCase() === 'published date' || k.toLowerCase() === 'date');
    const date = dateKey ? (properties[dateKey]?.date?.start || page.created_time) : page.created_time;

    const status = properties.Status?.select?.name || 'Draft';
    const category = properties.Category?.select?.name || 'General';
    const seoTitle = properties['SEO Title']?.rich_text?.[0]?.plain_text || '';
    const seoDescription = properties['Meta Description']?.rich_text?.[0]?.plain_text || '';

    // Handle cover image
    let coverImage = undefined;

    // 1. Check standard page cover (root level)
    if (page.cover) {
      coverImage = page.cover.type === 'file' ? page.cover.file.url : page.cover.external.url;
    }

    try {
      const fs = require('fs');
      if (!global.hasLoggedNotionDebug) {
        fs.appendFileSync('debug-notion.log', JSON.stringify({
          id: page.id,
          hasRootCover: !!page.cover,
          rootCoverType: page.cover?.type,
          extractedUrl: coverImage
        }) + "\n");
        global.hasLoggedNotionDebug = true;
      }
    } catch (e) { }

    // 2. Fallback to properties if not found (legacy support)
    if (!coverImage) {
      const coverKey = Object.keys(properties).find(k => k.toLowerCase() === 'cover image' || k.toLowerCase() === 'cover');
      if (coverKey && properties[coverKey]?.files?.length > 0) {
        const file = properties[coverKey].files[0];
        coverImage = file.type === 'file' ? file.file.url : file.external.url;
      }
    }

    // Estimate read time (very rough approximation)
    const wordCount = 1000; // Placeholder, would need to fetch content to be accurate
    const readTime = `${Math.ceil(wordCount / 200)} min read`;

    return {
      id: page.id,
      slug,
      title,
      excerpt,
      date,
      status,
      category,
      coverImage,
      seoTitle,
      seoDescription,
      readTime,
    };
  }
}

// Singleton instance for easy import
export const notion = new NotionClient({
  accessToken: process.env.NOTION_TOKEN || '',
  databaseId: process.env.NOTION_DATABASE_ID || '',
});
