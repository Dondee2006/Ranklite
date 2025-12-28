import { WordPressClient } from './wordpress';
import { ShopifyClient } from './shopify';
import { NotionClient } from './notion';
import { WixService } from './wix';

export type CMSType = 'wordpress' | 'shopify' | 'notion' | 'wix';

export interface CMSIntegration {
  id: string;
  cms_type: CMSType;
  access_token: string;
  refresh_token?: string;
  site_url: string;
  settings: Record<string, unknown>;
}

export function createCMSClient(integration: CMSIntegration) {
  switch (integration.cms_type) {
    case 'wordpress':
      return new WordPressClient({
        siteUrl: integration.site_url,
        accessToken: integration.access_token,
      });
    case 'shopify':
      return new ShopifyClient({
        shop: integration.site_url,
        accessToken: integration.access_token,
      });
    case 'notion':
      return new NotionClient({
        accessToken: integration.access_token,
        databaseId: integration.settings.database_id as string,
      });
    case 'wix':
      return new WixService({
        appId: integration.settings.appId as string,
        appSecret: integration.settings.appSecret as string,
        instanceId: integration.settings.instanceId as string,
      });
    default:
      throw new Error(`Unsupported CMS type: ${integration.cms_type}`);
  }
}

export { WordPressClient, ShopifyClient, NotionClient, WixService as WixClient };
