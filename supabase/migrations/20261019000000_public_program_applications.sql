-- Allow people to apply for a specific published program without creating an account.
alter table public.volunteer_applications alter column volunteer_id drop not null;
alter table public.volunteer_applications
  add column if not exists partner_recommendation text check (partner_recommendation in ('accepted', 'waitlisted', 'rejected')),
  add column if not exists partner_review_notes text,
  add column if not exists partner_reviewed_by text,
  add column if not exists partner_reviewed_at timestamptz;

alter table public.partner_documents
  add column if not exists storage_path text unique,
  add column if not exists content_type text,
  add column if not exists size_bytes bigint;

alter table public.follow_up_logs alter column created_by drop not null;
alter table public.follow_up_logs drop constraint if exists follow_up_logs_recipient_type_check;
alter table public.follow_up_logs add constraint follow_up_logs_recipient_type_check
  check (recipient_type in ('partner_application', 'volunteer_registration', 'program_application'));

create or replace function public.submit_public_program_application(
  p_program_id text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_province text,
  p_city text,
  p_motivation text,
  p_answers jsonb
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
  select * into v_program
  from public.programs p
  where p.id = p_program_id
    and p.proposal_status = 'approved'
    and p.published_status = 'published'
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'program_unavailable';
  end if;
  if v_program.deadline < current_date then
    raise exception using errcode = 'P0001', message = 'application_deadline_passed';
  end if;
  if v_program.target_quota > 0 and v_program.enrolled_count >= v_program.target_quota then
    raise exception using errcode = 'P0001', message = 'program_quota_full';
  end if;
  if exists (
    select 1 from public.volunteer_applications a
    where a.program_id = p_program_id
      and lower(a.volunteer_email) = lower(trim(p_email))
      and a.status <> 'withdrawn'
  ) then
    raise exception using errcode = 'P0001', message = 'duplicate_program_application';
  end if;

  insert into public.volunteer_applications (
    id, program_id, program_title, partner_name, volunteer_id,
    volunteer_name, volunteer_email, volunteer_phone, volunteer_city,
    volunteer_province, motivation, answers, status, submitted_at, history
  ) values (
    v_application_id, v_program.id, v_program.title, v_program.partner_name, null,
    trim(p_full_name), lower(trim(p_email)), trim(p_phone), trim(p_city),
    nullif(trim(p_province), ''), trim(p_motivation), coalesce(p_answers, '{}'::jsonb), 'submitted', now(),
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

-- Keep partner resubmission status, application status and audit event in one transaction.
create or replace function public.resubmit_partner_application(p_partner_id text, p_user_id text)
returns void
language plpgsql
security definer
set search_path = ''
set row_security = off
as $$
declare
  v_org public.partner_organizations%rowtype;
  v_application_id text;
begin
  select * into v_org
  from public.partner_organizations
  where id = p_partner_id and user_id = p_user_id
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'partner_not_found';
  end if;
  if v_org.status <> 'revision_required' then
    raise exception using errcode = 'P0001', message = 'revision_not_requested';
  end if;

  select id into v_application_id
  from public.partnership_applications
  where partner_id = p_partner_id
  order by created_at desc
  limit 1
  for update;
  if v_application_id is null then
    raise exception using errcode = 'P0001', message = 'application_not_found';
  end if;

  update public.partner_organizations
  set status = 'submitted', review_notes = null,
      history = coalesce(history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'status', 'submitted', 'date', now(), 'actor', v_org.pic_name,
        'note', 'Mitra mengirim perbaikan profil.'
      ))
  where id = p_partner_id;
  update public.partnership_applications
  set status = 'submitted', review_notes = null, updated_at = now()
  where id = v_application_id;
  insert into public.audit_logs (id, actor_name, actor_role, action, entity_type, entity_id, details)
  values (gen_random_uuid()::text, v_org.pic_name, 'partner', 'PARTNER_PROFILE_RESUBMITTED',
    'partnership', p_partner_id, 'Mitra mengirim perbaikan profil untuk ditinjau admin.');
end;
$$;

revoke all on function public.resubmit_partner_application(text,text) from public, anon, authenticated;
grant execute on function public.resubmit_partner_application(text,text) to service_role;
