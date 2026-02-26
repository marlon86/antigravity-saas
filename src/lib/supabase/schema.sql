-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: users (extends the default auth.users but managed via triggers or directly linked)
create table public.users (
    id uuid references auth.users not null primary key,
    email text,
    name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.users enable row level security;

-- Table: banks
create table public.banks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    bank_name text not null,
    account_type text,
    balance numeric default 0,
    last_sync timestamp with time zone default timezone('utc'::text, now())
);
alter table public.banks enable row level security;

-- Table: categories
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text not null -- e.g., 'income', 'expense'
);
alter table public.categories enable row level security;

-- Table: transactions
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    bank_id uuid references public.banks(id) on delete cascade,
    date date not null,
    description text not null,
    amount numeric not null,
    type text not null, -- 'income' or 'expense'
    category_id uuid references public.categories(id),
    category_name text, -- For fallback if custom
    is_tax_deductible boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;

-- Table: imports
create table public.imports (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    file_url text not null,
    imported_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.imports enable row level security;

-- Table: reports
create table public.reports (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade not null,
    year integer not null,
    file_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reports enable row level security;

-- RLS Policies
create policy "Users can view their own data." on public.users for select using (auth.uid() = id);
create policy "Users can update their own data." on public.users for update using (auth.uid() = id);

create policy "Users can view own banks" on public.banks for select using (auth.uid() = user_id);
create policy "Users can insert own banks" on public.banks for insert with check (auth.uid() = user_id);
create policy "Users can update own banks" on public.banks for update using (auth.uid() = user_id);
create policy "Users can delete own banks" on public.banks for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

create policy "Categories are readable by everyone" on public.categories for select using (true);

create policy "Users can view own imports" on public.imports for select using (auth.uid() = user_id);
create policy "Users can insert own imports" on public.imports for insert with check (auth.uid() = user_id);

create policy "Users can view own reports" on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports" on public.reports for insert with check (auth.uid() = user_id);

-- Storage Buckets
insert into storage.buckets (id, name) values ('documents', 'documents');
insert into storage.buckets (id, name) values ('receipts', 'receipts');
insert into storage.buckets (id, name) values ('reports', 'reports');
insert into storage.buckets (id, name) values ('imports', 'imports');

-- Storage Policies
create policy "Users can view own files in documents" on storage.objects for select using (bucket_id = 'documents' and auth.uid()::text = owner::text);
-- (Add similarly for reports, imports, receipts as needed)
