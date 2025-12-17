interface FramerConfig {
  accessToken: string;
}

interface FramerCollection {
  id: string;
  name: string;
  slug: string;
  fields: unknown[];
}

interface FramerCollectionItem {
  id: string;
  slug: string;
  fieldData: {
    [key: string]: unknown;
  };
}

export class FramerService {
  private accessToken: string;
  private baseUrl = 'https://api.framer.com/v1';

  constructor(config: FramerConfig) {
    this.accessToken = config.accessToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sites`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getSites(): Promise<unknown[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sites`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sites || data || [];
    } catch (error) {
      console.error('Error fetching Framer sites:', error);
      return [];
    }
  }

  async getCollections(siteId: string): Promise<FramerCollection[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sites/${siteId}/collections`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.statusText}`);
      }

      const data = await response.json();
      return data.collections || [];
    } catch (error) {
      console.error('Error fetching Framer collections:', error);
      return [];
    }
  }

  async getCollectionItems(collectionId: string, limit = 100): Promise<FramerCollectionItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${collectionId}/items?limit=${limit}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch collection items: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Framer collection items:', error);
      return [];
    }
  }

  async createCollectionItem(collectionId: string, itemData: {
    slug: string;
    [key: string]: unknown;
  }): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/collections/${collectionId}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        id: itemData.slug,
        slug: itemData.slug,
        fieldData: itemData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create collection item: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async updateCollectionItem(collectionId: string, itemId: string, itemData: {
    slug?: string;
    [key: string]: unknown;
  }): Promise<unknown> {
    const payload: Record<string, unknown> = {
      fieldData: itemData,
    };

    if (itemData.slug) {
      payload.slug = itemData.slug;
    }

    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/items/${itemId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update collection item: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async deleteCollectionItem(collectionId: string, itemId: string): Promise<unknown> {
    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/items/${itemId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete collection item: ${error.message || response.statusText}`);
    }

    return response.ok ? { success: true } : response.json();
  }

  async getSiteInfo(siteId: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/sites/${siteId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get site info: ${response.statusText}`);
    }

    return response.json();
  }
}

export async function createFramerService(accessToken: string): Promise<FramerService> {
  return new FramerService({ accessToken });
}
