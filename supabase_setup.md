# Supabase Database Setup Instructions

Copy and paste the following SQL script into your Supabase project's SQL Editor and click **Run**.
This will set up all tables, relationships, and Row Level Security (RLS) policies needed for the MITS LMS.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Batches Table
create table public.batches (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Subjects Table
create table public.subjects (
    id uuid default uuid_generate_v4() primary key,
    batch_id uuid references public.batches(id) on delete cascade not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Units Table
create table public.units (
    id uuid default uuid_generate_v4() primary key,
    subject_id uuid references public.subjects(id) on delete cascade not null,
    title text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Materials Table
create table public.materials (
    id uuid default uuid_generate_v4() primary key,
    unit_id uuid references public.units(id) on delete cascade not null,
    title text not null,
    pdf_url text not null,
    type text check (type in ('material', 'mocktest')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Videos Table
create table public.videos (
    id uuid default uuid_generate_v4() primary key,
    unit_id uuid references public.units(id) on delete cascade not null,
    title text not null,
    video_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Students Table
create table public.students (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null,
    batch_id uuid references public.batches(id) on delete set null,
    approved boolean default false,
    role text default 'student' check (role in ('student', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: In a production scenario, you would insert the first Admin user manually:
-- update public.students set role = 'admin', approved = true, batch_id = null where email = 'your-admin@email.com';

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.batches enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.materials enable row level security;
alter table public.videos enable row level security;
alter table public.students enable row level security;

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.students
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Function to get student's batch_id
create or replace function public.get_student_batch_id()
returns uuid
language sql
security definer
as $$
  select batch_id
  from public.students
  where id = auth.uid() and approved = true;
$$;

-- Students (Profile) Table Policies
-- Admin can do everything
-- Students can read their own row
create policy "Admin root access to students" on public.students for all using (is_admin());
create policy "Students can view own profile" on public.students for select using (auth.uid() = id);
-- Allow signup trigger to insert new student or allow authenticated users to insert their profile on signup
create policy "Enable insert for authenticated users only" on public.students for insert with check (auth.uid() = id);

-- Batches Policies
-- Admin can do everything
-- Approved students can view their assigned batch
create policy "Admin root access to batches" on public.batches for all using (is_admin());
create policy "Approved students can view assigned batch" on public.batches for select using (id = get_student_batch_id());

-- Subjects Policies
create policy "Admin root access to subjects" on public.subjects for all using (is_admin());
create policy "Approved students can view their batch subjects" on public.subjects for select using (
  batch_id = get_student_batch_id()
);

-- Units Policies
create policy "Admin root access to units" on public.units for all using (is_admin());
create policy "Approved students can view their batch units" on public.units for select using (
  subject_id in (select id from public.subjects where batch_id = get_student_batch_id())
);

-- Materials Policies
create policy "Admin root access to materials" on public.materials for all using (is_admin());
create policy "Approved students can view their batch materials" on public.materials for select using (
  unit_id in (
    select id from public.units where subject_id in (
      select id from public.subjects where batch_id = get_student_batch_id()
    )
  )
);

-- Videos Policies
create policy "Admin root access to videos" on public.videos for all using (is_admin());
create policy "Approved students can view their batch videos" on public.videos for select using (
  unit_id in (
    select id from public.units where subject_id in (
      select id from public.subjects where batch_id = get_student_batch_id()
    )
  )
);
```

## Storage Setup (mits-materials)
1. Go to **Storage** in Supabase.
2. Create a new bucket named `mits-materials`.
3. Set the bucket to **Public** if you want direct access via URL, or setup RLS policies for storage objects if keeping private.
4. If using public access but restricting access inside the app, be aware that anyone with the direct PDF link can access it. For a truly secure LMS, make the bucket private and use Signed URLs when generating `pdf_url` (or in our case, just store the storage object path in DB and let the client request signed URLs using supabase client).

> **For Simplicity in this app version:** Make the `mits-materials` bucket Public. We will store the full public URL in the DB. Only authorized students can retrieve the URL from the DB because of the Database RLS.
