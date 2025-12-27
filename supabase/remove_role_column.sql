-- Remove the role column from the users table
alter table users drop column if exists role;
