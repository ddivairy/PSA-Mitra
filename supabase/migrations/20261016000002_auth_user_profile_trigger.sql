-- Keep public.users in sync with Supabase Auth users.
-- New accounts default to the public role. Privileged roles are read only from
-- raw_app_meta_data, which clients cannot modify; an administrator must set
-- psa_role='admin' through Supabase's trusted dashboard/SQL editor.
create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_phone text;
  v_role text;
  v_profile_id text;
begin
  -- PSA accounts authenticate by email; ignore phone-only Auth identities.
  if new.email is null then
    return new;
  end if;

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Pengguna PSA'
  );
  v_phone := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');
  v_role := case
    when new.raw_app_meta_data ->> 'psa_role' in ('public', 'volunteer', 'partner', 'admin')
      then new.raw_app_meta_data ->> 'psa_role'
    else null
  end;

  -- Match by Auth UUID first; matching email also adopts existing baseline rows
  -- without breaking their foreign-key relationships.
  select u.id into v_profile_id
  from public.users as u
  where u.id = new.id::text
     or lower(u.email) = lower(new.email)
  order by (u.id = new.id::text) desc
  limit 1;

  if v_profile_id is null then
    insert into public.users (id, name, email, phone, role, verified)
    values (
      new.id::text,
      v_name,
      lower(new.email),
      v_phone,
      coalesce(v_role, 'public'),
      new.email_confirmed_at is not null
    );
  else
    update public.users as u
    set id = new.id::text,
        name = v_name,
        email = lower(new.email),
        phone = coalesce(v_phone, u.phone),
        role = coalesce(v_role, u.role),
        verified = new.email_confirmed_at is not null
    where u.id = v_profile_id;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_auth_user_profile() from public, anon, authenticated;

-- Auth UUID adoption must preserve references to the existing profile row.
alter table public.volunteer_profiles drop constraint if exists volunteer_profiles_user_id_fkey;
alter table public.volunteer_profiles add constraint volunteer_profiles_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade on update cascade;
alter table public.partner_organizations drop constraint if exists partner_organizations_user_id_fkey;
alter table public.partner_organizations add constraint partner_organizations_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade on update cascade;
alter table public.volunteer_applications drop constraint if exists volunteer_applications_volunteer_id_fkey;
alter table public.volunteer_applications add constraint volunteer_applications_volunteer_id_fkey
  foreign key (volunteer_id) references public.users(id) on delete cascade on update cascade;
alter table public.notifications drop constraint if exists notifications_recipient_user_id_fkey;
alter table public.notifications add constraint notifications_recipient_user_id_fkey
  foreign key (recipient_user_id) references public.users(id) on delete cascade on update cascade;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update of email, raw_user_meta_data, raw_app_meta_data, email_confirmed_at
  on auth.users
  for each row execute function public.sync_auth_user_profile();

-- Backfill Auth accounts that already existed before this migration.
update public.users as profile
set id = auth_user.id::text,
    name = coalesce(
      nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(auth_user.email, ''), '@', 1),
      profile.name
    ),
    email = lower(auth_user.email),
    phone = coalesce(nullif(trim(auth_user.raw_user_meta_data ->> 'phone'), ''), profile.phone),
    role = coalesce(
      case when auth_user.raw_app_meta_data ->> 'psa_role' in ('public', 'volunteer', 'partner', 'admin')
        then auth_user.raw_app_meta_data ->> 'psa_role' end,
      profile.role
    ),
    verified = auth_user.email_confirmed_at is not null
from auth.users as auth_user
where auth_user.email is not null
  and (
    profile.id = auth_user.id::text
    or lower(profile.email) = lower(auth_user.email)
  );

insert into public.users (id, name, email, phone, role, verified)
select
  auth_user.id::text,
  coalesce(
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(auth_user.email, ''), '@', 1),
    'Pengguna PSA'
  ),
  lower(auth_user.email),
  nullif(trim(auth_user.raw_user_meta_data ->> 'phone'), ''),
  case when auth_user.raw_app_meta_data ->> 'psa_role' in ('public', 'volunteer', 'partner', 'admin')
    then auth_user.raw_app_meta_data ->> 'psa_role' else 'public' end,
  auth_user.email_confirmed_at is not null
from auth.users as auth_user
where auth_user.email is not null
  and not exists (select 1 from public.users p where p.id = auth_user.id::text)
  and not exists (select 1 from public.users p where lower(p.email) = lower(auth_user.email));

-- To promote an account created in Supabase Auth, set trusted app metadata. The
-- trigger above updates public.users.role to admin and the app's admin guard
-- requires both values to match. Replace the address with the intended account.
--
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--   || jsonb_build_object('psa_role', 'admin')
-- where lower(email) = lower('admin@example.org');
