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
  if (proposalStatus && !['under_review', 'revision_required', 'approved', 'rejected'].includes(proposalStatus)) return Response.json({ error: 'Status proposal tidak valid.' }, { status: 400 });
  if (publicationStatus && !['draft', 'published', 'closed', 'archived'].includes(publicationStatus)) return Response.json({ error: 'Status publikasi tidak valid.' }, { status: 400 });
  if (!proposalStatus && !publicationStatus) return Response.json({ error: 'Tidak ada perubahan yang dikirim.' }, { status: 400 });

  const { data: existing, error: readError } = await auth.db.from('programs').select('id,title,partner_id').eq('id', id).maybeSingle();
  if (readError || !existing) return Response.json({ error: 'Program tidak ditemukan.' }, { status: 404 });
  const changes: Record<string, unknown> = {};
  if (proposalStatus) {
    changes.proposal_status = proposalStatus;
    changes.review_notes = notes || null;
    if (proposalStatus === 'approved') changes.published_status = 'published';
  }
  if (publicationStatus) changes.published_status = publicationStatus;
  const { data: program, error } = await auth.db.from('programs').update(changes).eq('id', id).select('*').single();
  if (error) return Response.json({ error: 'Gagal menyimpan perubahan program.' }, { status: 500 });
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
