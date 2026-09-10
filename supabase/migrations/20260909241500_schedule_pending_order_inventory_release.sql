create extension if not exists pg_cron;

select cron.unschedule(jobid)
from cron.job
where jobname='vanidaxi-release-expired-pending-orders';

select cron.schedule(
  'vanidaxi-release-expired-pending-orders',
  '*/10 * * * *',
  $$select public.release_expired_pending_orders(interval '30 minutes');$$
);