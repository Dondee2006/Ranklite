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

  async appendBlocks(pageId: string, blocks: any[]) {
    return await this.client.blocks.children.append({
      block_id: pageId,
      children: blocks,
    });
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

  async getPageWithContent(pageId: string): Promise<BlogPost | null> {
    try {
      const page = await this.getPage(pageId);
      const blocks = await this.getPageBlocks(pageId);
      const post = this.transformPageToPost(page as any);

      const htmlContent = this.blocksToHtml(blocks);

      return {
        ...post,
        content: htmlContent,
      } as any;
    } catch (error) {
      console.error('Error fetching page with content:', error);
      return null;
    }
  }

  private blocksToHtml(blocks: any[]): string {
    return blocks.map(block => {
      const type = block.type;
      const content = block[type]?.rich_text?.map((t: any) => {
        let text = t.plain_text;
        if (t.annotations.bold) text = `<strong>${text}</strong>`;
        if (t.annotations.italic) text = `<em>${text}</em>`;
        if (t.annotations.strikethrough) text = `<del>${text}</del>`;
        if (t.annotations.underline) text = `<u>${text}</u>`;
        if (t.annotations.code) text = `<code>${text}</code>`;

        if (t.href) {
          text = `<a href="${t.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
        return text;
      }).join('') || '';

      switch (type) {
        case 'paragraph':
          return `<p>${content}</p>`;
        case 'heading_1':
          return `<h1>${content}</h1>`;
        case 'heading_2':
          return `<h2>${content}</h2>`;
        case 'heading_3':
          return `<h3>${content}</h3>`;
        case 'bulleted_list_item':
          return `<li>${content}</li>`;
        case 'numbered_list_item':
          return `<li>${content}</li>`;
        case 'image':
          const url = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
          return `<img src="${url}" alt="Notion Image" />`;
        case 'code':
          return `<pre><code>${block.code.rich_text.map((t: any) => t.plain_text).join('')}</code></pre>`;
        case 'quote':
          return `<blockquote>${content}</blockquote>`;
        case 'divider':
          return `<hr />`;
        default:
          return '';
      }
    }).join('\n');
  }

  // Helper to transform Notion page to unified BlogPost
  private transformPageToPost(page: { id: string; properties: any; created_time: string }): BlogPost {
    const properties = page.properties;
    console.log(`[NOTION-DEBUG] Raw properties for page ${page.id}:`, Object.keys(properties));

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

    // 1. Check native page cover (top of page in Notion)
    if ((page as any).cover) {
      const cover = (page as any).cover;
      coverImage = cover.type === 'external' ? cover.external.url : (cover.file?.url || cover.external?.url);
    }

    // 2. Check 'Cover Image' or 'Files & media' or 'Thumbnail' property (custom properties)
    const possibleImageProps = ['Cover Image', 'Files & media', 'Thumbnail', 'Featured Image'];
    for (const propName of possibleImageProps) {
      if (properties[propName]?.files?.length > 0) {
        const file = properties[propName].files[0];
        coverImage = file.type === 'file' ? file.file.url : file.external.url;
        break; // Stop at first found image
      }
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
