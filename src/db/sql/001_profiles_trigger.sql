-- Run this once in the Supabase SQL editor AFTER running `pnpm db:push`
-- (Drizzle manages the `public` schema; it can't touch `auth.users`, so this
-- trigger is applied by hand to keep `public.profiles` in sync with Supabase Auth.)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security — every table is scoped to the owning user.
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.strategies enable row level security;
alter table public.projects enable row level security;
alter table public.epics enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.subtasks enable row level security;

create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

create policy "goals: owner full access" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "strategies: owner full access" on public.strategies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects: owner full access" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: owner full access" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "epics: owner full access" on public.epics for all
  using (exists (select 1 from public.projects p where p.id = epics.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = epics.project_id and p.user_id = auth.uid()));

create policy "subtasks: owner full access" on public.subtasks for all
  using (exists (select 1 from public.tasks t where t.id = subtasks.task_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.tasks t where t.id = subtasks.task_id and t.user_id = auth.uid()));

create policy "task_dependencies: owner full access" on public.task_dependencies for all
  using (exists (select 1 from public.tasks t where t.id = task_dependencies.task_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.tasks t where t.id = task_dependencies.task_id and t.user_id = auth.uid()));
