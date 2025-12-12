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
}

export class NotionClient {
  private config: NotionConfig;
  private apiVersion = '2022-06-28';

  constructor(config: NotionConfig) {
    this.config = config;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.notion.com/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.apiVersion,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async searchDatabases(query = '') {
    const response = await this.request('/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        filter: { property: 'object', value: 'database' },
      }),
    });
    return response.results as NotionDatabase[];
  }

  async queryDatabase(databaseId: string, filter?: any) {
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

  async validateConnection() {
    try {
      await this.searchDatabases();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }

  textToBlocks(content: string) {
    const paragraphs = content.split('\n\n');
    return paragraphs.map(text => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: text } }],
      },
    }));
  }
}
