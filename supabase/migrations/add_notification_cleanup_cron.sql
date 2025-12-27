-- Enable the pg_cron extension if it's not already enabled
create extension if not exists pg_cron;

-- Schedule a job to run every day at midnight (00:00)
-- This job deletes notifications that are older than 7 days
select cron.schedule(
  'delete-old-notifications', -- unique name of the job
  '0 0 * * *',               -- cron schedule (every day at midnight)
  $$
    delete from public.notifications 
    where created_at < now() - interval '7 days';
  $$
);
