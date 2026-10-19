import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return Response.json({ error: 'Konfigurasi autentikasi server belum lengkap.' }, { status: 503 });

  const cookieStore = await cookies();
  const sessionClient = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: values => values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user?.email) return Response.json({ error: 'Sesi Supabase tidak valid.' }, { status: 401 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing, error: lookupError } = await admin.from('users').select('role,name,email,phone,verified,org_id').eq('email', user.email).maybeSingle();
  if (lookupError) return Response.json({ error: 'Gagal membaca profil PSA.' }, { status: 500 });
  if (existing) {
    if (existing.role === 'admin' && user.app_metadata?.psa_role !== 'admin') {
      return Response.json({ error: 'Akun admin belum diotorisasi oleh administrator Supabase.' }, { status: 403 });
    }
    if (existing.role === 'partner' && user.app_metadata?.psa_role !== 'partner') return Response.json({ error: 'Akun mitra belum diotorisasi oleh administrator PSA.' }, { status: 403 });
    let organization = null;
    if (existing.role === 'partner') {
      const { data, error: orgError } = await admin.from('partner_organizations').select('*').eq('user_id', user.id).maybeSingle();
      if (orgError || !data || !['approved','revision_required','submitted','under_review'].includes(data.status) || data.user_id !== user.id) return Response.json({ error: 'Profil organisasi mitra belum aktif atau tidak tertaut.' }, { status: 403 });
      organization = data;
    }
    return Response.json({ role: existing.role, profile: { id: user.id, name: existing.name, email: existing.email, phone: existing.phone || '', role: existing.role, verified: existing.verified, orgId: existing.org_id || undefined }, organization, mustChangePassword: user.app_metadata?.must_change_password === true });
  }
  return Response.json({ error: 'Profil PSA belum dibuat dan diotorisasi oleh administrator.' }, { status: 403 });
}
