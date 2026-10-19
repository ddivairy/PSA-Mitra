import { createServiceSupabase } from '@/lib/supabase/server-db';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

async function sendConfirmation(to: string, name: string, program: string) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GMAIL_FROM } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GMAIL_FROM) {
    return { status: 'failed' as const, error: 'Konfigurasi Gmail belum lengkap.' };
  }
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, refresh_token: GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }),
      cache: 'no-store',
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) return { status: 'failed' as const, error: 'Gmail gagal memberikan token pengiriman.' };
    const subject = `Pendaftaran diterima: ${program}`;
    const body = `Halo ${name},\n\nPendaftaran Anda untuk program “${program}” sudah tersimpan. Admin dan mitra penyelenggara akan meninjau pendaftaran Anda. Hasil seleksi akan disampaikan melalui email ini.\n\nSalam,\nPSA`;
    const raw = [`To: ${to}`, `From: ${GMAIL_FROM}`, `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', '', body].join('\r\n');
    const sentResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }), cache: 'no-store',
    });
    const sent = await sentResponse.json();
    if (!sentResponse.ok) return { status: 'failed' as const, error: sent.error?.message || 'Gmail menolak pengiriman.' };
    return { status: 'sent' as const, providerMessageId: sent.id as string | undefined };
  } catch {
    return { status: 'failed' as const, error: 'Tidak dapat menghubungi layanan Gmail.' };
  }
}

export async function POST(request: Request, { params }: Context) {
  const db = createServiceSupabase();
  if (!db) return Response.json({ error: 'Konfigurasi server Supabase belum lengkap.' }, { status: 503 });
  const { id: programId } = await params;
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data pendaftaran tidak valid.' }, { status: 400 }); }

  const name = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const province = typeof input.province === 'string' ? input.province.trim() : '';
  const city = typeof input.city === 'string' ? input.city.trim() : '';
  const motivation = typeof input.motivation === 'string' ? input.motivation.trim() : '';
  if (name.length < 2 || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || phone.length < 8 || phone.length > 40 || province.length > 120 || city.length > 120 || motivation.length < 10 || motivation.length > 4000) {
    return Response.json({ error: 'Periksa nama, email, nomor telepon, domisili, dan motivasi pendaftaran.' }, { status: 400 });
  }
  const answers = input.answers && typeof input.answers === 'object' && !Array.isArray(input.answers) ? input.answers as Record<string, unknown> : {};
  const safeAnswers: Record<string, string> = {};
  for (const [question, answer] of Object.entries(answers).slice(0, 20)) {
    if (typeof answer === 'string' && question.length <= 120) safeAnswers[question] = answer.trim().slice(0, 1000);
  }

  const { data, error } = await db.rpc('submit_public_program_application', {
    p_program_id: programId, p_full_name: name, p_email: email, p_phone: phone,
    p_province: province, p_city: city, p_motivation: motivation, p_answers: safeAnswers,
  });
  if (error || !data?.[0]) {
    const message = error?.message || '';
    const reason: [string, number] = message.includes('duplicate_program_application') ? ['Anda sudah mendaftar ke program ini dengan email tersebut.', 409]
      : message.includes('program_quota_full') ? ['Kuota program sudah penuh.', 409]
      : message.includes('application_deadline_passed') ? ['Pendaftaran program sudah ditutup.', 409]
      : message.includes('program_unavailable') ? ['Program tidak tersedia untuk pendaftaran.', 404]
      : ['Pendaftaran gagal disimpan. Coba lagi nanti.', 500];
    if (reason[1] === 500) console.error('Public program application RPC failed:', error?.message);
    return Response.json({ error: reason[0] }, { status: reason[1] });
  }
  const application = data[0] as { application_id: string; program_title: string; partner_name: string };
  const subject = `Pendaftaran diterima: ${application.program_title}`;
  const body = `Konfirmasi pendaftaran untuk program ${application.program_title}.`;
  const log = await db.from('follow_up_logs').insert({
    recipient_type: 'program_application', recipient_id: application.application_id, recipient_name: name,
    recipient_email: email, recipient_phone: phone, channel: 'email', category: 'status',
    subject, body, status: 'sending', created_by: null,
  }).select('id').single();
  let emailStatus: 'sent' | 'failed' | 'unknown' = 'failed';
  let errorMessage: string | null = null;
  let providerMessageId: string | null = null;
  if (log.error || !log.data) {
    console.error('Public application email log could not be created:', log.error?.message);
    errorMessage = 'Email tidak dikirim karena log pengiriman gagal dibuat.';
  } else {
    const delivery = await sendConfirmation(email, name, application.program_title);
    emailStatus = delivery.status;
    errorMessage = delivery.status === 'failed' ? delivery.error : null;
    providerMessageId = delivery.status === 'sent' ? delivery.providerMessageId || null : null;
    const logged = await db.from('follow_up_logs').update({
      status: emailStatus, error_message: errorMessage, provider_message_id: providerMessageId,
      sent_at: emailStatus === 'sent' ? new Date().toISOString() : null,
    }).eq('id', log.data.id);
    if (logged.error) {
      console.error('Public application email status could not be recorded:', logged.error.message);
      emailStatus = 'unknown';
    }
  }
  return Response.json({ ok: true, emailStatus, ...(errorMessage ? { emailError: errorMessage } : {}) }, { status: 201 });
}
