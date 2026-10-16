import { requirePsaAdmin } from '@/lib/supabase/server-admin';
export const runtime = 'nodejs';

export async function GET() {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const [apps, docs, partners] = await Promise.all([
    auth.db.from('partnership_applications').select('*').order('created_at', { ascending: false }),
    auth.db.from('partnership_application_documents').select('*').order('created_at', { ascending: false }),
    auth.db.from('partner_organizations').select('id,user_id,name,pic_name,pic_email,pic_phone,status,created_at').eq('status', 'approved').order('created_at', { ascending: false }),
  ]);
  if (apps.error || docs.error || partners.error) return Response.json({ error: 'Gagal memuat pengajuan dan mitra.' }, { status: 500 });
  const documents = await Promise.all((docs.data || []).map(async doc => {
    const signed = await auth.db.storage.from('partner-documents').createSignedUrl(doc.storage_path, 300);
    return { ...doc, url: signed.data?.signedUrl || null };
  }));
  return Response.json({ applications: apps.data, documents, approvedPartners: partners.data });
}

export async function POST(request: Request) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>; let file: File | null = null;
  try {
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await request.formData();
      input = Object.fromEntries([...form.entries()].filter(([key]) => key !== 'document'));
      const candidate = form.get('document'); if (candidate instanceof File) file = candidate;
    } else input = await request.json();
  } catch { return Response.json({ error: 'Data formulir tidak valid.' }, { status: 400 }); }
  const fields = ['organization_name','organization_type','sector','province','city','pic_name','pic_role','pic_email','pic_phone'] as const;
  const values = Object.fromEntries(fields.map(key => [key, typeof input[key] === 'string' ? (input[key] as string).trim() : ''])) as Record<typeof fields[number], string>;
  if (fields.some(key => !values[key]) || !['corporate','foundation','community','university','school'].includes(values.organization_type) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.pic_email)) return Response.json({ error: 'Lengkapi data wajib dengan format yang benar.' }, { status: 400 });
  if (file && (file.size > 10 * 1024 * 1024 || !['application/pdf','image/jpeg','image/png'].includes(file.type))) return Response.json({ error: 'Dokumen harus PDF/JPG/PNG dengan ukuran maksimal 10 MB.' }, { status: 400 });
  const { data, error } = await auth.db.from('partnership_applications').insert({ ...values, description: typeof input.description === 'string' ? input.description : '', address: typeof input.address === 'string' ? input.address : '', website: typeof input.website === 'string' ? input.website : null, is_offline: true }).select('*').single();
  if (error) return Response.json({ error: 'Gagal menyimpan pengajuan mitra offline.' }, { status: 500 });
  if (file) {
    const path = `${data.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const upload = await auth.db.storage.from('partner-documents').upload(path, await file.arrayBuffer(), { contentType:file.type });
    if (upload.error) { await auth.db.from('partnership_applications').delete().eq('id',data.id); return Response.json({error:'Dokumen gagal disimpan.'},{status:500}); }
    const saved = await auth.db.from('partnership_application_documents').insert({application_id:data.id,file_name:file.name,storage_path:path,content_type:file.type,size_bytes:file.size});
    if (saved.error) { await auth.db.storage.from('partner-documents').remove([path]); await auth.db.from('partnership_applications').delete().eq('id',data.id); return Response.json({error:'Catatan dokumen gagal disimpan.'},{status:500}); }
  }
  await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin', action: 'OFFLINE_PARTNERSHIP_APPLICATION_CREATED', entity_type: 'partnership', entity_id: data.id, details: `Pengajuan offline ${values.organization_name} dicatat.` });
  return Response.json({ application: data }, { status: 201 });
}
