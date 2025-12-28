-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  completed boolean not null default false,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS policies for tasks
create policy "users_select_own_tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "users_insert_own_tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "users_delete_own_tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create index for performance
create index if not exists tasks_user_id_date_idx on public.tasks(user_id, date desc);
