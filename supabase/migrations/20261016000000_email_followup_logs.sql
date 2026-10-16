create table if not exists public.email_followup_logs (
  id uuid primary key default gen_random_uuid(),
  partner_id text references public.partner_organizations(id) on delete set null,
  recipient_email text not null,
  recipient_name text not null default '',
  category text not null check (category in ('status', 'revision', 'approval', 'program_reminder')),
  subject text not null,
  body text not null,
  status text not null check (status in ('sending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_email_followup_logs_created_at
  on public.email_followup_logs (created_at desc);
create index if not exists idx_email_followup_logs_partner_id
  on public.email_followup_logs (partner_id);

alter table public.email_followup_logs enable row level security;
-- Access is performed only by the server using the Supabase service role after
-- validating the caller's Supabase session and public.users role.

-- The initial schema grants public write access to users. Remove it so a
-- self-registered account cannot assign itself the admin role.
drop policy if exists "Enable access for users" on public.users;

create or replace function public.current_user_is_psa_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
set row_security = off
as $$
  select exists (
    select 1 from public.users u
    where lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and u.role = 'admin'
      and auth.jwt() -> 'app_metadata' ->> 'psa_role' = 'admin'
  );
$$;

revoke all on function public.current_user_is_psa_admin() from public;
grant execute on function public.current_user_is_psa_admin() to authenticated;

create policy "Read own PSA profile or admin"
  on public.users for select to authenticated
  using (
    id = auth.uid()::text
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.current_user_is_psa_admin()
  );
