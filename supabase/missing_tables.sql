-- Sites Table (CRITICAL DEPENDENCY)
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  description text,
  language text default 'en',
  country text default 'US',
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Target Audiences
create table if not exists target_audiences (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Competitors
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- Article Settings
create table if not exists article_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references sites(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Autopilot Settings
create table if not exists autopilot_settings (
  site_id uuid primary key references sites(id) on delete cascade,
  enabled boolean default true,
  publish_time_start int default 7,
  publish_time_end int default 9,
  timezone text default 'UTC',
  articles_per_day int default 1,
  preferred_article_types text[] default '{}',
  tone text default 'natural',
  style_preferences jsonb default '{}'::jsonb,
  cms_targets text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Content Calendar
create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  month int not null,
  year int not null,
  generated_at timestamptz default now(),
  status text default 'active',
  created_at timestamptz default now(),
  unique (site_id, month, year)
);

-- Backlink Platforms
create table if not exists backlink_platforms (
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

-- Backlink Campaigns
create table if not exists backlink_campaigns (
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

-- Backlink Tasks
create table if not exists backlink_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform_id uuid references backlink_platforms(id) on delete set null,
  website_url text not null,
  status text not null default 'pending',
  priority int default 0,
  submission_type text,
  submission_data jsonb,
  policy_check_result jsonb,
  requires_manual_review boolean default false,
  manual_review_reason text,
  attempt_count int default 0,
  max_attempts int default 3,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  scheduled_for timestamptz,
  completed_at timestamptz,
  error_message text,
  screenshot_url text,
  response_html text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Backlink Verification
create table if not exists backlink_verification (
  id uuid primary key default gen_random_uuid(),
  backlink_id uuid references backlink_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_url text not null,
  expected_anchor_text text,
  found_anchor_text text,
  link_type text check (link_type in ('dofollow', 'nofollow')),
  is_dofollow boolean,
  is_indexed boolean default false,
  verification_status text default 'pending',
  last_verified_at timestamptz,
  next_verification_at timestamptz,
  verification_count int default 0,
  response_status_code int,
  html_snippet text,
  created_at timestamptz default now()
);

-- Backlink Logs
create table if not exists backlink_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references backlink_tasks(id) on delete set null,
  platform_id uuid references backlink_platforms(id) on delete set null,
  action text not null,
  status text,
  details jsonb,
  robots_txt_checked boolean default false,
  tos_compliant boolean default false,
  ip_address text,
  user_agent text,
  screenshot_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table sites enable row level security;
alter table target_audiences enable row level security;
alter table competitors enable row level security;
alter table article_settings enable row level security;
alter table autopilot_settings enable row level security;
alter table content_calendar enable row level security;
alter table backlink_platforms enable row level security;
alter table backlink_campaigns enable row level security;
alter table backlink_tasks enable row level security;
alter table backlink_verification enable row level security;
alter table backlink_logs enable row level security;

-- Policies --

-- Sites
drop policy if exists "Users can read own site" on sites;
create policy "Users can read own site" on sites for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own site" on sites;
create policy "Users can insert own site" on sites for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own site" on sites;
create policy "Users can update own site" on sites for update using (auth.uid() = user_id);

-- Target Audiences
drop policy if exists "Users can read own audiences" on target_audiences;
create policy "Users can read own audiences" on target_audiences for select using (exists (select 1 from sites where sites.id = target_audiences.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can insert own audiences" on target_audiences;
create policy "Users can insert own audiences" on target_audiences for insert with check (exists (select 1 from sites where sites.id = target_audiences.site_id and sites.user_id = auth.uid()));

-- Competitors
drop policy if exists "Users can read own competitors" on competitors;
create policy "Users can read own competitors" on competitors for select using (exists (select 1 from sites where sites.id = competitors.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can insert own competitors" on competitors;
create policy "Users can insert own competitors" on competitors for insert with check (exists (select 1 from sites where sites.id = competitors.site_id and sites.user_id = auth.uid()));

-- Backlink Campaigns
drop policy if exists "Users can read own campaign" on backlink_campaigns;
create policy "Users can read own campaign" on backlink_campaigns for select using (auth.uid() = user_id);

drop policy if exists "Users can update own campaign" on backlink_campaigns;
create policy "Users can update own campaign" on backlink_campaigns for update using (auth.uid() = user_id);

drop policy if exists "Users can insert own campaign" on backlink_campaigns;
create policy "Users can insert own campaign" on backlink_campaigns for insert with check (auth.uid() = user_id);

-- Backlink Tasks
drop policy if exists "Users can read own tasks" on backlink_tasks;
create policy "Users can read own tasks" on backlink_tasks for select using (auth.uid() = user_id);

drop policy if exists "Users can update own tasks" on backlink_tasks;
create policy "Users can update own tasks" on backlink_tasks for update using (auth.uid() = user_id);

-- Autopilot Settings
drop policy if exists "Users can read own autopilot settings" on autopilot_settings;
create policy "Users can read own autopilot settings" on autopilot_settings for select using (exists (select 1 from sites where sites.id = autopilot_settings.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can update own autopilot settings" on autopilot_settings;
create policy "Users can update own autopilot settings" on autopilot_settings for update using (exists (select 1 from sites where sites.id = autopilot_settings.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can insert own autopilot settings" on autopilot_settings;
create policy "Users can insert own autopilot settings" on autopilot_settings for insert with check (exists (select 1 from sites where sites.id = autopilot_settings.site_id and sites.user_id = auth.uid()));

-- Article Settings
drop policy if exists "Users can read own article settings" on article_settings;
create policy "Users can read own article settings" on article_settings for select using (exists (select 1 from sites where sites.id = article_settings.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can insert own article settings" on article_settings;
create policy "Users can insert own article settings" on article_settings for insert with check (exists (select 1 from sites where sites.id = article_settings.site_id and sites.user_id = auth.uid()));

-- Content Calendar
drop policy if exists "Users can read own content calendar" on content_calendar;
create policy "Users can read own content calendar" on content_calendar for select using (exists (select 1 from sites where sites.id = content_calendar.site_id and sites.user_id = auth.uid()));

drop policy if exists "Users can insert own content calendar" on content_calendar;
create policy "Users can insert own content calendar" on content_calendar for insert with check (exists (select 1 from sites where sites.id = content_calendar.site_id and sites.user_id = auth.uid()));
