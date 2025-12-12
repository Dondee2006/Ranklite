interface WebflowConfig {
  accessToken: string;
}

interface WebflowSite {
  id: string;
  displayName: string;
  shortName: string;
  previewUrl: string;
  customDomains?: Array<{ url: string }>;
}

interface WebflowCollection {
  id: string;
  displayName: string;
  slug: string;
  singularName: string;
  fields: any[];
}

interface WebflowCollectionItem {
  id: string;
  fieldData: {
    name: string;
    slug: string;
    [key: string]: any;
  };
  isDraft: boolean;
  isArchived: boolean;
  lastPublished?: string;
  lastUpdated?: string;
}

export class WebflowService {
  private accessToken: string;
  private baseUrl = 'https://api.webflow.com/v2';

  constructor(config: WebflowConfig) {
    this.accessToken = config.accessToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'accept-version': '2.0.0',
      'Content-Type': 'application/json',
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/token/authorized_by`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getSites(): Promise<WebflowSite[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sites`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sites: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sites || [];
    } catch (error) {
      console.error('Error fetching Webflow sites:', error);
      return [];
    }
  }

  async getCollections(siteId: string): Promise<WebflowCollection[]> {
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
      console.error('Error fetching Webflow collections:', error);
      return [];
    }
  }

  async getCollectionItems(collectionId: string, limit = 100): Promise<WebflowCollectionItem[]> {
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
      console.error('Error fetching Webflow collection items:', error);
      return [];
    }
  }

  async createCollectionItem(collectionId: string, itemData: {
    name: string;
    slug: string;
    [key: string]: any;
  }, isDraft = false): Promise<any> {
    const response = await fetch(`${this.baseUrl}/collections/${collectionId}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fieldData: itemData,
        isDraft,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create collection item: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async updateCollectionItem(collectionId: string, itemId: string, itemData: {
    name?: string;
    slug?: string;
    [key: string]: any;
  }, isDraft?: boolean): Promise<any> {
    const payload: any = {
      fieldData: itemData,
    };

    if (isDraft !== undefined) {
      payload.isDraft = isDraft;
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

  async publishCollectionItem(collectionId: string, itemId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/items/${itemId}/publish`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to publish collection item: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async unpublishCollectionItem(collectionId: string, itemId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/collections/${collectionId}/items/${itemId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ isDraft: true }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to unpublish item: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async getSiteInfo(siteId: string): Promise<WebflowSite> {
    const response = await fetch(`${this.baseUrl}/sites/${siteId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get site info: ${response.statusText}`);
    }

    return response.json();
  }
}

export async function createWebflowService(accessToken: string): Promise<WebflowService> {
  return new WebflowService({ accessToken });
}
