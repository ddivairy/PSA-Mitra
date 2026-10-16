create table if not exists public.partnership_applications (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  organization_type text not null check (organization_type in ('corporate', 'foundation', 'community', 'university', 'school')),
  sector text not null,
  description text not null default '',
  website text,
  province text not null,
  city text not null,
  address text not null default '',
  pic_name text not null,
  pic_role text not null,
  pic_email text not null,
  pic_phone text not null,
  registration_date date not null default current_date,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'revision_required', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  partner_id text references public.partner_organizations(id) on delete set null,
  auth_user_id uuid,
  account_status text not null default 'not_created' check (account_status in ('not_created', 'creating', 'created', 'failed')),
  account_error text,
  is_offline boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partnership_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partnership_applications(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);

create table if not exists public.volunteer_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  province text not null,
  city text not null,
  motivation text not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'selected', 'rejected', 'revision_required')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Preserve legacy pending partner submissions in the new review queue.
insert into public.partnership_applications (
  partner_id, organization_name, organization_type, sector, description, website,
  province, city, address, pic_name, pic_role, pic_email, pic_phone, status,
  review_notes, created_at
)
select p.id, p.name, p.type, p.sector, coalesce(p.description, ''), p.website,
  p.province, p.city, coalesce(p.address, ''), p.pic_name, p.pic_role,
  p.pic_email, p.pic_phone, case when p.status = 'draft' then 'submitted' else p.status end, p.review_notes, p.created_at
from (
  select distinct on (lower(pic_email)) *
  from public.partner_organizations
  where status in ('draft', 'submitted', 'under_review', 'revision_required')
  order by lower(pic_email), created_at asc
) p
where not exists (
  select 1 from public.partnership_applications a where lower(a.pic_email) = lower(p.pic_email)
);

create table if not exists public.follow_up_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null check (recipient_type in ('partner_application', 'volunteer_registration')),
  recipient_id text not null,
  recipient_name text not null,
  recipient_email text not null,
  recipient_phone text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  category text not null check (category in ('status', 'revision', 'approval', 'program_reminder', 'selection')),
  subject text,
  body text not null,
  status text not null check (status in ('sending', 'sent', 'failed', 'prepared', 'opened')),
  error_message text,
  provider_message_id text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_partnership_applications_status on public.partnership_applications(status, created_at desc);
create index if not exists idx_partnership_applications_email on public.partnership_applications(lower(pic_email));
create unique index if not exists idx_partnership_applications_active_email on public.partnership_applications(lower(pic_email)) where status in ('submitted','under_review','revision_required','approved');
create unique index if not exists idx_volunteer_registrations_active_email on public.volunteer_registrations(lower(email)) where status in ('submitted','under_review','selected');
create index if not exists idx_volunteer_registrations_status on public.volunteer_registrations(status, created_at desc);
create index if not exists idx_follow_up_logs_recipient on public.follow_up_logs(recipient_type, recipient_id, created_at desc);

alter table public.partnership_applications enable row level security;
alter table public.partnership_application_documents enable row level security;
alter table public.volunteer_registrations enable row level security;
alter table public.follow_up_logs enable row level security;

-- Browser clients have no direct access. Public intake and admin actions use
-- server routes; server routes validate inputs and admin role before using service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partner-documents', 'partner-documents', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png']::text[])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "PSA admin read partner documents" on storage.objects;
create policy "PSA admin read partner documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'partner-documents' and public.current_user_is_psa_admin());

-- Replace the permissive demo policies created by the initial schema. The
-- client application uses Supabase Auth for identity; sensitive mutations run
-- through admin-validated server routes using the service role.
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

grant execute on function public.current_user_is_psa_admin() to anon, authenticated;

create policy "Read own profile or PSA admin"
  on public.users for select to authenticated
  using (id = auth.uid()::text or public.current_user_is_psa_admin());

create policy "Read own organization or PSA admin"
  on public.partner_organizations for select to authenticated
  using (user_id = auth.uid()::text or public.current_user_is_psa_admin());

create policy "PSA admin manages partner organizations"
  on public.partner_organizations for all to authenticated
  using (public.current_user_is_psa_admin())
  with check (public.current_user_is_psa_admin());

create policy "Read published programs or own partner programs or PSA admin"
  on public.programs for select to authenticated
  using (
    exists (
      select 1 from public.partner_organizations o
      where o.id = programs.partner_id and o.user_id = auth.uid()::text
    )
    or public.current_user_is_psa_admin()
  );

create policy "PSA admin manages programs"
  on public.programs for all to authenticated
  using (public.current_user_is_psa_admin())
  with check (public.current_user_is_psa_admin());

create policy "Read own volunteer profile or PSA admin"
  on public.volunteer_profiles for select to authenticated
  using (user_id = auth.uid()::text or public.current_user_is_psa_admin());

create policy "Update own volunteer profile"
  on public.volunteer_profiles for update to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

create policy "PSA admin manages volunteer profiles"
  on public.volunteer_profiles for all to authenticated
  using (public.current_user_is_psa_admin())
  with check (public.current_user_is_psa_admin());

create policy "Read relevant volunteer applications"
  on public.volunteer_applications for select to authenticated
  using (
    volunteer_id = auth.uid()::text
    or public.current_user_is_psa_admin()
    or exists (
      select 1 from public.programs p
      join public.partner_organizations o on o.id = p.partner_id
      where p.id = volunteer_applications.program_id and o.user_id = auth.uid()::text
    )
  );

create policy "Volunteers submit own applications"
  on public.volunteer_applications for insert to authenticated
  with check (volunteer_id = auth.uid()::text and status = 'submitted');

create policy "PSA admin manages volunteer applications"
  on public.volunteer_applications for all to authenticated
  using (public.current_user_is_psa_admin())
  with check (public.current_user_is_psa_admin());

create policy "Read own notifications or PSA admin"
  on public.notifications for select to authenticated
  using (recipient_user_id = auth.uid()::text or public.current_user_is_psa_admin());

create policy "Update own notification read state"
  on public.notifications for update to authenticated
  using (recipient_user_id = auth.uid()::text)
  with check (recipient_user_id = auth.uid()::text);

create policy "PSA admin reads audit logs"
  on public.audit_logs for select to authenticated
  using (public.current_user_is_psa_admin());

-- Public directory views intentionally omit PIC email/phone and program PIC contacts.
create or replace view public.approved_partner_directory as
  select id, name, type, sector, description, website, province, city
  from public.partner_organizations
  where status = 'approved';
grant select on public.approved_partner_directory to anon, authenticated;

create or replace view public.published_program_directory as
  select id, partner_id, partner_name, title, category, summary, description,
    objectives, format, province, city, address, start_date, end_date, schedule,
    target_quota, enrolled_count, requirements, accessibility_info, deadline,
    proposal_status, published_status, image, created_at
  from public.programs
  where proposal_status = 'approved' and published_status = 'published';
grant select on public.published_program_directory to anon, authenticated;
