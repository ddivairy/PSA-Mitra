import { requirePsaAdmin } from '@/lib/supabase/server-admin';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data keputusan tidak valid.' }, { status: 400 }); }
  const { id } = await params;
  const status = typeof input.status === 'string' ? input.status : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '';
  if (!['under_review', 'accepted', 'waitlisted', 'rejected', 'withdrawn'].includes(status)) return Response.json({ error: 'Status pendaftaran tidak valid.' }, { status: 400 });
  const { data: existing, error: readError } = await auth.db.from('volunteer_applications').select('id,history,volunteer_id,program_title').eq('id', id).maybeSingle();
  if (readError || !existing) return Response.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
  const history = Array.isArray(existing.history) ? existing.history : [];
  history.push({ status, date: new Date().toISOString(), actor: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', note: notes || `Status diubah menjadi ${status}` });
  const { data: application, error } = await auth.db.from('volunteer_applications').update({ status, review_notes: notes || null, history }).eq('id', id).select('*').single();
  if (error) return Response.json({ error: 'Gagal menyimpan hasil review pendaftaran.' }, { status: 500 });
  const { error: auditError } = await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(), timestamp: new Date().toISOString(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA',
    actor_role: 'admin', action: 'APPLICATION_STATUS_UPDATED', entity_type: 'application', entity_id: id,
    details: `Status aplikasi diubah menjadi ${status}. Catatan: ${notes || '-'}`,
  });
  if (auditError) console.error('Failed to save admin application audit log:', auditError.message);
  await auth.db.from('notifications').insert({
    id: crypto.randomUUID(), recipient_user_id: existing.volunteer_id,
    title: `Status Pendaftaran: ${status.toUpperCase()}`,
    message: `Pendaftaran untuk program "${existing.program_title}" diperbarui menjadi ${status}. ${notes ? `Catatan: ${notes}` : ''}`,
    link_type: 'application', read: false,
  });
  return Response.json({ application });
}
