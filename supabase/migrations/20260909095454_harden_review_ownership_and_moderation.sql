create or replace function public.protect_review_fields()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if tg_op='UPDATE' and auth.uid() is not null and not public.is_admin() then
    if new.user_id is distinct from old.user_id then raise exception 'review owner is immutable'; end if;
    if new.product_id is distinct from old.product_id then raise exception 'review product is immutable'; end if;
    if new.order_id is distinct from old.order_id then raise exception 'review order is immutable'; end if;
    if new.is_approved is distinct from old.is_approved then raise exception 'review moderation is server-admin only'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_review_fields on public.reviews;
create trigger trg_protect_review_fields
before update on public.reviews
for each row execute function public.protect_review_fields();

revoke all on function public.protect_review_fields() from public, anon, authenticated;
grant execute on function public.protect_review_fields() to service_role;
