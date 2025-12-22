-- Ranklite Database Reset Script
-- WARNING: This will DELETE all existing data!
-- Execute this in your Supabase SQL Editor.

-- 1. DROP EXISTING TABLES (in correct order of dependencies)
DROP TABLE IF EXISTS backlink_logs CASCADE;
DROP TABLE IF EXISTS backlink_verification CASCADE;
DROP TABLE IF EXISTS backlink_tasks CASCADE;
DROP TABLE IF EXISTS backlink_campaigns CASCADE;
DROP TABLE IF EXISTS backlink_platforms CASCADE;
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS internal_link_suggestions CASCADE;
DROP TABLE IF EXISTS detected_links CASCADE;
DROP TABLE IF EXISTS linking_configurations CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS article_settings CASCADE;
DROP TABLE IF EXISTS autopilot_settings CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;
DROP TABLE IF EXISTS target_audiences CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- 2. RECREATE TABLES (Based on Complete Source of Truth)

-- SITES TABLE
create table sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website_url text,
  niche text,
  target_audience text,
  brand_voice text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ARTICLES TABLE (Unified Schema)
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
  secondary_keywords text[],
  article_type text,
  search_intent text,
  word_count integer,
  cta_placement text,
  featured_image_url text,
  status text not null default 'draft',
  scheduled_date date,
  published_at timestamptz,
  seo_score integer,
  readability_score integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Complex Content Storage
  html_content text,
  markdown_content text,
  outline jsonb,
  internal_links jsonb,
  external_links jsonb,
  images jsonb,
  featured_image text,
  cms_exports jsonb,

  constraint articles_status_check check (status in ('draft', 'published', 'scheduled', 'planned', 'generating', 'qa_validated', 'generated'))
);

-- CONTENT CALENDAR TABLE
create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  data jsonb not null,
  month integer not null,
  year integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(site_id, month, year)
);

-- AUTOPILOT SETTINGS
create table autopilot_settings (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references sites(id) on delete cascade,
    enabled boolean default false,
    publish_time_start integer default 7,
    publish_time_end integer default 9,
    timezone text default 'UTC',
    articles_per_day integer default 1,
    preferred_article_types text[],
    tone text default 'natural',
    cms_targets text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(site_id)
);

-- RLS POLICIES (Example for Articles)
alter table sites enable row level security;
alter table articles enable row level security;

create policy "Users can only see their own sites" on sites 
  for all using (auth.uid() = user_id);

create policy "Users can only see their own articles" on articles 
  for all using (auth.uid() = user_id);
