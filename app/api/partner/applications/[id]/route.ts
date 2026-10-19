import { requirePartnerSession } from '@/lib/supabase/server-partner';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  if (!auth.orgId) return Response.json({ error: 'Akun belum tertaut ke organisasi mitra.' }, { status: 403 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data rekomendasi tidak valid.' }, { status: 400 }); }
  const recommendation = typeof input.recommendation === 'string' ? input.recommendation : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '';
  if (!['accepted', 'waitlisted', 'rejected'].includes(recommendation)) return Response.json({ error: 'Rekomendasi seleksi tidak valid.' }, { status: 400 });
  const { id } = await params;
  // Fetch the application and constrain its program to this partner in one joined query.
  const { data: application, error } = await auth.db.from('volunteer_applications')
    .select('id,program_id,status,programs!inner(id,partner_id,title)')
    .eq('id', id).eq('programs.partner_id', auth.orgId).maybeSingle();
  if (error || !application) return Response.json({ error: 'Pendaftaran tidak ditemukan pada program organisasi Anda.' }, { status: 404 });
  if (!['submitted', 'under_review', 'waitlisted'].includes(application.status)) return Response.json({ error: 'Rekomendasi hanya dapat diubah sebelum admin menetapkan hasil final.' }, { status: 409 });
  const update = await auth.db.from('volunteer_applications').update({
    partner_recommendation: recommendation, partner_review_notes: notes || null,
    partner_reviewed_by: auth.user.id, partner_reviewed_at: new Date().toISOString(),
  }).eq('id', id).select('id,partner_recommendation,partner_review_notes,partner_reviewed_at').single();
  if (update.error) return Response.json({ error: 'Rekomendasi gagal disimpan.' }, { status: 500 });
  const { error: auditError } = await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(), actor_name: auth.profile.name || auth.user.email || 'Mitra', actor_role: 'partner',
    action: 'APPLICATION_RECOMMENDATION_UPDATED', entity_type: 'application', entity_id: id,
    details: `Rekomendasi untuk program ${auth.orgName} diperbarui menjadi ${recommendation}. Catatan: ${notes || '-'}`,
  });
  if (auditError) console.error('Failed to record partner application recommendation:', auditError.message);
  return Response.json({ recommendation: update.data });
}
