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
