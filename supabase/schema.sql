-- Drop existing tables and functions to start fresh
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.reports cascade;
drop table if exists public.imports cascade;
drop table if exists public.categories cascade;
drop table if exists public.transactions cascade;
drop table if exists public.banks cascade;
drop table if exists public.users cascade;

-- Create users table (Extends Supabase auth.users)
CREATE TABLE public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable RLS
alter table public.users enable row level security;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- Create banks table
CREATE TABLE public.banks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_name text not null,
  account_type text,
  balance numeric default 0,
  last_sync timestamp with time zone default timezone('utc'::text, now())
);
alter table public.banks enable row level security;
create policy "Users can manage own banks" on public.banks for all using (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bank_id uuid references public.banks(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  is_tax_deductible boolean default false
);
alter table public.transactions enable row level security;
create policy "Users can manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('income', 'expense'))
);
-- Global categories can be read by anyone authenticated
alter table public.categories enable row level security;
create policy "Anyone authenticated can view categories" on public.categories for select using (auth.role() = 'authenticated');

-- Create imports table
CREATE TABLE public.imports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  file_url text not null,
  imported_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.imports enable row level security;
create policy "Users can manage own imports" on public.imports for all using (auth.uid() = user_id);

-- Create reports table
CREATE TABLE public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  year integer not null,
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reports enable row level security;
create policy "Users can manage own reports" on public.reports for all using (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
