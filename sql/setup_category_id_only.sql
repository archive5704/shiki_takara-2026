-- 四季の宝物 category_id 完全統一版セットアップSQL
-- 旧 category カラムを category_id へ移行し、最終的に旧 category カラムを削除します。

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.treasures
  add column if not exists category_id uuid references public.categories(id);

insert into public.categories (name, sort_order)
values
  ('自然', 10),
  ('山菜', 20),
  ('気候', 30),
  ('生きもの', 40),
  ('食', 50)
on conflict (name) do nothing;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'treasures'
      and column_name = 'category'
  ) then
    insert into public.categories (name, sort_order)
    select distinct category, 999
    from public.treasures
    where coalesce(category, '') <> ''
    on conflict (name) do nothing;

    update public.treasures t
    set category_id = c.id
    from public.categories c
    where t.category_id is null
      and coalesce(t.category, '') <> ''
      and c.name = t.category;
  end if;
end $$;

update public.treasures t
set category_id = c.id
from public.categories c
where t.category_id is null
  and c.name = '自然';

alter table public.treasures
  alter column category_id set not null;

-- 旧 category カラムを完全削除
alter table public.treasures
  drop column if exists category;

alter table public.categories enable row level security;
alter table public.treasures enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.categories to anon;
grant select, insert, update, delete on table public.categories to authenticated;
grant select on table public.treasures to anon;
grant select, insert, update, delete on table public.treasures to authenticated;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
on public.categories
for select
to public
using (true);

drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories"
on public.categories
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "public read treasures" on public.treasures;
create policy "public read treasures"
on public.treasures
for select
to public
using (true);

drop policy if exists "admin write treasures" on public.treasures;
create policy "admin write treasures"
on public.treasures
for all
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
