create unique index if not exists favorites_user_product_uidx on public.favorites(user_id, product_id);
create index if not exists products_catalog_status_idx on public.products(status, created_at desc);
create index if not exists products_category_status_idx on public.products(category_id, status);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists cart_items_cart_idx on public.cart_items(cart_id);
create index if not exists reviews_product_approved_idx on public.reviews(product_id, is_approved, created_at desc);
