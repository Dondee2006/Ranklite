-- Articles table
create table articles (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  user_id uuid not null,
  title text not null,
  content text not null,
  status text not null default 'scheduled',
  scheduled_date date not null,
  created_at timestamptz default now(),

  constraint fk_site foreign key (site_id) references sites(id) on delete cascade,
  constraint fk_user foreign key (user_id) references auth.users(id) on delete cascade
);

-- RLS
alter table articles enable row level security;
create policy "Users can read their own articles" on articles for select using (auth.uid() = user_id);
create policy "Users can insert their own articles" on articles for insert with check (auth.uid() = user_id);
create policy "Users can update their own articles" on articles for update using (auth.uid() = user_id);

-- Linking Configuration table
create table linking_configurations (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  user_id uuid not null,
  link_source text not null default 'sitemap',
  sitemap_url text,
  last_scan_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint fk_site foreign key (site_id) references sites(id) on delete cascade,
  constraint fk_user foreign key (user_id) references auth.users(id) on delete cascade,
  constraint unique_site_config unique (site_id)
);

-- RLS for linking_configurations
alter table linking_configurations enable row level security;
create policy "Users can read their own linking configs" on linking_configurations for select using (auth.uid() = user_id);
create policy "Users can insert their own linking configs" on linking_configurations for insert with check (auth.uid() = user_id);
create policy "Users can update their own linking configs" on linking_configurations for update using (auth.uid() = user_id);

-- Detected Links table
create table detected_links (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  url text not null,
  title text,
  content_hash text,
  detected_at timestamptz default now(),
  created_at timestamptz default now(),

  constraint fk_site foreign key (site_id) references sites(id) on delete cascade,
  constraint unique_site_url unique (site_id, url)
);

-- RLS for detected_links
alter table detected_links enable row level security;
create policy "Users can read their own detected links" on detected_links for select using (
  exists (
    select 1 from sites where sites.id = detected_links.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can insert their own detected links" on detected_links for insert with check (
  exists (
    select 1 from sites where sites.id = detected_links.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can update their own detected links" on detected_links for update using (
  exists (
    select 1 from sites where sites.id = detected_links.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can delete their own detected links" on detected_links for delete using (
  exists (
    select 1 from sites where sites.id = detected_links.site_id and sites.user_id = auth.uid()
  )
);

-- Internal Link Suggestions table
create table internal_link_suggestions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null,
  source_url text not null,
  target_url text not null,
  anchor_text text not null,
  relevance_score integer not null default 0,
  reasoning text,
  status text not null default 'pending',
  created_at timestamptz default now(),

  constraint fk_site foreign key (site_id) references sites(id) on delete cascade,
  constraint check_relevance_score check (relevance_score >= 0 and relevance_score <= 100),
  constraint check_status check (status in ('pending', 'approved', 'rejected'))
);

-- RLS for internal_link_suggestions
alter table internal_link_suggestions enable row level security;
create policy "Users can read their own link suggestions" on internal_link_suggestions for select using (
  exists (
    select 1 from sites where sites.id = internal_link_suggestions.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can insert their own link suggestions" on internal_link_suggestions for insert with check (
  exists (
    select 1 from sites where sites.id = internal_link_suggestions.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can update their own link suggestions" on internal_link_suggestions for update using (
  exists (
    select 1 from sites where sites.id = internal_link_suggestions.site_id and sites.user_id = auth.uid()
  )
);
create policy "Users can delete their own link suggestions" on internal_link_suggestions for delete using (
  exists (
    select 1 from sites where sites.id = internal_link_suggestions.site_id and sites.user_id = auth.uid()
  )
);
