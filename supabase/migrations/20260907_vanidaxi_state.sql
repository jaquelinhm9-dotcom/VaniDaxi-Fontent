-- VaniDaxi guest-state persistence.
-- This table stores only app state needed to synchronize the existing UI.
-- Do not store card numbers, CVV, passwords, or other payment credentials here.
create table if not exists public.vanidaxi_state (
  device_id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists vanidaxi_state_updated_at_idx
  on public.vanidaxi_state (updated_at desc);

alter table public.vanidaxi_state enable row level security;

-- The Edge Function is the only public API surface for this table.
-- Direct anonymous table access is intentionally not granted.
revoke all on table public.vanidaxi_state from anon, authenticated;

comment on table public.vanidaxi_state is
  'VaniDaxi guest synchronization state; never store payment credentials.';
