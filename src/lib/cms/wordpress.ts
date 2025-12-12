export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  status: string;
  slug: string;
  meta: Record<string, any>;
}

export interface WordPressConfig {
  siteUrl: string;
  accessToken: string;
}

export class WordPressClient {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.siteUrl}/wp-json/wp/v2${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPosts(params: { per_page?: number; page?: number } = {}) {
    const query = new URLSearchParams({
      per_page: String(params.per_page || 100),
      page: String(params.page || 1),
    });
    return this.request(`/posts?${query}`) as Promise<WordPressPost[]>;
  }

  async getPages(params: { per_page?: number; page?: number } = {}) {
    const query = new URLSearchParams({
      per_page: String(params.per_page || 100),
      page: String(params.page || 1),
    });
    return this.request(`/pages?${query}`) as Promise<WordPressPost[]>;
  }

  async createPost(data: {
    title: string;
    content: string;
    status?: 'publish' | 'draft';
    excerpt?: string;
    meta?: Record<string, any>;
  }) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<WordPressPost>;
  }

  async updatePost(id: number, data: Partial<{
    title: string;
    content: string;
    status: 'publish' | 'draft';
    excerpt: string;
    meta: Record<string, any>;
  }>) {
    return this.request(`/posts/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<WordPressPost>;
  }

  async validateConnection() {
    try {
      await this.request('/posts?per_page=1');
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }
}
