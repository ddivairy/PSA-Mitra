import { requirePartnerSession } from '@/lib/supabase/server-partner';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const progression = ['planned', 'registration_open', 'registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion'];

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data status program tidak valid.' }, { status: 400 }); }
  const status = typeof input.executionStatus === 'string' ? input.executionStatus : '';
  const announcement = typeof input.announcement === 'string' ? input.announcement.trim() : '';
  if (!progression.includes(status) || announcement.length > 2000) return Response.json({ error: 'Status atau pengumuman program tidak valid.' }, { status: 400 });
  const { data, error } = await auth.db.rpc('update_partner_program_execution', {
    p_program_id: id, p_partner_id: auth.orgId, p_user_id: auth.user.id, p_status: status, p_announcement: announcement,
  });
  if (error) {
    console.error('Partner program status update failed:', error.message);
    if (error.message.includes('partner_not_authorized')) return Response.json({ error: 'Akses ke organisasi program ini ditolak.' }, { status: 403 });
    if (error.message.includes('program_unavailable')) return Response.json({ error: 'Program tidak ditemukan atau belum terbit.' }, { status: 404 });
    return Response.json({ error: 'Perubahan status harus mengikuti urutan tahap program.' }, { status: 409 });
  }
  return Response.json({ program: Array.isArray(data) ? data[0] : data });
}
