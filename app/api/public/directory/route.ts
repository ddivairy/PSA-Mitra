import { createServiceSupabase } from '@/lib/supabase/server-db';

export const runtime = 'nodejs';

type SupabaseErrorFields = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logSupabaseError(label: string, error: SupabaseErrorFields) {
  console.error(`[public-directory] ${label} ${JSON.stringify({
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  })}`);
}

export async function GET() {
  const db = createServiceSupabase();
  if (!db) return Response.json({ error: 'Konfigurasi katalog publik belum tersedia.' }, { status: 503 });
  const [programs, partners] = await Promise.all([
    db.from('published_program_directory').select('*').order('created_at', { ascending: false }),
    db.from('approved_partner_directory').select('*').order('name'),
  ]);
  if (programs.error || partners.error) {
    if (programs.error) logSupabaseError('published_program_directory', programs.error);
    if (partners.error) logSupabaseError('approved_partner_directory', partners.error);
    return Response.json({ error: 'Katalog publik gagal dimuat.' }, { status: 503 });
  }
  const ids = (programs.data || []).map(program => program.id);
  const timeline = ids.length ? await db.from('program_status_history').select('program_id,status,announcement,created_at').eq('is_public', true).in('program_id', ids).order('created_at', { ascending: false }).limit(200) : { data: [], error: null };
  if (timeline.error) {
    logSupabaseError('program_status_history', timeline.error);
    return Response.json({ error: 'Riwayat publik program gagal dimuat.' }, { status: 503 });
  }
  return Response.json({ programs: programs.data || [], partners: partners.data || [], timeline: timeline.data || [] }, { headers: { 'Cache-Control': 'no-store' } });
}
