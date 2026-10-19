import { requirePsaAdmin } from '@/lib/supabase/server-admin';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const { data, error } = await auth.db.from('program_reports').select('*,programs!inner(title,partner_name)').eq('program_id', id).order('created_at', { ascending: false });
  if (error) return Response.json({ error: 'Laporan program gagal dimuat.' }, { status: 500 });
  const reports = await Promise.all((data || []).map(async report => {
    const signed = await auth.db.storage.from('program-reports').createSignedUrl(report.storage_path, 300);
    return { ...report, url: signed.data?.signedUrl || null };
  }));
  return Response.json({ reports });
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id: programId } = await params;
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data review laporan tidak valid.' }, { status: 400 }); }
  const reportId = typeof input.reportId === 'string' ? input.reportId : '';
  const status = typeof input.status === 'string' ? input.status : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 3000) : '';
  if (!reportId || !['approved', 'revision_required'].includes(status) || (status === 'revision_required' && !notes)) return Response.json({ error: 'Status review tidak valid atau catatan revisi belum diisi.' }, { status: 400 });
  const { data: report, error } = await auth.db.from('program_reports').update({ status, review_notes: notes || null, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq('id', reportId).eq('program_id', programId).eq('status', 'submitted').select('id,status,review_notes,reviewed_at').maybeSingle();
  if (error) return Response.json({ error: 'Laporan gagal diperbarui.' }, { status: 500 });
  if (!report) return Response.json({ error: 'Laporan tidak ditemukan atau sudah direview sebelumnya.' }, { status: 409 });
  const audit = await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin', action: 'PROGRAM_REPORT_REVIEWED', entity_type: 'program', entity_id: programId, details: `Status laporan diubah menjadi ${status}. Catatan: ${notes || '-'}` });
  if (audit.error) console.error('Failed to write report review audit log:', audit.error.message);
  return Response.json({ report });
}
