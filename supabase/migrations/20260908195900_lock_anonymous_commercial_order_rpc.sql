-- Remove the anonymous grant inherited by the public role from the order-creation RPC.
revoke execute on function public.create_commercial_order(jsonb, jsonb, uuid, text) from anon;
