alter table public.programs
  add column if not exists execution_status text not null default 'planned'
    check (execution_status in ('planned', 'registration_open', 'registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion', 'completed', 'canceled')),
  add column if not exists public_announcement text;

create table if not exists public.program_status_history (
  id uuid primary key default gen_random_uuid(),
  program_id text not null references public.programs(id) on delete cascade,
  status text not null check (status in ('planned', 'registration_open', 'registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion', 'completed', 'canceled')),
  announcement text,
  is_public boolean not null default false,
  actor_id text not null,
  actor_role text not null check (actor_role in ('partner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.program_reports (
  id uuid primary key default gen_random_uuid(),
  program_id text not null references public.programs(id) on delete cascade,
  partner_id text not null references public.partner_organizations(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'revision_required')),
  review_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_programs_id_partner_unique on public.programs(id, partner_id);
alter table public.program_reports drop constraint if exists program_reports_program_id_fkey;
alter table public.program_reports drop constraint if exists program_reports_partner_id_fkey;
alter table public.program_reports add constraint program_reports_program_owner_fkey
  foreign key (program_id, partner_id) references public.programs(id, partner_id) on delete cascade;

create or replace function public.is_public_program(p_program_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
set row_security = off
as $$
  select exists (
    select 1 from public.programs p
    where p.id = p_program_id and p.proposal_status = 'approved'
      and p.published_status in ('published', 'closed')
  );
$$;
revoke all on function public.is_public_program(text) from public, anon, authenticated;
grant execute on function public.is_public_program(text) to anon, authenticated;

create index if not exists idx_program_status_history_public on public.program_status_history(program_id, is_public, created_at desc);
create index if not exists idx_program_reports_program on public.program_reports(program_id, created_at desc);
alter table public.program_status_history enable row level security;
alter table public.program_reports enable row level security;
grant select on public.program_status_history to anon, authenticated;
grant select on public.program_reports to authenticated;
revoke insert, update, delete on public.program_status_history, public.program_reports from anon, authenticated;

create policy "Read public program status history or relevant roles"
  on public.program_status_history for select to anon, authenticated
  using (
    (is_public and public.is_public_program(program_id))
    or public.current_user_is_psa_admin()
    or exists (select 1 from public.programs p join public.partner_organizations o on o.id = p.partner_id where p.id = program_id and o.user_id = auth.uid()::text)
  );

create policy "Read program reports by owner or PSA admin"
  on public.program_reports for select to authenticated
  using (
    public.current_user_is_psa_admin()
    or exists (select 1 from public.partner_organizations o where o.id = partner_id and o.user_id = auth.uid()::text)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('program-reports', 'program-reports', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']::text[])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

create policy "PSA admin reads program reports"
  on storage.objects for select to authenticated
  using (bucket_id = 'program-reports' and public.current_user_is_psa_admin());

create or replace view public.published_program_directory as
  select id, partner_id, partner_name, title, category, summary, description,
    objectives, format, province, city, address, start_date, end_date, schedule,
    target_quota, enrolled_count, requirements, accessibility_info, deadline,
    pic_name, pic_contact, proposal_status, published_status, image, created_at, execution_status,
    public_announcement
  from public.programs
  where proposal_status = 'approved' and published_status in ('published', 'closed');
grant select on public.published_program_directory to anon, authenticated;

create or replace function public.submit_public_program_application(
  p_program_id text, p_full_name text, p_email text, p_phone text,
  p_province text, p_city text, p_motivation text, p_answers jsonb
)
returns table(application_id text, program_title text, partner_name text)
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  v_program public.programs%rowtype;
  v_application_id text := gen_random_uuid()::text;
begin
  select * into v_program from public.programs p
  where p.id = p_program_id and p.proposal_status = 'approved'
    and p.published_status = 'published' and p.execution_status in ('planned', 'registration_open')
  for update;
  if not found then raise exception using errcode = 'P0001', message = 'program_unavailable'; end if;
  if v_program.deadline < current_date then raise exception using errcode = 'P0001', message = 'application_deadline_passed'; end if;
  if v_program.target_quota > 0 and v_program.enrolled_count >= v_program.target_quota then
    raise exception using errcode = 'P0001', message = 'program_quota_full';
  end if;
  if exists (select 1 from public.volunteer_applications a where a.program_id = p_program_id
    and lower(a.volunteer_email) = lower(trim(p_email)) and a.status <> 'withdrawn') then
    raise exception using errcode = 'P0001', message = 'duplicate_program_application';
  end if;
  insert into public.volunteer_applications (
    id, program_id, program_title, partner_name, volunteer_id, volunteer_name, volunteer_email,
    volunteer_phone, volunteer_city, volunteer_province, motivation, answers, status, submitted_at, history
  ) values (
    v_application_id, v_program.id, v_program.title, v_program.partner_name, null, trim(p_full_name),
    lower(trim(p_email)), trim(p_phone), trim(p_city), nullif(trim(p_province), ''), trim(p_motivation),
    coalesce(p_answers, '{}'::jsonb), 'submitted', now(),
    jsonb_build_array(jsonb_build_object('status','submitted','date',now(),'actor','Publik','note','Pendaftaran publik diterima'))
  );
  update public.programs set enrolled_count = enrolled_count + 1 where id = v_program.id;
  insert into public.audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, details)
  values (gen_random_uuid()::text, trim(p_full_name), 'public', 'APPLICATION_SUBMITTED', 'application', v_application_id,
    'Pendaftaran publik diterima untuk program ' || v_program.title || '.');
  return query select v_application_id, v_program.title, v_program.partner_name;
end;
$$;

revoke all on function public.submit_public_program_application(text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.submit_public_program_application(text,text,text,text,text,text,text,jsonb) to service_role;

create or replace function public.update_partner_program_execution(
  p_program_id text,
  p_partner_id text,
  p_user_id text,
  p_status text,
  p_announcement text
)
returns table(program_id text, execution_status text, public_announcement text)
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  v_program public.programs%rowtype;
  v_partner public.partner_organizations%rowtype;
  v_steps text[] := array['planned', 'registration_open', 'registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion'];
begin
  select p.* into v_program
  from public.programs p
  where p.id = p_program_id and p.partner_id = p_partner_id
    and p.proposal_status = 'approved' and p.published_status in ('published', 'closed')
  for update;
  if not found then raise exception using errcode = 'P0001', message = 'program_unavailable'; end if;
  select * into v_partner from public.partner_organizations o
  where o.id = p_partner_id and o.user_id = p_user_id and o.status = 'approved';
  if not found then raise exception using errcode = 'P0001', message = 'partner_not_authorized'; end if;
  if not (v_program.execution_status = any(v_steps)) then
    raise exception using errcode = 'P0001', message = 'program_is_final';
  end if;
  if not (p_status = any(v_steps))
    or array_position(v_steps, p_status) < array_position(v_steps, v_program.execution_status)
    or array_position(v_steps, p_status) > array_position(v_steps, v_program.execution_status) + 1 then
    raise exception using errcode = 'P0001', message = 'invalid_status_transition';
  end if;
  if p_status = v_program.execution_status
    and nullif(trim(p_announcement), '') is not distinct from v_program.public_announcement then
    return query select v_program.id, v_program.execution_status, v_program.public_announcement;
    return;
  end if;
  update public.programs set execution_status = p_status,
    public_announcement = nullif(trim(p_announcement), '')
  where id = p_program_id;
  insert into public.program_status_history (program_id, status, announcement, is_public, actor_id, actor_role)
  values (p_program_id, p_status, nullif(trim(p_announcement), ''), true, p_user_id, 'partner');
  insert into public.audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, details)
  values (gen_random_uuid()::text, v_partner.pic_name, 'partner', 'PROGRAM_EXECUTION_STATUS_UPDATED', 'program', p_program_id,
    'Status pelaksanaan diubah menjadi ' || p_status || '.');
  return query select p.id, p.execution_status, p.public_announcement from public.programs p where p.id = p_program_id;
end;
$$;

revoke all on function public.update_partner_program_execution(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.update_partner_program_execution(text,text,text,text,text) to service_role;

create or replace function public.register_program_report(
  p_program_id text, p_partner_id text, p_user_id text, p_file_name text,
  p_storage_path text, p_content_type text, p_size_bytes bigint, p_notes text
)
returns public.program_reports
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  v_program public.programs%rowtype;
  v_partner public.partner_organizations%rowtype;
  v_report public.program_reports%rowtype;
begin
  select * into v_program from public.programs p
  where p.id = p_program_id and p.partner_id = p_partner_id
  for update;
  if not found then raise exception using errcode = 'P0001', message = 'program_not_found'; end if;
  select * into v_partner from public.partner_organizations o
  where o.id = p_partner_id and o.user_id = p_user_id and o.status = 'approved';
  if not found then raise exception using errcode = 'P0001', message = 'partner_not_authorized'; end if;
  if v_program.proposal_status <> 'approved' or v_program.published_status not in ('published', 'closed')
    or v_program.execution_status not in ('ongoing', 'pending_completion') then
    raise exception using errcode = 'P0001', message = 'report_stage_closed';
  end if;
  insert into public.program_reports (program_id, partner_id, file_name, storage_path, content_type, size_bytes, notes)
  values (p_program_id, p_partner_id, left(p_file_name, 255), p_storage_path, p_content_type, p_size_bytes, nullif(trim(p_notes), ''))
  returning * into v_report;
  insert into public.audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, details)
  values (gen_random_uuid()::text, v_partner.pic_name, 'partner', 'PROGRAM_REPORT_SUBMITTED', 'program', p_program_id,
    'Mitra mengirim laporan ' || left(p_file_name, 255) || '.');
  return v_report;
end;
$$;

revoke all on function public.register_program_report(text,text,text,text,text,text,bigint,text) from public, anon, authenticated;
grant execute on function public.register_program_report(text,text,text,text,text,text,bigint,text) to service_role;

create or replace function public.finalize_program_execution(
  p_program_id text, p_status text, p_notes text, p_user_id text, p_actor_name text
)
returns public.programs
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  v_program public.programs%rowtype;
  v_updated public.programs%rowtype;
begin
  select * into v_program from public.programs p where p.id = p_program_id for update;
  if not found or v_program.proposal_status <> 'approved' or v_program.published_status not in ('published', 'closed') then
    raise exception using errcode = 'P0001', message = 'program_unavailable';
  end if;
  if p_status not in ('completed', 'canceled') then
    raise exception using errcode = 'P0001', message = 'invalid_final_status';
  end if;
  if p_status = 'completed' then
    if v_program.execution_status <> 'pending_completion'
      or not exists (select 1 from public.program_reports r where r.program_id = p_program_id and r.status = 'approved')
      or exists (select 1 from public.program_reports r where r.program_id = p_program_id and r.status in ('submitted', 'revision_required')) then
      raise exception using errcode = 'P0001', message = 'reports_not_complete';
    end if;
  elsif length(trim(coalesce(p_notes, ''))) = 0 then
    raise exception using errcode = 'P0001', message = 'cancellation_note_required';
  end if;
  update public.programs set execution_status = p_status,
    public_announcement = nullif(trim(p_notes), '')
  where id = p_program_id returning * into v_updated;
  insert into public.program_status_history (program_id, status, announcement, is_public, actor_id, actor_role)
  values (p_program_id, p_status, nullif(trim(p_notes), ''), true, p_user_id, 'admin');
  insert into public.audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, details)
  values (gen_random_uuid()::text, p_actor_name, 'admin', 'PROGRAM_' || upper(p_status), 'program', p_program_id,
    'Status pelaksanaan dikonfirmasi menjadi ' || p_status || '. Catatan: ' || coalesce(nullif(trim(p_notes), ''), '-'));
  return v_updated;
end;
$$;

revoke all on function public.finalize_program_execution(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.finalize_program_execution(text,text,text,text,text) to service_role;

