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

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.accessToken });
    this.databaseId = config.databaseId;
  }

  async getBlogPosts(preview = false): Promise<BlogPost[]> {
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

      return response.results.map((page: any) => this.transformPageToPost(page));
    } catch (error) {
      console.error('Error fetching blog posts from Notion:', error);
      return [];
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
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

      if (response.results.length === 0) {
        return null;
      }

      return this.transformPageToPost(response.results[0] as any);
    } catch (error) {
      console.error(`Error fetching blog post with slug ${slug}:`, error);
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
      console.error(`Error fetching blocks for page ${pageId}:`, error);
      return [];
    }
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

// Singleton instance for easy import
export const notion = new NotionClient({
  accessToken: process.env.NOTION_TOKEN || '',
  databaseId: process.env.NOTION_DATABASE_ID || '',
});
