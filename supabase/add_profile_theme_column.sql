alter table public.users add column if not exists profile_theme jsonb default '{"backgroundColor": "default"}'::jsonb;
