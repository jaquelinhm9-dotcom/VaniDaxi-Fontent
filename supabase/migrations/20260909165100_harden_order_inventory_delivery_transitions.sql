create or replace function public.update_order_delivery(p_order_id uuid, p_status text, p_tracking text default null, p_notes text default null)
returns public.orders
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  o public.orders;
  role_name text;
  is_owner boolean;
  result public.orders;
  custody text;
begin
  select * into o from public.orders where id=p_order_id for update;
  if not found then raise exception 'order not found'; end if;

  select p.role into role_name
  from public.profiles p
  where p.id=auth.uid() and p.is_active=true;
  if role_name is null then raise exception 'authentication required'; end if;

  is_owner:=exists(
    select 1
    from public.order_items oi
    join public.seller_stores ss on ss.id=oi.seller_id
    where oi.order_id=o.id and ss.owner_id=auth.uid()
  );

  if role_name='seller' and not is_owner then raise exception 'seller does not own this order'; end if;
  if role_name not in ('seller','admin') then raise exception 'only seller or admin can update delivery'; end if;
  if p_status not in ('pending','preparing','awaiting_vanidaxi','received_by_vanidaxi','in_transit','delivered','failed','cancelled') then raise exception 'invalid delivery status'; end if;
  if p_status='delivered' and o.status not in ('paid','processing','shipped') then raise exception 'order is not ready for delivery completion'; end if;

  if role_name='seller' then
    if o.delivery_provider='vanidaxi' then
      if p_status='preparing' and o.delivery_status not in ('pending','preparing') then raise exception 'invalid local delivery transition'; end if;
      if p_status='awaiting_vanidaxi' and o.delivery_status not in ('preparing','awaiting_vanidaxi') then raise exception 'invalid local delivery transition'; end if;
      if p_status not in ('preparing','awaiting_vanidaxi') then raise exception 'local orders must be handed to VaniDaxi before further delivery updates'; end if;
    else
      if p_status='preparing' and o.delivery_status not in ('pending','preparing') then raise exception 'invalid seller delivery transition'; end if;
      if p_status='in_transit' and o.delivery_status not in ('preparing','in_transit') then raise exception 'order must be prepared before transit'; end if;
      if p_status='delivered' and o.delivery_status not in ('in_transit','delivered') then raise exception 'order must be in transit before delivery'; end if;
      if p_status not in ('preparing','in_transit','delivered') then raise exception 'invalid seller delivery transition'; end if;
    end if;
  end if;

  custody:=case
    when p_status in ('preparing','awaiting_vanidaxi') then 'seller'
    when p_status='received_by_vanidaxi' then 'vanidaxi'
    when p_status='in_transit' then case when o.delivery_provider='vanidaxi' then 'vanidaxi' else 'in_transit' end
    when p_status='delivered' then 'buyer'
    else o.delivery_custody
  end;

  update public.orders
  set delivery_status=p_status,
      delivery_tracking=coalesce(p_tracking,delivery_tracking),
      delivery_notes=coalesce(p_notes,delivery_notes),
      delivery_custody=custody,
      delivery_updated_at=now(),
      delivery_handoff_at=case when p_status='awaiting_vanidaxi' then coalesce(delivery_handoff_at,now()) else delivery_handoff_at end,
      delivery_received_at=case when p_status='received_by_vanidaxi' then coalesce(delivery_received_at,now()) else delivery_received_at end,
      delivered_at=case when p_status='delivered' then coalesce(delivered_at,now()) else delivered_at end,
      status=case
        when p_status='preparing' and status='paid' then 'processing'
        when p_status='in_transit' and status in ('pending','paid','processing') then 'shipped'
        when p_status='delivered' then 'delivered'
        else status
      end,
      updated_at=now()
  where id=o.id
  returning * into result;

  insert into public.order_delivery_events(order_id,status,custody,actor_id,notes,tracking)
  values(result.id,result.delivery_status,result.delivery_custody,auth.uid(),p_notes,p_tracking);

  return result;
end;
$$;
