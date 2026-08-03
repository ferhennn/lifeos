-- Run this once after `pnpm db:push` picks up the linkedin_posts table.
alter table public.linkedin_posts enable row level security;

create policy "linkedin_posts: owner full access" on public.linkedin_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
