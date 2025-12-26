import { Client } from '@notionhq/client';

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, any>;
}

export interface NotionConfig {
  accessToken: string;
  databaseId?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  status: string;
  category: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: string;
}

export class NotionClient {
  private config: NotionConfig;
  private client: Client;
  private databaseId?: string;

  constructor(config: NotionConfig) {
    this.config = config;
    this.client = new Client({ auth: config.accessToken });
    this.databaseId = config.databaseId;
  }

  private async request(path: string, options: any = {}) {
    const url = `https://api.notion.com/v1${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion API error: ${response.status} ${errorText}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getBlogPosts(preview = false): Promise<BlogPost[]> {
    if (!this.databaseId) throw new Error('Database ID is required');
    try {
      const response = await this.client.databases.query({
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

      return response.results.map(page => this.transformPageToPost(page));
    } catch (error) {
      console.error('Error fetching blog posts from Notion:', error);
      throw error;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!this.databaseId) throw new Error('Database ID is required');
    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'Slug',
          rich_text: {
            equals: slug,
          },
        },
      });

      if (response.results.length === 0) return null;
      return this.transformPageToPost(response.results[0]);
    } catch (error) {
      console.error('Error fetching blog post by slug from Notion:', error);
      throw error;
    }
  }

  async queryDatabase(databaseId: string, filter?: any) {
    return this.request(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({ filter }),
    });
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
    properties: Record<string, any>;
    children?: any[];
  }) {
    return this.request('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<NotionPage>;
  }

  async updatePage(pageId: string, data: {
    properties?: Record<string, any>;
  }) {
    return this.request(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<NotionPage>;
  }

  async appendBlocks(pageId: string, blocks: any[]) {
    return this.request(`/blocks/${pageId}/children`, {
      method: 'PATCH',
      body: JSON.stringify({ children: blocks }),
    });
  }

  async searchDatabases() {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'database'
        }
      }),
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
    if (!this.databaseId) throw new Error('Database ID is required');
    try {
      const database: any = await this.client.databases.retrieve({
        database_id: this.databaseId,
      });

      const dbProperties = database.properties;
      const properties: any = {};

      const findProp = (name: string) => {
        if (!dbProperties) return null;
        const exact = Object.keys(dbProperties).find(k => k.toLowerCase() === name.toLowerCase());
        return exact || null;
      };

      const titleKey = Object.keys(dbProperties).find(k => dbProperties[k].type === 'title') || 'Title';
      properties[titleKey] = { title: [{ text: { content: article.title } }] };

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
        properties[statusKey] = { select: { name: 'Published' } };
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
    const parts = html.split(/(<h[123]>.*?<\/h[123]>|<p>.*?<\/p>|<ul>.*?<\/ul>|<ol>.*?<\/ol>|<img.*?>|<iframe.*?>.*?<\/iframe>|<iframe.*?\/>)/i);

    for (const part of parts) {
      if (!part || !part.trim()) continue;

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
      } else if (part.match(/<li/i)) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ text: { content: part.replace(/<[^>]*>/g, '') } }] },
        });
      }
    }

    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: html.replace(/<[^>]*>/g, '').substring(0, 2000) } }] },
      });
    }

    return blocks.slice(0, 100);
  }

  private transformPageToPost(page: any): BlogPost {
    const properties = page.properties;

    const title = properties.Title?.title[0]?.plain_text || 
                  properties.Name?.title[0]?.plain_text || 
                  'Untitled';
    const slug = properties.Slug?.rich_text[0]?.plain_text || '';
    const excerpt = properties.Excerpt?.rich_text[0]?.plain_text || 
                    properties['Meta Description']?.rich_text[0]?.plain_text || '';
    const date = properties['Published Date']?.date?.start || 
                 properties.Date?.date?.start || 
                 page.created_time;
    const status = properties.Status?.select?.name || 'Draft';
    const category = properties.Category?.select?.name || 'General';
    const seoTitle = properties['SEO Title']?.rich_text[0]?.plain_text || '';
    const seoDescription = properties['Meta Description']?.rich_text[0]?.plain_text || '';

    let coverImage = undefined;
    if (properties['Cover Image']?.files?.length > 0) {
      const file = properties['Cover Image'].files[0];
      coverImage = file.type === 'file' ? file.file.url : file.external.url;
    }

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
      readTime: '5 min read',
    };
  }
}
