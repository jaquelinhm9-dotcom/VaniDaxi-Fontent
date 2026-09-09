-- Keep review moderation callable only by authenticated admins/service_role.
-- The function body already enforces admin authorization; this removes anonymous EXECUTE.
revoke execute on function public.moderate_review(uuid, text, text) from anon, public;
grant execute on function public.moderate_review(uuid, text, text) to authenticated, service_role;
