-- Ranklite ABSOLUTE COMPLETE DATABASE RESTORATION
-- WARNING: This will DELETE EVERYTHING!
-- Execute this in your Supabase SQL Editor.

-- 1. DROP EVERYTHING
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
DROP TABLE IF EXISTS seo_cycles CASCADE; -- MISSING IN PREVIOUS SCRIPT
DROP TABLE IF EXISTS user_plans CASCADE;  -- MISSING IN PREVIOUS SCRIPT
DROP TABLE IF EXISTS plans CASCADE;       -- MISSING IN PREVIOUS SCRIPT
DROP TABLE IF EXISTS sites CASCADE;

-- 2. RECREATE TABLES

-- PLANS TABLE
create table plans (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  period text default 'month',
  created_at timestamptz default now()
);

-- SEED PLANS
insert into plans (id, name, price) values 
('free', 'Free', 0),
('pro', 'Pro Tier', 59);

-- SITES TABLE
create table sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website_url text, -- The app uses url or website_url inconsistently
  url text,
  niche text,
  target_audience text,
  brand_voice text,
  description text,
  language text default 'en',
  country text default 'US',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ARTICLES TABLE
create table articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text,
  content text,
  html_content text,
  markdown_content text,
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
  outline jsonb,
  internal_links jsonb,
  external_links jsonb,
  images jsonb,
  featured_image text,
  cms_exports jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint articles_status_check check (status in ('draft', 'published', 'scheduled', 'planned', 'generating', 'qa_validated', 'generated'))
);

-- SEO CYCLES
create table seo_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  status text default 'active',
  posts_per_month integer default 10,
  backlinks_per_post integer default 20,
  max_backlinks_per_month integer default 200,
  min_dr_for_backlinks integer default 30,
  daily_automation_limit integer default 10,
  qa_validation_enabled boolean default true,
  auto_publish boolean default false,
  next_run_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- USER PLANS
create table user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references plans(id),
  status text default 'active',
  start_date timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ARTICLE SETTINGS
create table article_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references sites(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUTOPILOT SETTINGS
create table autopilot_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references sites(id) on delete cascade,
  enabled boolean default true,
  publish_time_start integer default 7,
  publish_time_end integer default 9,
  timezone text default 'UTC',
  articles_per_day integer default 1,
  preferred_article_types text[] default '{}',
  tone text default 'natural',
  style_preferences jsonb default '{}',
  cms_targets text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CONTENT CALENDAR
create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  month integer not null,
  year integer not null,
  generated_at timestamptz default now(),
  status text default 'active',
  created_at timestamptz default now(),
  unique(site_id, month, year)
);

-- BACKLINK ENGINE TABLES
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

create table backlink_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform_id uuid references backlink_platforms(id) on delete set null,
  website_url text not null,
  status text not null default 'pending',
  priority int default 0,
  submission_type text,
  submission_data jsonb,
  attempt_count int default 0,
  max_attempts int default 3,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  scheduled_for timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. RLS ENABLEMENT
alter table sites enable row level security;
alter table articles enable row level security;
alter table seo_cycles enable row level security;
alter table user_plans enable row level security;
alter table article_settings enable row level security;
alter table autopilot_settings enable row level security;
alter table backlink_campaigns enable row level security;
alter table backlink_tasks enable row level security;

-- 4. BASIC POLICIES
create policy "Users can manage their own sites" on sites for all using (user_id = auth.uid());
create policy "Users can manage their own articles" on articles for all using (user_id = auth.uid());
create policy "Users can manage their own cycles" on seo_cycles for all using (user_id = auth.uid());
create policy "Users can manage their own plans" on user_plans for all using (user_id = auth.uid());
create policy "Users can manage their own campaigns" on backlink_campaigns for all using (user_id = auth.uid());
create policy "Users can manage their own tasks" on backlink_tasks for all using (user_id = auth.uid());

-- Plans are readable by everyone
alter table plans enable row level security;
create policy "Plans are public" on plans for select using (true);
