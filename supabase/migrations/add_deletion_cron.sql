-- Enable the pg_cron extension
create extension if not exists pg_cron;

-- Schedule a job to run every minute
-- This job deletes listings where the deletion_scheduled_at timestamp is in the past
select cron.schedule(
  'delete-expired-listings', -- unique name of the job
  '* * * * *',              -- cron schedule (every minute)
  $$
    delete from public.asset_listings 
    where deletion_scheduled_at is not null 
    and deletion_scheduled_at < now();
  $$
);
