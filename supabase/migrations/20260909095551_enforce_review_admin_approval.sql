alter table public.reviews alter column is_approved set default false;

drop policy if exists "users can insert verified delivered reviews" on public.reviews;
create policy "users can insert verified delivered reviews"
on public.reviews for insert to authenticated
with check (
  user_id = (select auth.uid())
  and is_approved = false
  and exists (
    select 1 from public.order_items oi
    join public.orders o on o.id=oi.order_id
    where oi.order_id=reviews.order_id
      and oi.product_id=reviews.product_id
      and o.user_id=(select auth.uid())
      and o.status='delivered'
  )
);
