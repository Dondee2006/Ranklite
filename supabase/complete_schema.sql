-- Ranklite Complete Database Schema (Consolidated)
-- Source of truth as of 2025-12-22

-- 1. SITES TABLE
create table sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  website_url text, -- For some reason both URL and website_url exist
  domain text,
  description text,
  business_name text,
  business_description text,
  language text default 'en',
  country text default 'US',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ARTICLES TABLE
create table articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text,
  content text,
  excerpt text,
  meta_description text,
  keyword text,
  secondary_keywords text[], -- Likely text array in Postgres
  article_type text,
  search_intent text,
  word_count integer,
  cta_placement text,
  featured_image_url text,
  status text not null default 'draft', -- Options: draft, published, generating, scheduled, planned
  scheduled_date date,
  published_at timestamptz,
  seo_score integer,
  readability_score integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint articles_status_check check (status in ('draft', 'published', 'scheduled', 'planned', 'generating', 'qa_validated')),

  -- MISSING COLUMNS (Required by Code but currently missing from Live DB)
  -- The following columns should be added via migration:
  html_content text,
  markdown_content text,
  outline jsonb,
  internal_links jsonb,
  external_links jsonb,
  images jsonb,
  featured_image text,
  cms_exports jsonb
);

-- 3. CONTENT CALENDAR TABLE
create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  month int not null,
  year int not null,
  generated_at timestamptz default now(),
  status text default 'active',
  created_at timestamptz default now(),
  unique (site_id, month, year)
);

-- 4. LINKING FEATURES
create table linking_configurations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  link_source text not null default 'sitemap',
  sitemap_url text,
  last_scan_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_site_config unique (site_id)
);

create table detected_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  url text not null,
  title text,
  content_hash text,
  detected_at timestamptz default now(),
  created_at timestamptz default now(),
  constraint unique_site_url unique (site_id, url)
);

create table internal_link_suggestions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  source_url text not null,
  target_url text not null,
  anchor_text text not null,
  relevance_score integer not null default 0,
  reasoning text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  constraint check_relevance_score check (relevance_score >= 0 and relevance_score <= 100),
  constraint check_status check (status in ('pending', 'approved', 'rejected'))
);

-- 5. BACKLINK ENGINE
create table backlink_platforms (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  site_domain text not null,
  submission_type text not null check (submission_type in ('api', 'form', 'profile')),
  submission_url text,
  automation_allowed boolean default false,
  requires_login boolean default false,
  has_captcha boolean default false,
  robots_txt_allows boolean default true,
  tos_allows_automation boolean default true,
  domain_rating int,
  monthly_traffic text,
  api_schema jsonb,
  form_fields jsonb,
  category text,
  notes text,
  last_checked_at timestamptz,
  created_at timestamptz default now()
);

create table backlink_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_url text,
  status text default 'active',
  agent_status text default 'idle',
  current_step text,
  total_backlinks int default 0,
  unique_sources int default 0,
  avg_domain_rating int default 0,
  this_month_backlinks int default 0,
  is_paused boolean default false,
  daily_submission_count int default 0,
  pending_tasks int default 0,
  manual_review_count int default 0,
  failed_tasks int default 0,
  max_daily_submissions int default 10,
  min_domain_rating int default 30,
  last_scan_at timestamptz,
  next_scan_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS POLICIES (Summary)
-- All tables have RLS enabled, ensuring users only access their own data 
-- via user_id or site_id linked to their account.
