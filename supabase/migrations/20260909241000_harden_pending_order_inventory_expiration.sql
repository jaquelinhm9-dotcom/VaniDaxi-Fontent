create or replace function public.release_expired_commercial_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order public.orders%rowtype;
  v_changed boolean := false;
  v_promo public.promotions%rowtype;
  v_note text;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status <> 'pending' then return false; end if;

  v_note := case
    when coalesce(v_order.payment_provider,'')='mercadopago' then 'Checkout de Mercado Pago expirado; inventario liberado.'
    when coalesce(v_order.payment_provider,'')='stripe' then 'Checkout de Stripe expirado; inventario liberado.'
    else 'Checkout expirado; inventario liberado.'
  end;

  update public.orders
    set status='cancelled',
        payment_id=null,
        notes=trim(both from coalesce(notes,'') || case when coalesce(notes,'')='' then '' else E'\n' end || v_note),
        updated_at=now()
    where id=p_order_id and status='pending';
  get diagnostics v_changed = row_count;

  if v_changed and v_order.promotion_id is not null then
    select * into v_promo from public.promotions where id=v_order.promotion_id for update;
    if found then
      update public.promotions
      set usage_count=greatest(0,coalesce(usage_count,0)-1), updated_at=now()
      where id=v_promo.id;
      if v_promo.registration_promotion then
        update public.user_promotions
        set used=false, used_at=null
        where user_id=v_order.user_id and promotion_id=v_promo.id and used=true;
      end if;
    end if;
  end if;

  return v_changed;
end;
$function$;

create or replace function public.release_expired_pending_orders(p_max_age interval default interval '30 minutes')
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order_id uuid;
  v_count integer := 0;
begin
  if p_max_age < interval '5 minutes' then
    raise exception 'minimum pending-order age is 5 minutes';
  end if;
  for v_order_id in
    select id
    from public.orders
    where status='pending'
      and created_at <= now() - p_max_age
    order by created_at
    for update skip locked
  loop
    if public.release_expired_commercial_order(v_order_id) then
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$function$;

revoke all on function public.release_expired_pending_orders(interval) from public, anon, authenticated;
grant execute on function public.release_expired_pending_orders(interval) to service_role;
revoke all on function public.release_expired_commercial_order(uuid) from public, anon, authenticated;
grant execute on function public.release_expired_commercial_order(uuid) to service_role;