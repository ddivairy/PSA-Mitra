import { requirePartnerSession } from '@/lib/supabase/server-partner';
import { matchesFileSignature } from '@/lib/file-signature.mjs';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const bucket = 'program-reports';
const acceptedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

export async function GET(_request: Request, { params }: Context) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const { data: program } = await auth.db.from('programs').select('id').eq('id', id).eq('partner_id', auth.orgId).maybeSingle();
  if (!program) return Response.json({ error: 'Program tidak ditemukan pada organisasi Anda.' }, { status: 404 });
  const { data, error } = await auth.db.from('program_reports').select('*').eq('program_id', id).eq('partner_id', auth.orgId).order('created_at', { ascending: false });
  if (error) return Response.json({ error: 'Laporan program gagal dimuat.' }, { status: 500 });
  const reports = await Promise.all((data || []).map(async report => {
    const signed = await auth.db.storage.from(bucket).createSignedUrl(report.storage_path, 300);
    return { ...report, url: signed.data?.signedUrl || null };
  }));
  return Response.json({ reports });
}

export async function POST(request: Request, { params }: Context) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const { data: program } = await auth.db.from('programs').select('id,proposal_status,published_status,execution_status').eq('id', id).eq('partner_id', auth.orgId).maybeSingle();
  if (!program) return Response.json({ error: 'Program tidak ditemukan pada organisasi Anda.' }, { status: 404 });
  if (program.proposal_status !== 'approved' || !['published', 'closed'].includes(program.published_status) || !['ongoing', 'pending_completion'].includes(program.execution_status)) return Response.json({ error: 'Laporan dapat dikirim setelah program berjalan.' }, { status: 409 });
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: 'Formulir laporan tidak valid.' }, { status: 400 }); }
  const file = form.get('report');
  const notes = typeof form.get('notes') === 'string' ? String(form.get('notes')).trim().slice(0, 3000) : '';
  if (!(file instanceof File) || file.size < 1 || file.size > 10 * 1024 * 1024 || !acceptedTypes.has(file.type)) return Response.json({ error: 'Pilih berkas PDF/JPG/PNG maksimal 10 MB.' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesFileSignature(bytes, file.type)) return Response.json({ error: 'Isi berkas tidak cocok dengan format PDF/JPG/PNG.' }, { status: 400 });
  const safeName = file.name.replace(/[^\p{L}\p{N}._-]/gu, '_').slice(-120) || 'laporan';
  const path = `${id}/${crypto.randomUUID()}-${safeName}`;
  const upload = await auth.db.storage.from(bucket).upload(path, bytes, { contentType: file.type, upsert: false });
  if (upload.error) return Response.json({ error: 'Laporan gagal diunggah ke penyimpanan privat.' }, { status: 500 });
  const saved = await auth.db.rpc('register_program_report', {
    p_program_id: id, p_partner_id: auth.orgId, p_user_id: auth.user.id,
    p_file_name: file.name.slice(0, 255), p_storage_path: path, p_content_type: file.type,
    p_size_bytes: file.size, p_notes: notes,
  });
  if (saved.error || !saved.data) {
    await auth.db.storage.from(bucket).remove([path]);
    const message = saved.error?.message || '';
    return Response.json({ error: message.includes('report_stage_closed') ? 'Tahap program berubah sebelum laporan berhasil disimpan.' : message.includes('partner_not_authorized') ? 'Akses ke program ini ditolak.' : 'Catatan laporan gagal disimpan.' }, { status: message.includes('partner_not_authorized') ? 403 : message.includes('report_stage_closed') ? 409 : 500 });
  }
  const report = Array.isArray(saved.data) ? saved.data[0] : saved.data;
  const signed = await auth.db.storage.from(bucket).createSignedUrl(path, 300);
  return Response.json({ report: { ...report, url: signed.data?.signedUrl || null } }, { status: 201 });
}
