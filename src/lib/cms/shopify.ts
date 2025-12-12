export interface ShopifyArticle {
  id: number;
  title: string;
  body_html: string;
  blog_id: number;
  author: string;
  published_at: string | null;
  summary_html: string;
  handle: string;
  tags: string;
  metafields?: Array<{
    key: string;
    value: string;
    type: string;
    namespace: string;
  }>;
}

export interface ShopifyBlog {
  id: number;
  title: string;
  handle: string;
}

export interface ShopifyConfig {
  shop: string;
  accessToken: string;
}

export class ShopifyClient {
  private config: ShopifyConfig;
  private apiVersion = '2025-10';

  constructor(config: ShopifyConfig) {
    this.config = config;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `https://${this.config.shop}/admin/api/${this.apiVersion}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getBlogs() {
    const response = await this.request('/blogs.json');
    return response.blogs as ShopifyBlog[];
  }

  async getArticles(blogId: number, params: { limit?: number; page_info?: string } = {}) {
    const query = new URLSearchParams({
      limit: String(params.limit || 250),
      ...(params.page_info ? { page_info: params.page_info } : {}),
    });
    const response = await this.request(`/blogs/${blogId}/articles.json?${query}`);
    return response.articles as ShopifyArticle[];
  }

  async createArticle(blogId: number, data: {
    title: string;
    body_html: string;
    author?: string;
    tags?: string;
    published?: boolean;
    summary_html?: string;
  }) {
    const response = await this.request(`/blogs/${blogId}/articles.json`, {
      method: 'POST',
      body: JSON.stringify({
        article: {
          ...data,
          published_at: data.published ? new Date().toISOString() : null,
        },
      }),
    });
    return response.article as ShopifyArticle;
  }

  async updateArticle(blogId: number, articleId: number, data: Partial<{
    title: string;
    body_html: string;
    author: string;
    tags: string;
    published_at: string | null;
    summary_html: string;
  }>) {
    const response = await this.request(`/blogs/${blogId}/articles/${articleId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ article: data }),
    });
    return response.article as ShopifyArticle;
  }

  async validateConnection() {
    try {
      await this.getBlogs();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }
}
