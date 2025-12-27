alter table public.users
add column if not exists flappy_high_score integer default 0;
