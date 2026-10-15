-- 001_initial_schema.sql
-- Inisialisasi Skema Database PSA Partnership Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS & PROFILES
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('public', 'volunteer', 'partner', 'admin')),
  avatar text,
  verified boolean default false,
  org_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. VOLUNTEER PROFILES
create table if not exists public.volunteer_profiles (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  full_name text not null,
  birth_date date,
  gender text check (gender in ('male', 'female', 'prefer_not_to_say')),
  province text not null,
  city text not null,
  interests text[] default '{}',
  education text,
  skills text[] default '{}',
  experience text,
  availability text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PARTNER ORGANIZATIONS
create table if not exists public.partner_organizations (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('corporate', 'foundation', 'community', 'university', 'school')),
  sector text not null,
  description text default '',
  website text,
  address text default '',
  province text not null,
  city text not null,
  pic_name text not null,
  pic_role text not null,
  pic_phone text not null,
  pic_email text not null,
  collaboration_reason text default '',
  collaboration_focus text[] default '{}',
  collaboration_objective text default '',
  target_impact text default '',
  offered_contribution text default '',
  collaboration_period text default '6 Bulan',
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'revision_required', 'approved', 'rejected', 'withdrawn')),
  review_notes text,
  history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Foreign key dari users.org_id ke partner_organizations.id
alter table public.users
  drop constraint if exists users_org_id_fkey,
  add constraint users_org_id_fkey foreign key (org_id) references public.partner_organizations(id) on delete set null;

-- 4. PARTNER DOCUMENTS
create table if not exists public.partner_documents (
  id text primary key,
  organization_id text not null references public.partner_organizations(id) on delete cascade,
  name text not null,
  type text not null,
  size text not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verification_status text check (verification_status in ('pending', 'verified', 'revision_required')) default 'pending'
);

-- 5. PROGRAMS
create table if not exists public.programs (
  id text primary key,
  partner_id text not null references public.partner_organizations(id) on delete cascade,
  partner_name text not null,
  title text not null,
  category text not null check (category in ('Pendidikan', 'Lingkungan', 'Kesehatan', 'Pemberdayaan Masyarakat', 'Teknologi & Digital')),
  summary text not null,
  description text not null,
  objectives text[] default '{}',
  format text not null check (format in ('offline', 'online', 'hybrid')),
  province text,
  city text,
  address text,
  start_date date not null,
  end_date date not null,
  schedule text not null,
  target_quota integer not null default 0,
  enrolled_count integer not null default 0,
  requirements text[] default '{}',
  accessibility_info text,
  deadline date not null,
  pic_name text not null,
  pic_contact text not null,
  proposal_status text not null default 'draft' check (proposal_status in ('draft', 'submitted', 'under_review', 'revision_required', 'approved', 'rejected')),
  published_status text not null default 'draft' check (published_status in ('draft', 'published', 'closed', 'archived')),
  image text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  review_notes text
);

-- 6. VOLUNTEER APPLICATIONS
create table if not exists public.volunteer_applications (
  id text primary key,
  program_id text not null references public.programs(id) on delete cascade,
  program_title text not null,
  partner_name text not null,
  volunteer_id text not null references public.users(id) on delete cascade,
  volunteer_name text not null,
  volunteer_email text not null,
  volunteer_phone text not null,
  volunteer_gender text check (volunteer_gender in ('male', 'female', 'prefer_not_to_say')),
  volunteer_city text not null,
  volunteer_province text,
  motivation text not null,
  answers jsonb default '{}'::jsonb,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'accepted', 'waitlisted', 'rejected', 'withdrawn')),
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  review_notes text,
  history jsonb default '[]'::jsonb
);

-- 7. AUDIT LOGS
create table if not exists public.audit_logs (
  id text primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  actor_name text not null,
  actor_role text not null check (actor_role in ('public', 'volunteer', 'partner', 'admin')),
  action text not null,
  entity_type text not null check (entity_type in ('partnership', 'proposal', 'application', 'program', 'user')),
  entity_id text not null,
  details text not null
);

-- 8. NOTIFICATIONS
create table if not exists public.notifications (
  id text primary key,
  recipient_user_id text not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  read boolean default false,
  link_type text check (link_type in ('application', 'partnership', 'proposal'))
);

-- 9. PERFORMANCE INDEXES
create index if not exists idx_volunteer_profiles_user_id on public.volunteer_profiles(user_id);
create index if not exists idx_partner_organizations_user_id on public.partner_organizations(user_id);
create index if not exists idx_partner_organizations_status on public.partner_organizations(status);
create index if not exists idx_partner_documents_org_id on public.partner_documents(organization_id);
create index if not exists idx_programs_partner_id on public.programs(partner_id);
create index if not exists idx_programs_published_status on public.programs(published_status);
create index if not exists idx_programs_category on public.programs(category);
create index if not exists idx_volunteer_applications_program_id on public.volunteer_applications(program_id);
create index if not exists idx_volunteer_applications_volunteer_id on public.volunteer_applications(volunteer_id);
create index if not exists idx_notifications_recipient on public.notifications(recipient_user_id);
create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.users enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.partner_organizations enable row level security;
alter table public.partner_documents enable row level security;
alter table public.programs enable row level security;
alter table public.volunteer_applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Drop existing policies if any to avoid collision
drop policy if exists "Enable access for users" on public.users;
drop policy if exists "Enable access for volunteer profiles" on public.volunteer_profiles;
drop policy if exists "Enable access for partner organizations" on public.partner_organizations;
drop policy if exists "Enable access for partner documents" on public.partner_documents;
drop policy if exists "Enable access for programs" on public.programs;
drop policy if exists "Enable access for volunteer applications" on public.volunteer_applications;
drop policy if exists "Enable access for audit logs" on public.audit_logs;
drop policy if exists "Enable access for notifications" on public.notifications;
drop policy if exists "Public can view published programs" on public.programs;
drop policy if exists "Public can view approved partners" on public.partner_organizations;

-- Permissive policies for MVP application access
create policy "Enable access for users" on public.users for all using (true) with check (true);
create policy "Enable access for volunteer profiles" on public.volunteer_profiles for all using (true) with check (true);
create policy "Enable access for partner organizations" on public.partner_organizations for all using (true) with check (true);
create policy "Enable access for partner documents" on public.partner_documents for all using (true) with check (true);
create policy "Enable access for programs" on public.programs for all using (true) with check (true);
create policy "Enable access for volunteer applications" on public.volunteer_applications for all using (true) with check (true);
create policy "Enable access for audit logs" on public.audit_logs for all using (true) with check (true);
create policy "Enable access for notifications" on public.notifications for all using (true) with check (true);
