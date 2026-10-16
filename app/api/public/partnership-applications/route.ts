import { createServiceSupabase } from '@/lib/supabase/server-db';

export const runtime = 'nodejs';
const types = ['corporate', 'foundation', 'community', 'university', 'school'];
export async function POST(request: Request) {
  const db = createServiceSupabase();
  if (!db) return Response.json({ error: 'Konfigurasi Supabase server belum lengkap.' }, { status: 503 });
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: 'Form pengajuan tidak valid.' }, { status: 400 }); }
  const get = (key: string) => String(form.get(key) || '').trim();
  const fields = { pic_name: get('picName'), organization_name: get('organizationName'), pic_email: get('email').toLowerCase(), pic_phone: get('phone'), organization_type: get('type'), sector: get('sector'), province: get('province'), city: get('city'), pic_role: get('picRole'), description: get('description'), website: get('website'), address: get('address') };
  if (!fields.pic_name || !fields.organization_name || !fields.pic_email || !fields.pic_phone || !fields.sector || !fields.province || !fields.city || !fields.pic_role || !types.includes(fields.organization_type) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.pic_email)) return Response.json({ error: 'Lengkapi data wajib dan gunakan email yang valid.' }, { status: 400 });
  const file = form.get('document');
  if (file && !(file instanceof File)) return Response.json({ error: 'Dokumen tidak valid.' }, { status: 400 });
  if (file instanceof File && (file.size > 10 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) return Response.json({ error: 'Dokumen harus PDF/JPG/PNG dengan ukuran maksimal 10 MB.' }, { status: 400 });
  const { data: duplicate } = await db.from('partnership_applications').select('id').ilike('pic_email', fields.pic_email).in('status', ['submitted', 'under_review', 'revision_required', 'approved']).limit(1).maybeSingle();
  if (duplicate) return Response.json({ error: 'Pengajuan aktif atau akun mitra dengan email ini sudah tersedia.' }, { status: 409 });
  const { data: application, error } = await db.from('partnership_applications').insert(fields).select('id').single();
  if (error || !application) return Response.json({ error: 'Pengajuan belum dapat disimpan.' }, { status: 500 });
  if (file instanceof File) {
    const path = `${application.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const bytes = await file.arrayBuffer();
    const uploaded = await db.storage.from('partner-documents').upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploaded.error) { await db.from('partnership_applications').delete().eq('id', application.id); return Response.json({ error: 'Dokumen gagal disimpan.' }, { status: 500 }); }
    const saved = await db.from('partnership_application_documents').insert({ application_id: application.id, file_name: file.name, storage_path: path, content_type: file.type, size_bytes: file.size });
    if (saved.error) { await db.storage.from('partner-documents').remove([path]); await db.from('partnership_applications').delete().eq('id', application.id); return Response.json({ error: 'Catatan dokumen gagal disimpan.' }, { status: 500 }); }
  }
  return Response.json({ ok: true }, { status: 201 });
}
