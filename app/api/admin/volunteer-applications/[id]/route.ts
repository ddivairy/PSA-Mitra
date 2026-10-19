import { requirePsaAdmin } from '@/lib/supabase/server-admin';
import { sendGmailMessage } from '@/lib/email/gmail';

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
  const { data: existing, error: readError } = await auth.db.from('volunteer_applications').select('id,history,volunteer_id,program_title,volunteer_name,volunteer_email,status').eq('id', id).maybeSingle();
  if (readError || !existing) return Response.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
  if (existing.status === status) return Response.json({ application: existing, unchanged: true });
  const allowedTransitions: Record<string, string[]> = {
    submitted: ['under_review', 'accepted', 'waitlisted', 'rejected', 'withdrawn'],
    under_review: ['accepted', 'waitlisted', 'rejected', 'withdrawn'],
    waitlisted: ['under_review', 'accepted', 'rejected', 'withdrawn'],
    accepted: ['withdrawn'],
    rejected: [],
    withdrawn: [],
  };
  if (!allowedTransitions[existing.status]?.includes(status)) return Response.json({ error: `Transisi status ${existing.status} ke ${status} tidak diizinkan.` }, { status: 409 });
  const history = Array.isArray(existing.history) ? existing.history : [];
  history.push({ status, date: new Date().toISOString(), actor: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', note: notes || `Status diubah menjadi ${status}` });
  const { data: application, error } = await auth.db.from('volunteer_applications').update({ status, review_notes: notes || null, history })
    .eq('id', id).eq('status', existing.status).select('*').maybeSingle();
  if (error) return Response.json({ error: 'Gagal menyimpan hasil review pendaftaran.' }, { status: 500 });
  if (!application) return Response.json({ error: 'Status pendaftaran berubah oleh admin lain. Muat ulang data sebelum mengambil keputusan.' }, { status: 409 });
  const { error: auditError } = await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(), timestamp: new Date().toISOString(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA',
    actor_role: 'admin', action: 'APPLICATION_STATUS_UPDATED', entity_type: 'application', entity_id: id,
    details: `Status aplikasi diubah menjadi ${status}. Catatan: ${notes || '-'}`,
  });
  if (auditError) console.error('Failed to save admin application audit log:', auditError.message);
  if (existing.volunteer_id) {
    const notification = await auth.db.from('notifications').insert({
      id: crypto.randomUUID(), recipient_user_id: existing.volunteer_id,
      title: `Status Pendaftaran: ${status.toUpperCase()}`,
      message: `Pendaftaran untuk program "${existing.program_title}" diperbarui menjadi ${status}. ${notes ? `Catatan: ${notes}` : ''}`,
      link_type: 'application', read: false,
    });
    if (notification.error) console.error('Failed to create application notification:', notification.error.message);
  }
  let emailDelivery: { status: 'sent' | 'failed' | 'unknown'; error?: string } | undefined;
  if (['accepted', 'waitlisted', 'rejected'].includes(status) && existing.volunteer_email) {
    const resultLabel = status === 'accepted' ? 'diterima' : status === 'waitlisted' ? 'masuk daftar tunggu' : 'belum dapat diterima';
    const subject = `Hasil seleksi relawan — ${existing.program_title}`;
    const body = [
      `Halo ${existing.volunteer_name},`,
      '',
      `Hasil seleksi pendaftaran Anda untuk program "${existing.program_title}" adalah: ${resultLabel}.`,
      notes ? `Catatan admin: ${notes}` : '',
      '',
      'Salam,',
      'Tim PSA',
    ].filter(Boolean).join('\n');
    const log = await auth.db.from('follow_up_logs').insert({
      recipient_type: 'program_application', recipient_id: id,
      recipient_name: existing.volunteer_name, recipient_email: existing.volunteer_email,
      recipient_phone: application.volunteer_phone || '', channel: 'email', category: 'selection',
      subject, body, status: 'sending', created_by: auth.user.id,
    }).select('id').single();
    if (log.error || !log.data) {
      console.error('Failed to create selection email log:', log.error?.message);
      return Response.json({ application, emailDelivery: { status: 'failed', error: 'Keputusan tersimpan, tetapi email tidak dikirim karena log pengiriman gagal dibuat.' } });
    }
    let statusLog: 'sent' | 'failed' = 'failed';
    let providerMessageId: string | null = null;
    let errorMessage: string | null = null;
    try {
      providerMessageId = await sendGmailMessage(existing.volunteer_email, subject, body);
      statusLog = 'sent';
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Pengiriman email gagal.';
    }
    const logged = await auth.db.from('follow_up_logs').update({
      status: statusLog, provider_message_id: providerMessageId,
      error_message: errorMessage, created_by: auth.user.id,
      sent_at: statusLog === 'sent' ? new Date().toISOString() : null,
    }).eq('id', log.data.id);
    if (logged.error) {
      console.error('Failed to update selection email log:', logged.error.message);
      errorMessage = 'Status email gagal dicatat setelah percobaan kirim; periksa log pengiriman.';
    }
    emailDelivery = { status: logged.error ? 'unknown' : statusLog, ...(errorMessage ? { error: errorMessage } : {}) };
  }
  return Response.json({ application, emailDelivery });
}
