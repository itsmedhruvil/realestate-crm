# Supabase Setup Guide

Follow these steps to set up your Supabase database schema to work with Prisma.

## 1. Database Schema
Paste this SQL into your Supabase **SQL Editor** to create the tables. Note that table names are case-sensitive to match Prisma models.

```sql
-- 1. Create Lead Table
create table "Lead" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  name text not null,
  email text,
  phone text,
  budget text,
  interest text,
  stage text default 'New',
  score integer default 50,
  agent text,
  source text,
  notes text
);

-- 2. Create Property Table
create table "Property" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  name text not null,
  location text,
  price text,
  type text,
  status text default 'available',
  beds integer,
  baths integer,
  sqft integer,
  agent text,
  description text,
  images text[]
);

-- 3. Create TeamMember Table
create table "TeamMember" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  name text not null,
  email text,
  phone text,
  role text,
  leads integer default 0,
  closed integer default 0,
  revenue text
);

-- 4. Create SiteVisit Table
create table "SiteVisit" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  client text,
  property text,
  agent text,
  date timestamp with time zone,
  time text,
  status text default 'pending',
  notes text
);

-- 5. Create Payment Table
create table "Payment" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  client text,
  property text,
  amount double precision,
  type text,
  "dueDate" timestamp with time zone,
  status text default 'scheduled',
  "reminderSent" boolean default false
);

-- 6. Create Activity Table
create table "Activity" (
  id uuid default gen_random_uuid() primary key,
  "createdAt" timestamp with time zone default now() not null,
  type text,
  text text,
  agent text,
  "relatedLeadId" uuid references "Lead"(id) on delete set null,
  "relatedPropertyId" uuid references "Property"(id) on delete set null
);

-- Enable Row Level Security & Create Access Policy
alter table "Lead" enable row level security;
alter table "Property" enable row level security;
alter table "TeamMember" enable row level security;
alter table "SiteVisit" enable row level security;
alter table "Payment" enable row level security;
alter table "Activity" enable row level security;

create policy "Allow public access" on "Lead" for all using (true);
create policy "Allow public access" on "Property" for all using (true);
create policy "Allow public access" on "TeamMember" for all using (true);
create policy "Allow public access" on "SiteVisit" for all using (true);
create policy "Allow public access" on "Payment" for all using (true);
create policy "Allow public access" on "Activity" for all using (true);
```

## 2. Sync Prisma
After creating tables in Supabase, run these commands:

```bash
npx prisma generate
npx prisma db pull
```

## 2. Install Dependency
Run the following command in your terminal:

```bash
npm install @supabase/supabase-js
```

## 3. Environment Variables
Add these to your `.env.local`:
`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url`
`NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`