-- Reserve promotion usage when a pending order is created and release it only
-- when Stripe reports checkout.session.expired. This prevents concurrent
-- checkouts from exceeding usage_limit while avoiding consumption on payment
-- retries.

create or replace function public.create_commercial_order(
  p_items jsonb,
  p_shipping_address jsonb default '{}'::jsonb,
  p_promotion_id uuid default null,
  p_promo_code text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_promo public.promotions%rowtype;
  v_qty integer;
  v_unit numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_before_stock integer;
  v_promo_code text := nullif(upper(trim(coalesce(p_promo_code,''))), '');
  v_order_number text := 'VD-' || to_char(now(),'YYYYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then raise exception 'cart is empty'; end if;
  perform set_config('vani.allow_stock_change','on',true);

  insert into public.orders(order_number,user_id,status,subtotal,discount,shipping_cost,total,shipping_address)
  values(v_order_number,v_uid,'pending',0,0,0,0,coalesce(p_shipping_address,'{}'::jsonb))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1,least(coalesce((v_item->>'qty')::integer,1),100));
    select * into v_product from public.products where id=(v_item->>'product_id')::uuid for update;
    if not found or v_product.status<>'approved' then raise exception 'product is not available'; end if;
    if coalesce(v_product.stock,0)<v_qty then raise exception 'insufficient stock'; end if;
    v_unit := v_product.price;
    if v_unit is null or v_unit<0 then raise exception 'invalid product price'; end if;
    v_before_stock := v_product.stock;
    update public.products set stock=stock-v_qty,updated_at=now() where id=v_product.id and stock>=v_qty;
    if not found then raise exception 'insufficient stock'; end if;
    insert into public.inventory_movements(product_id,seller_id,actor_id,movement_type,quantity_delta,stock_before,stock_after,note)
    values(v_product.id,v_product.seller_id,v_uid,'sale',-v_qty,v_before_stock,v_before_stock-v_qty,'Reserva de inventario al crear pedido');
    insert into public.order_items(order_id,product_id,seller_id,product_name,quantity,unit_price,total_price)
    values(v_order_id,v_product.id,v_product.seller_id,v_product.name,v_qty,v_unit,v_unit*v_qty);
    v_subtotal := v_subtotal + v_unit*v_qty;
  end loop;

  if p_promotion_id is not null then
    select * into v_promo from public.promotions where id=p_promotion_id for update;
  elsif v_promo_code is not null then
    select * into v_promo from public.promotions where upper(promo_code)=v_promo_code for update;
  else
    select * into v_promo from public.promotions
    where is_active=true and automatic=true
      and (start_at is null or start_at<=now())
      and (end_at is null or end_at>=now())
      and (usage_limit is null or usage_count<usage_limit)
    order by created_at desc limit 1 for update;
  end if;

  if v_promo.id is not null then
    if not v_promo.is_active then raise exception 'promotion is not active'; end if;
    if v_promo.start_at is not null and v_promo.start_at>now() then raise exception 'promotion is not active yet'; end if;
    if v_promo.end_at is not null and v_promo.end_at<now() then raise exception 'promotion has expired'; end if;
    if v_promo.usage_limit is not null and v_promo.usage_count>=v_promo.usage_limit then raise exception 'promotion usage limit reached'; end if;
    if v_promo.registration_promotion and not exists(select 1 from public.user_promotions up where up.user_id=v_uid and up.promotion_id=v_promo.id and up.used=false) then raise exception 'promotion is not assigned to this user'; end if;

    if v_promo.promotion_type='percentage' then
      v_discount := round(v_subtotal * least(greatest(v_promo.discount_value,0),100) / 100,2);
    elsif v_promo.promotion_type='fixed_amount' then
      v_discount := least(v_subtotal,greatest(v_promo.discount_value,0));
    elsif v_promo.promotion_type='free_shipping' then
      v_discount := 0; v_shipping := 0;
    end if;

    update public.promotions set usage_count=coalesce(usage_count,0)+1,updated_at=now() where id=v_promo.id;
    if v_promo.registration_promotion then
      update public.user_promotions set used=true,used_at=coalesce(used_at,now()) where user_id=v_uid and promotion_id=v_promo.id and used=false;
    end if;
  end if;

  v_discount := least(v_subtotal,greatest(v_discount,0));
  v_total := greatest(0,round(v_subtotal-v_discount+v_shipping,2));
  update public.orders
  set subtotal=round(v_subtotal,2),discount=round(v_discount,2),shipping_cost=round(v_shipping,2),total=v_total,
      promotion_id=case when v_promo.id is not null then v_promo.id else null end,updated_at=now()
  where id=v_order_id;
  return v_order_id;
end;
$$;

create or replace function public.release_expired_commercial_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order public.orders%rowtype;
  v_changed boolean := false;
  v_promo public.promotions%rowtype;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status <> 'pending' then return false; end if;
  update public.orders
    set status='cancelled',payment_provider=coalesce(payment_provider,'stripe'),payment_id=null,
        notes=trim(both from coalesce(notes,'') || case when coalesce(notes,'')='' then '' else E'\n' end || 'Checkout de Stripe expirado; inventario liberado.'),updated_at=now()
    where id=p_order_id and status='pending';
  get diagnostics v_changed = row_count;
  if v_changed and v_order.promotion_id is not null then
    select * into v_promo from public.promotions where id=v_order.promotion_id for update;
    if found then
      update public.promotions set usage_count=greatest(0,coalesce(usage_count,0)-1),updated_at=now() where id=v_promo.id;
      if v_promo.registration_promotion then
        update public.user_promotions set used=false,used_at=null where user_id=v_order.user_id and promotion_id=v_promo.id and used=true;
      end if;
    end if;
  end if;
  return v_changed;
end;
$$;

create or replace function public.mark_commercial_order_paid(p_order_id uuid,p_payment_id text default null)
returns public.orders
language plpgsql
security definer
set search_path to 'public'
as $$
declare v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if v_order.status='pending' then
    update public.orders set status='paid',payment_provider='stripe',payment_id=coalesce(nullif(p_payment_id,''),payment_id),updated_at=now()
    where id=p_order_id returning * into v_order;
  end if;
  return v_order;
end;
$$;

revoke all on function public.mark_commercial_order_paid(uuid,text) from public;
revoke all on function public.mark_commercial_order_paid(uuid,text) from anon;
grant execute on function public.mark_commercial_order_paid(uuid,text) to service_role;
grant execute on function public.mark_commercial_order_paid(uuid,text) to authenticated;
