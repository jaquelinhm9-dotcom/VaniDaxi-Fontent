-- Keep the order-creation SECURITY DEFINER RPC callable only by signed-in users.
-- The function performs authenticated-user and server-side product/order validation.
revoke execute on function public.create_commercial_order(jsonb, jsonb, uuid, text) from public;
revoke execute on function public.create_commercial_order(jsonb, jsonb, uuid, text) from anon;
grant execute on function public.create_commercial_order(jsonb, jsonb, uuid, text) to authenticated;
