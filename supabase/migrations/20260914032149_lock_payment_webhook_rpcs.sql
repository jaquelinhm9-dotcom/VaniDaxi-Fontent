-- Harden payment lifecycle RPCs so only the server-side service role can call them.

create or replace function public.mark_commercial_order_paid(p_order_id uuid, p_payment_id text default null)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare v_order public.orders%rowtype;
begin
  if current_user not in ('postgres','service_role') then
    raise exception 'service role only';
  end if;

  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'order not found'; end if;

  if v_order.status='pending' then
    update public.orders
      set status='paid',
          payment_provider=coalesce(nullif(payment_provider,''),'stripe'),
          payment_id=coalesce(nullif(p_payment_id,''),payment_id),
          updated_at=now()
    where id=p_order_id
    returning * into v_order;
  elsif v_order.status in ('paid','processing','shipped','delivered') then
    if p_payment_id is not null and v_order.payment_id is not null and v_order.payment_id <> p_payment_id then
      raise exception 'order already paid with a different payment';
    end if;
  else
    raise exception 'order cannot be marked paid from current status';
  end if;

  return v_order;
end;
$$;

create or replace function public.release_expired_commercial_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_changed boolean := false;
  v_promo public.promotions%rowtype;
  v_provider text;
begin
  if current_user not in ('postgres','service_role') then
    raise exception 'service role only';
  end if;

  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status <> 'pending' then return false; end if;

  v_provider := lower(coalesce(nullif(v_order.payment_provider,''),'unknown'));

  update public.orders
    set status='cancelled',
        payment_id=null,
        notes=trim(both from coalesce(notes,'') || case when coalesce(notes,'')='' then '' else E'\n' end ||
          'Checkout pendiente expirado (' || v_provider || '); inventario liberado.'),
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
$$;

revoke execute on function public.mark_commercial_order_paid(uuid,text) from public, anon, authenticated;
grant execute on function public.mark_commercial_order_paid(uuid,text) to service_role;

revoke execute on function public.release_expired_commercial_order(uuid) from public, anon, authenticated;
grant execute on function public.release_expired_commercial_order(uuid) to service_role;
