import { Client } from '@notionhq/client';

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
  databaseId: string;
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
  readTime: string;
}

export class NotionClient {
  private client: Client;
  private databaseId: string;

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.accessToken || 'dummy-token' });
    this.databaseId = config.databaseId || 'dummy-db-id';
  }

  // ... (rest of the methods remain same)

  async createPage(params: any) {
    return await this.client.pages.create(params);
  }

  textToBlocks(text: string) {
    if (!text) return [];
    // Simple implementation: split by double paragraphs
    return text.split('\n\n').map(chunk => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: chunk.trim() } }]
      }
    }));
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

      return response.results.map((page) => this.transformPageToPost(page));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
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

      if (response.results.length === 0) {
        return null;
      }

      return this.transformPageToPost(response.results[0]);
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return null;
    }
  }

  async getPageBlocks(pageId: string) {
    try {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
      });
      return response.results;
    } catch (error) {
      console.error('Error fetching page blocks:', error);
      return [];
    }
  }

  async getPage(pageId: string) {
    try {
      const response = await this.client.pages.retrieve({ page_id: pageId });
      return response;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  // Helper to transform Notion page to unified BlogPost
  private transformPageToPost(page: { id: string; properties: any; created_time: string }): BlogPost {
    const properties = page.properties;

    const rawTitle = properties.Title?.title[0]?.plain_text ||
      properties.Name?.title[0]?.plain_text ||
      'Untitled';
    const title = decodeHtmlEntities(rawTitle);

    const slug = properties.Slug?.rich_text[0]?.plain_text || '';

    const rawExcerpt = properties.Excerpt?.rich_text[0]?.plain_text ||
      properties['Meta Description']?.rich_text[0]?.plain_text || '';
    const excerpt = decodeHtmlEntities(rawExcerpt);

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

    // Estimate read time
    const readTime = '5 min read';

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

export const notion = new NotionClient({
  accessToken: process.env.NOTION_ACCESS_TOKEN || '',
  databaseId: process.env.NOTION_DATABASE_ID || '',
});

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
