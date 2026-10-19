import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function requirePartnerSession(options: { allowRevision?: boolean } = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return { error: 'Konfigurasi Supabase server belum lengkap.', status: 503 as const };

  const cookieStore = await cookies();
  const session = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: values => values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user?.email) return { error: 'Sesi Supabase tidak valid.', status: 401 as const };

  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await db.from('users').select('id,role,name,email,org_id').eq('email', user.email).maybeSingle();
  if (profileError || !profile) return { error: 'Profil pengguna tidak ditemukan.', status: 404 as const };

  if (profile.role !== 'partner') {
    return { error: 'Akses khusus perwakilan mitra resmi PSA.', status: 403 as const };
  }

  const allowedStatuses = options.allowRevision ? ['approved', 'revision_required', 'submitted', 'under_review'] : ['approved'];
  const { data: org, error: organizationError } = await db.from('partner_organizations')
    .select('id,name,status,user_id').eq('user_id', user.id).in('status', allowedStatuses).maybeSingle();
  if (organizationError || !org || (profile.org_id && profile.org_id !== org.id)) {
    return { error: 'Organisasi mitra belum aktif atau tidak tertaut secara valid ke akun ini.', status: 403 as const };
  }

  return { db, user, profile, orgId:org.id, orgName:org.name };
}
