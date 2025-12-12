# CMS Integration Guide for Ranklite

This document provides comprehensive instructions for using the CMS integration features in Ranklite.

## Overview

Ranklite now supports full CMS integration with **WordPress**, **Shopify**, and **Notion**. This enables:
- ✅ OAuth authentication & secure token storage
- ✅ Bidirectional content syncing
- ✅ Direct publishing from Ranklite to your CMS
- ✅ Automated daily synchronization
- ✅ Webhook support for real-time updates
- ✅ Status monitoring & error handling

---

## Supported Platforms

### 1. WordPress
- Supports both self-hosted and WordPress.com sites
- Uses REST API v2
- Requires Application Password or OAuth token

### 2. Shopify
- Uses Admin API 2025-10
- Supports blog articles management
- Requires Admin API access token

### 3. Notion
- Uses Notion API v2022-06-28
- Supports page and database operations
- Requires Integration token with proper permissions

---

## Getting Started

### Accessing CMS Integrations

1. Navigate to **Dashboard → Integrations**
2. Click "**Connect CMS**"
3. Select your platform (WordPress, Shopify, or Notion)
4. Fill in the required credentials
5. Click "**Connect**"

---

## Platform-Specific Setup

### WordPress Setup

#### For Self-Hosted WordPress:

1. **Generate Application Password:**
   - Go to WordPress Admin → Users → Profile
   - Scroll to "Application Passwords"
   - Enter name: "Ranklite"
   - Click "Add New Application Password"
   - Copy the generated password

2. **In Ranklite:**
   - Site URL: `https://yoursite.com` (without trailing slash)
   - Access Token: Paste the application password

#### For WordPress.com:

1. Create an OAuth application at https://developer.wordpress.com/apps/
2. Use the OAuth token as your access token

**Required Permissions:** Read & Write posts, pages

---

### Shopify Setup

1. **Create Private App:**
   - Go to Shopify Admin → Apps → Develop apps
   - Click "Create an app"
   - Name: "Ranklite Integration"
   - Configure Admin API scopes:
     - `read_content` and `write_content`
   - Install the app
   - Copy the Admin API access token

2. **In Ranklite:**
   - Shop Name: `yourstore.myshopify.com`
   - Access Token: Paste the Admin API token

**Note:** Uses Shopify Admin API version 2025-10

---

### Notion Setup

1. **Create Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Name: "Ranklite"
   - Select workspace
   - Submit

2. **Get Integration Token:**
   - Copy the "Internal Integration Token"

3. **Share Database:**
   - Open your Notion database
   - Click "Share" → "Invite"
   - Select your Ranklite integration

4. **Get Database ID:**
   - Open your database
   - Copy the ID from URL: `notion.so/{workspace}/{DATABASE_ID}?v=...`

5. **In Ranklite:**
   - Access Token: Paste integration token
   - Database ID (optional): Paste for publishing support

---

## Core Features

### 1. Manual Sync

Click the **🔄 Sync Now** button next to any connected CMS to:
- Fetch all posts/articles/pages
- Update last sync timestamp
- Verify connection status

**What gets synced:**
- WordPress: Posts + Pages (up to 100 each)
- Shopify: Blog articles from all blogs (up to 250 each)
- Notion: Databases accessible to the integration

---

### 2. Publishing Content

Use the `/api/cms/publish` endpoint to publish generated content directly to your CMS:

```javascript
POST /api/cms/publish
{
  "integration_id": "uuid-here",
  "title": "Article Title",
  "content": "<p>Article HTML content</p>",
  "excerpt": "Brief summary",
  "status": "publish", // or "draft"
  "blog_id": 123 // Shopify only, optional
}
```

**Response:**
```json
{
  "success": true,
  "published_id": 456,
  "published_url": "https://yoursite.com/article-slug",
  "message": "Successfully published to wordpress"
}
```

---

### 3. Automated Daily Sync

A cron job runs daily at **8:00 AM UTC** to automatically sync all connected CMS platforms that have `auto_publish_enabled` set to `true`.

**Cron endpoint:** `/api/cms/cron/daily-sync`

To enable auto-sync for an integration:
```javascript
PATCH /api/cms/integrations/{id}
{
  "auto_publish_enabled": true
}
```

---

### 4. Webhooks

Set up webhooks in your CMS to notify Ranklite of content changes:

#### WordPress Webhook URL:
```
https://yourdomain.com/api/cms/webhooks/wordpress
```

#### Shopify Webhook URL:
```
https://yourdomain.com/api/cms/webhooks/shopify
```
**Topics:** `blogs/create`, `blogs/update`, `articles/create`, `articles/update`

#### Notion Webhook URL:
```
https://yourdomain.com/api/cms/webhooks/notion
```

---

## API Reference

### List Integrations
```
GET /api/cms/integrations
```
Returns all CMS integrations for the authenticated user (tokens hidden).

### Get Single Integration
```
GET /api/cms/integrations/{id}
```

### Update Integration
```
PATCH /api/cms/integrations/{id}
{
  "status": "connected",
  "auto_publish_enabled": true,
  "settings": { "key": "value" }
}
```

### Delete Integration
```
DELETE /api/cms/integrations/{id}
```

### Manual Sync
```
POST /api/cms/sync
{
  "integration_id": "uuid-here"
}
```

### Publish Content
```
POST /api/cms/publish
{
  "integration_id": "uuid-here",
  "title": "Title",
  "content": "Content",
  "excerpt": "Summary",
  "status": "publish"
}
```

---

## Database Schema

### `cms_integrations` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `site_id` | UUID | References sites (nullable) |
| `cms_type` | VARCHAR(50) | wordpress, shopify, or notion |
| `access_token` | TEXT | OAuth/API token (encrypted) |
| `refresh_token` | TEXT | OAuth refresh token (nullable) |
| `site_url` | TEXT | CMS site URL |
| `status` | VARCHAR(20) | connected, disconnected, failed |
| `last_sync_at` | TIMESTAMPTZ | Last successful sync |
| `auto_publish_enabled` | BOOLEAN | Enable daily auto-sync |
| `settings` | JSONB | Platform-specific settings |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Update timestamp |

---

## Status Indicators

In the UI, integrations display:
- 🟢 **Connected** - Active and working
- ⚪ **Disconnected** - Manually disconnected
- 🔴 **Failed** - Authentication or sync error

---

## Troubleshooting

### Connection Failed
- **WordPress:** Verify site URL doesn't have trailing slash
- **Shopify:** Ensure shop name includes `.myshopify.com`
- **Notion:** Check integration token and database sharing

### Sync Errors
- Check token hasn't expired
- Verify API permissions are still active
- Review browser console for detailed error messages

### Publishing Fails
- **Notion:** Ensure `database_id` is configured in settings
- **Shopify:** Verify at least one blog exists
- **WordPress:** Check post status permissions

---

## Security Notes

- All tokens are stored encrypted in the database
- Tokens are never exposed in API responses
- Webhook endpoints validate request signatures (where applicable)
- Cron jobs require authorization header

---

## Future Enhancements

Planned features:
- [ ] OAuth 2.0 flow for WordPress.com
- [ ] Full OAuth for Shopify apps
- [ ] Notion OAuth integration
- [ ] Content mapping & transformation
- [ ] Bidirectional field syncing
- [ ] Multi-site support
- [ ] Bulk publishing

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review network requests in DevTools
3. Verify CMS platform API status
4. Check database logs for failed operations

---

**Last Updated:** December 12, 2025
