create policy "sellers can read their order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.seller_stores ss
    where ss.id = order_items.seller_id
      and ss.owner_id = (select auth.uid())
      and exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'seller'
          and p.is_active = true
      )
  )
);
