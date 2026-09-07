create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  address text,
  city text,
  state text,
  country text default 'México',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_url text,
  category text,
  stock integer not null default 1,
  location text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_nonnegative check (price >= 0),
  constraint products_stock_nonnegative check (stock >= 0)
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  total numeric(12,2) not null default 0,
  payment_method text,
  customer_name text,
  customer_phone text,
  customer_address text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_nonnegative check (total >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  price numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_price_nonnegative check (price >= 0)
);

create index if not exists products_seller_id_idx
  on public.products(seller_id);

create index if not exists products_category_idx
  on public.products(category);

create index if not exists products_created_at_idx
  on public.products(created_at desc);

create index if not exists favorites_product_id_idx
  on public.favorites(product_id);

create index if not exists orders_user_id_idx
  on public.orders(user_id);

create index if not exists orders_created_at_idx
  on public.orders(created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items(order_id);

create index if not exists order_items_product_id_idx
  on public.order_items(product_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();


/* =========================================================
   INTEGRIDAD DE PEDIDOS
   ========================================================= */

create or replace function public.validate_order_item_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_price numeric(12,2);
begin
  if new.product_id is null then
    return new;
  end if;

  select price
    into current_price
    from public.products
   where id = new.product_id;

  if current_price is null then
    raise exception 'El producto del pedido ya no existe.';
  end if;

  if round(new.price, 2) <> round(current_price, 2) then
    raise exception 'El precio del producto cambió. Actualiza el carrito e inténtalo de nuevo.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_order_item_price on public.order_items;
create trigger validate_order_item_price
  before insert or update of product_id, price
  on public.order_items
  for each row
  execute function public.validate_order_item_price();


/* =========================================================
   ROW LEVEL SECURITY
   ========================================================= */

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;


drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);


drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);


drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products
for select
using (active = true or auth.uid() = seller_id);


drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own"
on public.products
for insert
to authenticated
with check (auth.uid() = seller_id);


drop policy if exists "products_update_own" on public.products;
create policy "products_update_own"
on public.products
for update
to authenticated
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);


drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own"
on public.products
for delete
to authenticated
using (auth.uid() = seller_id);


drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (auth.uid() = user_id);


drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (auth.uid() = user_id);


drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (auth.uid() = user_id);


drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

/* A seller may see an order when at least one item belongs to that seller. */
drop policy if exists "orders_select_seller" on public.orders;
create policy "orders_select_seller"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.order_items
    join public.products on products.id = order_items.product_id
    where order_items.order_id = orders.id
      and products.seller_id = auth.uid()
  )
);


drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);


drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
on public.orders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "order_items_select_own_order" on public.order_items;
create policy "order_items_select_own_order"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

/* Sellers can see only the order items belonging to their own products. */
drop policy if exists "order_items_select_seller" on public.order_items;
create policy "order_items_select_seller"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = order_items.product_id
      and products.seller_id = auth.uid()
  )
);


drop policy if exists "order_items_insert_own_order" on public.order_items;
create policy "order_items_insert_own_order"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);


drop policy if exists "order_items_update_own_order" on public.order_items;
create policy "order_items_update_own_order"
on public.order_items
for update
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);


drop policy if exists "order_items_delete_own_order" on public.order_items;
create policy "order_items_delete_own_order"
on public.order_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);
