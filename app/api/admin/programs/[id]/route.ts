import { requirePsaAdmin } from '@/lib/supabase/server-admin';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data perubahan program tidak valid.' }, { status: 400 }); }
  const { id } = await params;
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '';
  const proposalStatus = typeof input.proposalStatus === 'string' ? input.proposalStatus : '';
  const publicationStatus = typeof input.publicationStatus === 'string' ? input.publicationStatus : '';
  const executionStatus = typeof input.executionStatus === 'string' ? input.executionStatus : '';
  if (proposalStatus && !['under_review', 'revision_required', 'approved', 'rejected'].includes(proposalStatus)) return Response.json({ error: 'Status proposal tidak valid.' }, { status: 400 });
  if (publicationStatus && !['draft', 'published', 'closed', 'archived'].includes(publicationStatus)) return Response.json({ error: 'Status publikasi tidak valid.' }, { status: 400 });
  if (executionStatus && !['completed', 'canceled'].includes(executionStatus)) return Response.json({ error: 'Status pelaksanaan final tidak valid.' }, { status: 400 });
  if (!proposalStatus && !publicationStatus && !executionStatus) return Response.json({ error: 'Tidak ada perubahan yang dikirim.' }, { status: 400 });
  if (executionStatus && (proposalStatus || publicationStatus)) return Response.json({ error: 'Ubah status pelaksanaan secara terpisah dari review proposal atau publikasi.' }, { status: 400 });

  const { data: existing, error: readError } = await auth.db.from('programs')
    .select('id,title,partner_id,proposal_status,published_status,execution_status,start_date,end_date,deadline,category,summary,description,schedule,pic_name,pic_contact')
    .eq('id', id).maybeSingle();
  if (readError || !existing) return Response.json({ error: 'Program tidak ditemukan.' }, { status: 404 });
  if (proposalStatus === 'approved' && !['submitted', 'under_review', 'revision_required', 'approved'].includes(existing.proposal_status)) {
    return Response.json({ error: 'Hanya proposal yang sudah diajukan atau sedang ditinjau yang dapat disetujui.' }, { status: 409 });
  }
  if (['revision_required', 'rejected'].includes(proposalStatus) && !notes) {
    return Response.json({ error: 'Catatan wajib diisi untuk meminta revisi atau menolak proposal.' }, { status: 400 });
  }
  if (publicationStatus === 'published') {
    if (existing.proposal_status !== 'approved' && proposalStatus !== 'approved') {
      return Response.json({ error: 'Setujui proposal terlebih dahulu sebelum mempublikasikan program.' }, { status: 409 });
    }
    const missingPublicFields = [existing.title, existing.category, existing.summary, existing.description, existing.schedule, existing.pic_name, existing.pic_contact].some(value => !String(value || '').trim());
    const today = new Date().toISOString().slice(0, 10);
    if (missingPublicFields || !existing.start_date || !existing.end_date || !existing.deadline || existing.start_date > existing.end_date || existing.deadline < today) {
      return Response.json({ error: 'Lengkapi informasi publik dan gunakan jadwal serta batas pendaftaran yang valid sebelum publikasi.' }, { status: 409 });
    }
  }
  if (publicationStatus && publicationStatus !== 'draft' && existing.proposal_status !== 'approved' && proposalStatus !== 'approved') {
    return Response.json({ error: 'Status publikasi hanya dapat diubah untuk proposal yang sudah disetujui.' }, { status: 409 });
  }
  if (executionStatus && (existing.proposal_status !== 'approved' || !['published', 'closed'].includes(existing.published_status) || (executionStatus === 'completed' && existing.execution_status !== 'pending_completion'))) {
    return Response.json({ error: 'Program harus sudah terbit; penyelesaian hanya dapat dikonfirmasi setelah mitra mengirim permintaan penyelesaian.' }, { status: 409 });
  }
  if (executionStatus === 'canceled' && !notes) return Response.json({ error: 'Catatan pembatalan wajib diisi.' }, { status: 400 });

  if (executionStatus) {
    const { data, error } = await auth.db.rpc('finalize_program_execution', {
      p_program_id: id, p_status: executionStatus, p_notes: notes,
      p_user_id: auth.user.id, p_actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA',
    });
    if (error) {
      console.error('Admin program finalization failed:', error.message);
      if (error.message.includes('reports_not_complete')) return Response.json({ error: 'Setidaknya satu laporan harus disetujui dan tidak boleh ada laporan menunggu review atau revisi.' }, { status: 409 });
      return Response.json({ error: 'Penyelesaian status pelaksanaan gagal divalidasi.' }, { status: 409 });
    }
    return Response.json({ program: data });
  }
  const changes: Record<string, unknown> = {};
  if (proposalStatus) {
    changes.proposal_status = proposalStatus;
    changes.review_notes = notes || null;
    if (['revision_required', 'rejected'].includes(proposalStatus) && existing.published_status === 'published') {
      changes.published_status = 'closed';
    }
  }
  if (publicationStatus) changes.published_status = publicationStatus;
  let updateQuery = auth.db.from('programs').update(changes).eq('id', id);
  if (proposalStatus) updateQuery = updateQuery.eq('proposal_status', existing.proposal_status);
  if (publicationStatus) updateQuery = updateQuery.eq('published_status', existing.published_status);
  const { data: program, error } = await updateQuery.select('*').maybeSingle();
  if (error) return Response.json({ error: 'Gagal menyimpan perubahan program.' }, { status: 500 });
  if (!program) return Response.json({ error: 'Status program berubah oleh admin lain. Muat ulang sebelum menyimpan keputusan.' }, { status: 409 });
  const action = proposalStatus ? `PROPOSAL_${proposalStatus.toUpperCase()}` : 'PROGRAM_PUBLICATION_UPDATED';
  const { error: auditError } = await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(), timestamp: new Date().toISOString(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA',
    actor_role: 'admin', action, entity_type: proposalStatus ? 'proposal' : 'program', entity_id: id,
    details: proposalStatus ? `Status proposal ${proposalStatus}. Catatan: ${notes || '-'}` : `Status publikasi diubah menjadi ${publicationStatus}`,
  });
  if (auditError) console.error('Failed to save admin program audit log:', auditError.message);
  if (proposalStatus) {
    const { data: organization } = await auth.db.from('partner_organizations').select('user_id').eq('id', existing.partner_id).maybeSingle();
    if (organization?.user_id) await auth.db.from('notifications').insert({
      id: crypto.randomUUID(), recipient_user_id: organization.user_id,
      title: `Review Proposal: ${existing.title}`,
      message: `Keputusan PSA: ${proposalStatus}. ${notes ? `Catatan: ${notes}` : ''}`,
      link_type: 'proposal', read: false,
    });
  }
  return Response.json({ program });
}
