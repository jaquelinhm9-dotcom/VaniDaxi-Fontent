-- VaniDaxi marketplace schema for Supabase/PostgreSQL
-- Run this script once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  phone text default '',
  avatar_url text,
  role text not null default 'buyer' check (role in ('buyer','seller','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  old_price numeric(12,2),
  category text not null default 'Otros',
  type text not null default 'Nuevo',
  image text,
  description text not null default '',
  specifications jsonb not null default '[]'::jsonb,
  stock integer not null default 1 check (stock >= 0),
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  reviews integer not null default 0 check (reviews >= 0),
  discount integer not null default 0 check (discount between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  reference text,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','shipped','delivered','cancelled')),
  payment_method text not null default 'contra_entrega',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  seller_id uuid references public.profiles(id) on delete set null
);

create index if not exists products_seller_id_idx on public.products(seller_id);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (is_active = true or auth.uid() = seller_id);
drop policy if exists "products_seller_insert" on public.products;
create policy "products_seller_insert" on public.products for insert with check (auth.uid() = seller_id);
drop policy if exists "products_seller_update" on public.products;
create policy "products_seller_update" on public.products for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
drop policy if exists "products_seller_delete" on public.products;
create policy "products_seller_delete" on public.products for delete using (auth.uid() = seller_id);

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "orders_own_select" on public.orders;
create policy "orders_own_select" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "orders_own_insert" on public.orders;
create policy "orders_own_insert" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "order_items_own_select" on public.order_items;
create policy "order_items_own_select" on public.order_items
for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
drop policy if exists "order_items_own_insert" on public.order_items;
create policy "order_items_own_insert" on public.order_items
for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
