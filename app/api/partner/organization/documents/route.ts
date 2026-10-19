import { requirePartnerSession } from '@/lib/supabase/server-partner';
import { matchesFileSignature } from '@/lib/file-signature.mjs';

export const runtime = 'nodejs';
const bucket = 'partner-documents';
const acceptedTypes = new Set(['application/pdf','image/jpeg','image/png']);

export async function GET() {
  const auth = await requirePartnerSession({ allowRevision:true });
  if ('error' in auth) return Response.json({ error:auth.error }, { status:auth.status });
  const { data, error } = await auth.db.from('partner_documents').select('*').eq('organization_id',auth.orgId).order('uploaded_at',{ascending:false});
  if (error) return Response.json({ error:'Dokumen organisasi gagal dimuat.' }, { status:500 });
  const documents = await Promise.all((data||[]).map(async doc => {
    const signed = doc.storage_path ? await auth.db.storage.from(bucket).createSignedUrl(doc.storage_path,300) : null;
    return { id:doc.id,name:doc.name,type:doc.type,size:doc.size,uploadedAt:doc.uploaded_at,verificationStatus:doc.verification_status,url:signed?.data?.signedUrl||null };
  }));
  return Response.json({ documents });
}

export async function POST(request: Request) {
  const auth = await requirePartnerSession({ allowRevision:true });
  if ('error' in auth) return Response.json({ error:auth.error }, { status:auth.status });
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error:'Formulir dokumen tidak valid.' }, { status:400 }); }
  const file = form.get('document');
  if (!(file instanceof File) || file.size < 1 || file.size > 10*1024*1024 || !acceptedTypes.has(file.type)) {
    return Response.json({ error:'Pilih berkas PDF/JPG/PNG dengan ukuran maksimal 10 MB.' }, { status:400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesFileSignature(bytes, file.type)) return Response.json({ error:'Isi berkas tidak cocok dengan format PDF/JPG/PNG.' }, { status:400 });
  const safeName = file.name.replace(/[^\p{L}\p{N}._-]/gu,'_').slice(-120) || 'dokumen';
  const path = `${auth.orgId}/${crypto.randomUUID()}-${safeName}`;
  const upload = await auth.db.storage.from(bucket).upload(path,bytes,{ contentType:file.type,upsert:false });
  if (upload.error) return Response.json({ error:'Berkas gagal diunggah ke penyimpanan privat.' }, { status:500 });
  const saved = await auth.db.from('partner_documents').insert({
    id:crypto.randomUUID(),organization_id:auth.orgId,name:file.name.slice(0,255),type:file.type,size:`${(file.size/1024/1024).toFixed(2)} MB`,
    uploaded_at:new Date().toISOString(),verification_status:'pending',storage_path:path,content_type:file.type,size_bytes:file.size,
  }).select('*').single();
  if (saved.error || !saved.data) {
    await auth.db.storage.from(bucket).remove([path]);
    return Response.json({ error:'Metadata dokumen gagal disimpan.' }, { status:500 });
  }
  const signed = await auth.db.storage.from(bucket).createSignedUrl(path,300);
  return Response.json({ document:{ id:saved.data.id,name:saved.data.name,type:saved.data.type,size:saved.data.size,uploadedAt:saved.data.uploaded_at,verificationStatus:saved.data.verification_status,url:signed.data?.signedUrl||null } },{ status:201 });
}

export async function DELETE(request: Request) {
  const auth = await requirePartnerSession({ allowRevision:true });
  if ('error' in auth) return Response.json({ error:auth.error }, { status:auth.status });
  let input: { id?:unknown };
  try { input = await request.json(); } catch { return Response.json({ error:'Permintaan hapus tidak valid.' }, { status:400 }); }
  if (typeof input.id !== 'string') return Response.json({ error:'Dokumen tidak ditemukan.' }, { status:404 });
  const { data: doc, error } = await auth.db.from('partner_documents').select('id,storage_path,verification_status').eq('id',input.id).eq('organization_id',auth.orgId).maybeSingle();
  if (error || !doc) return Response.json({ error:'Dokumen tidak ditemukan.' }, { status:404 });
  if (doc.verification_status === 'verified') return Response.json({ error:'Dokumen yang sudah diverifikasi tidak dapat dihapus. Minta bantuan admin untuk menggantinya.' }, { status:409 });
  if (doc.storage_path) {
    const removed = await auth.db.storage.from(bucket).remove([doc.storage_path]);
    if (removed.error) return Response.json({ error:'Berkas gagal dihapus dari penyimpanan.' }, { status:500 });
  }
  const deleted = await auth.db.from('partner_documents').delete().eq('id',input.id).eq('organization_id',auth.orgId);
  if (deleted.error) return Response.json({ error:'Catatan dokumen gagal dihapus.' }, { status:500 });
  return Response.json({ ok:true });
}
