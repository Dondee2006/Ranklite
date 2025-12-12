# Google Search Console (GSC) Integration Guide

## Overview

This document describes the complete Google Search Console integration for Ranklite, enabling OAuth authentication, performance data sync, and AI-powered content generation workflows.

## Features Implemented

### 1. OAuth 2.0 Connection Flow
- **Endpoint**: `/api/gsc/auth`
- **Callback**: `/api/gsc/callback`
- Secure token storage with auto-refresh
- User authentication via Google OAuth
- Scope: `https://www.googleapis.com/auth/webmasters.readonly`

### 2. Data Fetching
Automatically fetches:
- **Site List**: All Search Console properties for authenticated user
- **Performance Metrics**: 
  - Queries (keywords)
  - Pages (URLs)
  - Clicks
  - Impressions
  - CTR (Click-through rate)
  - Average position
- **Index Coverage**: Crawl errors, indexed pages, mobile usability

### 3. Data Storage

#### Tables Created:

**`gsc_integrations`**
```sql
- id: UUID
- site_id: UUID (FK to sites)
- access_token: TEXT (encrypted)
- refresh_token: TEXT (encrypted)
- token_expires_at: TIMESTAMP
- scope: TEXT
- site_url: TEXT
- last_sync_at: TIMESTAMP
- auto_refresh_enabled: BOOLEAN
- metrics: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**`gsc_performance_data`**
```sql
- id: UUID
- site_id: UUID (FK to sites)
- date: DATE
- page: TEXT
- query: TEXT
- clicks: INTEGER
- impressions: INTEGER
- ctr: DECIMAL(5,4)
- position: DECIMAL(5,2)
- country: TEXT
- device: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**`gsc_index_coverage`**
```sql
- id: UUID
- site_id: UUID (FK to sites)
- url: TEXT
- status: TEXT
- issue_type: TEXT
- last_crawled: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 4. API Routes

#### Connection
- `POST /api/gsc/auth` - Start OAuth flow
- `GET /api/gsc/callback` - OAuth callback handler

#### Data Management
- `POST /api/gsc/sync` - Manual sync trigger
- `GET /api/gsc/data` - Fetch stored GSC data
- `POST /api/gsc/disconnect` - Remove integration

#### Autopilot
- `POST /api/gsc/generate-content` - Generate content briefs from GSC insights
  - Action: `create_articles` - Create article briefs
  - Action: `suggest_meta_updates` - Generate meta tag suggestions

#### Cron Jobs
- `POST /api/gsc/cron/daily-sync` - Daily automated sync (runs at 9 AM UTC)

### 5. Autopilot AI Workflows

#### Low-Performing Pages Analysis
Identifies pages with:
- High impressions (>100)
- Low CTR (<2%)
- Position >10

**Generates**:
- Meta title/description suggestions
- Content optimization recommendations
- Priority ranking

#### Content Opportunities
Identifies queries:
- Ranking on page 2 (positions 11-20)
- High impression volume
- Potential to reach page 1

**Generates**:
- Article briefs with target keywords
- Suggested article types
- Recommended word counts
- Search intent classification

#### Auto-Publishing Integration
Works with existing CMS integrations:
- WordPress
- Shopify
- Wix
- Webflow
- Notion

Content generated from GSC insights can be automatically published to connected platforms.

### 6. Error Handling

#### Token Refresh
- Automatic refresh when token expires
- 3 retry attempts on failed API calls
- Exponential backoff (1s, 2s, 3s)

#### Sync Errors
- Logged to database
- User notification on critical failures
- Re-authentication prompt when needed

#### API Rate Limits
- Respects Google Search Console API limits
- Batch processing for large datasets (1000 records/batch)
- Max 25,000 rows per request

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Search Console API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/gsc/callback`
   - `https://yourdomain.com/api/gsc/callback`

### 2. Environment Variables

Add to `.env.local`:
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gsc/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_cron_secret
```

### 3. Cron Configuration

The daily sync is configured in `cron.json`:
```json
{
  "path": "/api/gsc/cron/daily-sync",
  "schedule": "0 9 * * *"
}
```

Set up your deployment platform (Vercel, Railway, etc.) to call this endpoint daily.

## Usage

### Connecting GSC

1. Navigate to Dashboard → Settings → GSC tab
2. Click "Connect Google Search Console"
3. Authorize Ranklite to access GSC data
4. Initial sync starts automatically

### Manual Sync

```javascript
const response = await fetch('/api/gsc/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

### Generate Content from GSC Insights

```javascript
const response = await fetch('/api/gsc/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'create_articles' })
});
```

### Get Meta Update Suggestions

```javascript
const response = await fetch('/api/gsc/generate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'suggest_meta_updates' })
});
```

## Data Flow

```
User clicks "Connect GSC"
    ↓
OAuth flow initiated (/api/gsc/auth)
    ↓
User authorizes in Google
    ↓
Callback receives tokens (/api/gsc/callback)
    ↓
Tokens stored encrypted in gsc_integrations
    ↓
Initial sync triggered automatically
    ↓
Performance data stored in gsc_performance_data
    ↓
Daily cron syncs new data (9 AM UTC)
    ↓
AI analyzes data for opportunities
    ↓
Content briefs generated automatically
    ↓
Articles published to connected CMS
```

## Security

- Tokens stored encrypted in Supabase
- Row Level Security (RLS) disabled for simplicity
- Service role key used for admin operations
- OAuth state parameter prevents CSRF
- Token refresh handled automatically

## Monitoring

### Check Integration Status
```sql
SELECT 
  gi.site_url,
  gi.last_sync_at,
  gi.auto_refresh_enabled,
  COUNT(gpd.id) as performance_records
FROM gsc_integrations gi
LEFT JOIN gsc_performance_data gpd ON gpd.site_id = gi.site_id
GROUP BY gi.id;
```

### Check Recent Performance Data
```sql
SELECT 
  date,
  SUM(clicks) as total_clicks,
  SUM(impressions) as total_impressions,
  AVG(ctr) as avg_ctr,
  AVG(position) as avg_position
FROM gsc_performance_data
WHERE site_id = 'your-site-id'
GROUP BY date
ORDER BY date DESC
LIMIT 30;
```

## Troubleshooting

### Token Expired
- Automatic refresh should handle this
- If fails, user will be prompted to reconnect
- Check `token_expires_at` in `gsc_integrations`

### No Data Syncing
- Verify OAuth credentials are correct
- Check `last_sync_at` timestamp
- Review terminal logs for errors
- Ensure site has data in Search Console

### API Errors
- Check Google Search Console API quota
- Verify site ownership in GSC
- Confirm API is enabled in Google Cloud Console

## Future Enhancements

- [ ] Historical data import (beyond 30 days)
- [ ] Real-time sync via webhooks
- [ ] Custom date range selection
- [ ] Advanced filtering and segmentation
- [ ] Export reports to PDF/CSV
- [ ] Slack/email notifications for insights
- [ ] A/B testing for meta tags
- [ ] Competitor tracking integration

## Support

For issues or questions:
1. Check browser console for errors
2. Review terminal logs
3. Verify environment variables
4. Check database tables for data
5. Test API endpoints manually

## Files Structure

```
src/
├── app/api/gsc/
│   ├── auth/route.ts          # OAuth initiation
│   ├── callback/route.ts      # OAuth callback
│   ├── sync/route.ts          # Manual sync trigger
│   ├── data/route.ts          # Fetch GSC data
│   ├── disconnect/route.ts    # Remove integration
│   ├── generate-content/route.ts  # AI content generation
│   └── cron/
│       └── daily-sync/route.ts    # Daily cron job
├── lib/gsc/
│   ├── client.ts              # GSC API client
│   ├── sync.ts                # Data sync logic
│   └── autopilot.ts           # AI workflows
└── app/dashboard/settings/
    └── components/
        └── settings-content.tsx    # UI for GSC connection
```
