interface WixConfig {
  appId: string;
  appSecret: string;
  instanceId: string;
}

interface WixAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface WixPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  publishedDate?: string;
  lastModified?: string;
}

interface WixBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: {
    url: string;
  };
  seoData?: {
    title?: string;
    description?: string;
  };
  publishedDate?: string;
  lastPublishedDate?: string;
}

export class WixService {
  private config: WixConfig;
  private accessToken: string | null = null;

  constructor(config: WixConfig) {
    this.config = config;
  }

  async authenticate(): Promise<string> {
    const response = await fetch('https://www.wixapis.com/oauth/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        instance_id: this.config.instanceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Wix authentication failed: ${error.message || response.statusText}`);
    }

    const data: WixAccessTokenResponse = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  async validateConnection(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://www.wixapis.com/site-properties/v4/properties', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchPages(accessToken: string): Promise<WixPage[]> {
    try {
      const response = await fetch('https://www.wixapis.com/v2/pages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.pages || [];
    } catch (error) {
      console.error('Error fetching Wix pages:', error);
      return [];
    }
  }

  async fetchBlogPosts(accessToken: string): Promise<WixBlogPost[]> {
    try {
      const response = await fetch('https://www.wixapis.com/v3/posts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching Wix blog posts:', error);
      return [];
    }
  }

  async createBlogPost(accessToken: string, post: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    publish?: boolean;
  }): Promise<any> {
    const response = await fetch('https://www.wixapis.com/v3/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage ? { url: post.coverImage } : undefined,
        seoData: {
          title: post.seoTitle || post.title,
          description: post.seoDescription || post.excerpt,
        },
        status: post.publish ? 'PUBLISHED' : 'DRAFT',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create blog post: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async updateBlogPost(accessToken: string, postId: string, updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    seoTitle?: string;
    seoDescription?: string;
    publish?: boolean;
  }): Promise<any> {
    const response = await fetch(`https://www.wixapis.com/v3/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: updates.title,
        content: updates.content,
        excerpt: updates.excerpt,
        coverImage: updates.coverImage ? { url: updates.coverImage } : undefined,
        seoData: updates.seoTitle || updates.seoDescription ? {
          title: updates.seoTitle,
          description: updates.seoDescription,
        } : undefined,
        status: updates.publish ? 'PUBLISHED' : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update blog post: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async getSiteInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.wixapis.com/site-properties/v4/properties', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get site info: ${response.statusText}`);
    }

    return response.json();
  }
}

export async function createWixService(config: WixConfig): Promise<WixService> {
  return new WixService(config);
}
