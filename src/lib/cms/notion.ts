export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, unknown>;
}

export interface NotionConfig {
  accessToken: string;
}

export class NotionClient {
  private config: NotionConfig;
  private apiVersion = '2022-06-28';

  constructor(config: NotionConfig) {
    this.config = config;
  }

  async getBlogPosts(preview = false): Promise<BlogPost[]> {
    try {
      const response = await (this.client.databases as any).query({
        database_id: this.databaseId,
        filter: preview
          ? undefined
          : {
            property: 'Status',
            select: {
              equals: 'Published',
            },
          },
        sorts: [
          {
            property: 'Published Date',
            direction: 'descending',
          },
        ],
      });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await (this.client.databases as any).query({
        database_id: this.databaseId,
        filter: {
          property: 'Slug',
          rich_text: {
            equals: slug,
          },
        },
      });

  async queryDatabase(databaseId: string, filter?: unknown) {
    const response = await this.request(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({ filter }),
    });
    return response.results as NotionPage[];
  }

  async getPage(pageId: string) {
    return this.request(`/pages/${pageId}`) as Promise<NotionPage>;
  }

  async getPageBlocks(pageId: string) {
    const response = await this.request(`/blocks/${pageId}/children`);
    return response.results;
  }

  async createPage(data: {
    parent: { database_id: string } | { page_id: string };
    properties: Record<string, unknown>;
    children?: unknown[];
  }) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<NotionPage>;
  }

  async updatePage(pageId: string, data: {
    properties?: Record<string, unknown>;
  }) {
    return this.request(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<NotionPage>;
  }

  async appendBlocks(pageId: string, blocks: unknown[]) {
    return this.request(`/blocks/${pageId}/children`, {
      method: 'PATCH',
      body: JSON.stringify({ children: blocks }),
    });
  }

  async validateConnection() {
    try {
      await this.searchDatabases();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
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
          const response = await this.client.pages.create({
            parent: { database_id: this.databaseId },
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

      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
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
          heading_1: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
        });
      } else if (part.match(/<h2/i)) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
        });
      } else if (part.match(/<h3/i)) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
        });
      } else if (part.match(/<p/i)) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
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
          bulleted_list_item: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
        });
      }
    }

    // fallback for plain text if no tags found or split failed to catch everything
    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: html.replace(/<[^>]*>/g, '').substring(0, 2000) } }] },
      });
    }

    return blocks.slice(0, 100); // Notion limit is usually 100 children per request
  }

  private transformPageToPost(page: any): BlogPost {
    const properties = page.properties;

    const title = properties.Title?.title[0]?.plain_text || 'Untitled';
    const slug = properties.Slug?.rich_text[0]?.plain_text || '';
    const excerpt = properties.Excerpt?.rich_text[0]?.plain_text || '';
    const date = properties['Published Date']?.date?.start || new Date().toISOString();
    const status = properties.Status?.select?.name || 'Draft';
    const category = properties.Category?.select?.name || 'General';
    const seoTitle = properties['SEO Title']?.rich_text[0]?.plain_text || '';
    const seoDescription = properties['Meta Description']?.rich_text[0]?.plain_text || '';

    // Handle cover image
    let coverImage = undefined;
    if (properties['Cover Image']?.files?.length > 0) {
      const file = properties['Cover Image'].files[0];
      coverImage = file.type === 'file' ? file.file.url : file.external.url;
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
