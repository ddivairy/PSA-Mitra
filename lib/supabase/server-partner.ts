import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function requirePartnerSession() {
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

  if (profile.role !== 'partner' && profile.role !== 'admin') {
    return { error: 'Akses khusus perwakilan mitra resmi PSA.', status: 403 as const };
  }

  let orgId = profile.org_id;
  let orgName = '';
  if (!orgId) {
    const { data: org } = await db.from('partner_organizations').select('id,name').eq('user_id', user.id).maybeSingle();
    orgId = org?.id || null;
    orgName = org?.name || '';
    if (!orgId && profile.role === 'admin') {
      const { data: firstOrg } = await db.from('partner_organizations').select('id,name').eq('status', 'approved').limit(1).maybeSingle();
      if (firstOrg) {
        orgId = firstOrg.id;
        orgName = firstOrg.name;
      }
    }
  } else {
    const { data: org } = await db.from('partner_organizations').select('id,name').eq('id', orgId).maybeSingle();
    orgName = org?.name || '';
  }

  return { db, user, profile, orgId, orgName };
}
