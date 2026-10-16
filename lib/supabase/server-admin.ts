import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function requirePsaAdmin() {
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
  const { data: profile, error: profileError } = await db.from('users').select('role').eq('email', user.email).maybeSingle();
  if (profileError) return { error: 'Gagal memverifikasi profil admin.', status: 503 as const };
  if (profile?.role !== 'admin' || user.app_metadata?.psa_role !== 'admin') return { error: 'Akses khusus admin PSA.', status: 403 as const };
  return { db, user };
}
