-- Create daily_scores table
create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  score numeric(10, 2) not null default 0,
  tasks_completed integer not null default 0,
  total_tasks integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Enable RLS
alter table public.daily_scores enable row level security;

-- RLS policies for daily_scores
create policy "users_select_own_scores"
  on public.daily_scores for select
  using (auth.uid() = user_id);

create policy "users_insert_own_scores"
  on public.daily_scores for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_scores"
  on public.daily_scores for update
  using (auth.uid() = user_id);

-- Create index for performance
create index if not exists daily_scores_user_id_date_idx on public.daily_scores(user_id, date desc);
