import { requirePsaAdmin } from '@/lib/supabase/server-admin';
export const runtime = 'nodejs';
export async function GET() {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.db.from('volunteer_registrations').select('*').order('created_at', { ascending: false });
  if (error) return Response.json({ error: 'Gagal memuat pendaftar relawan.' }, { status: 500 });
  return Response.json({ registrations: data });
}
export async function PATCH(request: Request) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data keputusan tidak valid.' }, { status: 400 }); }
  const id = typeof input.id === 'string' ? input.id : '';
  const status = typeof input.status === 'string' ? input.status : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '';
  if (!id || !['under_review','selected','rejected','revision_required'].includes(status)) return Response.json({ error: 'ID atau status tidak valid.' }, { status: 400 });
  const { data, error } = await auth.db.from('volunteer_registrations').update({ status, review_notes: notes || null, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) return Response.json({ error: 'Gagal menyimpan hasil seleksi.' }, { status: 500 });
  await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin', action: `VOLUNTEER_REGISTRATION_${status.toUpperCase()}`, entity_type: 'application', entity_id: id, details: `Status pendaftaran relawan ${data.full_name} diubah menjadi ${status}. Catatan: ${notes || '-'}` });
  return Response.json({ registration: data });
}
