-- Remove inherited PUBLIC/anonymous execution from SECURITY DEFINER routines.
-- Keep authenticated execution only for RPCs intentionally called by the app;
-- internal trigger/webhook routines are service-side only.

revoke execute on function public.assign_order_delivery_provider() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_vanidaxi_user() from public, anon, authenticated;
revoke execute on function public.mark_commercial_order_paid(uuid, text) from public, anon, authenticated;
revoke execute on function public.release_expired_commercial_order(uuid) from public, anon, authenticated;
revoke execute on function public.notify_delivery_event() from public, anon, authenticated;
revoke execute on function public.notify_order_status_change() from public, anon, authenticated;
revoke execute on function public.notify_return_change() from public, anon, authenticated;
revoke execute on function public.notify_seller_new_order_item() from public, anon, authenticated;
revoke execute on function public.notify_user(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.prevent_client_role_escalation() from public, anon, authenticated;
revoke execute on function public.prevent_direct_stock_change() from public, anon, authenticated;
revoke execute on function public.protect_order_fields_from_sellers() from public, anon, authenticated;
revoke execute on function public.protect_review_fields() from public, anon, authenticated;
revoke execute on function public.record_platform_commission() from public, anon, authenticated;
revoke execute on function public.restock_returned_item() from public, anon, authenticated;
revoke execute on function public.restore_stock_for_cancelled_order() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.sync_platform_commission_status() from public, anon, authenticated;
revoke execute on function public.finalize_return_refund(uuid, text, numeric) from public, anon, authenticated;

-- App RPCs remain callable by signed-in users; their function bodies enforce ownership/role.
revoke execute on function public.create_commercial_order(jsonb, jsonb, uuid, text) from public, anon;
revoke execute on function public.create_return_request(uuid, text, text) from public, anon;
revoke execute on function public.create_seller_product(uuid, text, text, numeric, numeric, numeric, integer, text, text, jsonb) from public, anon;
revoke execute on function public.delete_seller_product(uuid) from public, anon;
revoke execute on function public.get_my_seller_store() from public, anon;
revoke execute on function public.load_seller_returns() from public, anon;
revoke execute on function public.moderate_product(uuid, text, text) from public, anon;
revoke execute on function public.moderate_review(uuid, text, text) from public, anon;
revoke execute on function public.moderate_store(uuid, text) from public, anon;
revoke execute on function public.resolve_return(uuid, text, text, numeric) from public, anon;
revoke execute on function public.restock_seller_product(uuid, integer, text) from public, anon;
revoke execute on function public.update_order_delivery(uuid, text, text, text) from public, anon;
revoke execute on function public.update_seller_product(uuid, uuid, text, text, numeric, numeric, numeric, integer, text, text, jsonb) from public, anon;
revoke execute on function public.upsert_my_seller_store(text, text, text, text) from public, anon;

-- These helpers may be referenced from RLS policies by authenticated requests.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.validate_review_purchase() from public, anon;
