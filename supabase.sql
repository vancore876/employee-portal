create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'employee');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.target_type as enum ('file', 'folder', 'link');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.app_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_folder_id uuid references public.folders(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete cascade,
  title text not null,
  url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.delete_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.target_type not null,
  target_id uuid not null,
  reason text not null,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.files enable row level security;
alter table public.links enable row level security;
alter table public.delete_requests enable row level security;

create policy "profiles read own" on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy "folders readable by authenticated users" on public.folders
for select to authenticated
using (true);

create policy "files readable by authenticated users" on public.files
for select to authenticated
using (true);

create policy "links readable by authenticated users" on public.links
for select to authenticated
using (true);

create policy "employees can create delete requests" on public.delete_requests
for insert to authenticated
with check (requester_id = auth.uid());

create policy "employees read own requests" on public.delete_requests
for select to authenticated
using (requester_id = auth.uid());