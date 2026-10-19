import { requirePartnerSession } from '@/lib/supabase/server-partner';
import { matchesFileSignature } from '@/lib/file-signature.mjs';

export const runtime = 'nodejs';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  let form: FormData;
  try { form = await request.formData(); }
  catch { return Response.json({ error: 'Form unggah gambar tidak valid.' }, { status: 400 }); }
  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Pilih satu file gambar.' }, { status: 400 });
  const extension = MIME_EXTENSIONS[file.type];
  if (!extension || file.size < 1 || file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'Gunakan gambar JPEG, PNG, atau WebP maksimal 5 MB.' }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesFileSignature(bytes, file.type)) return Response.json({ error: 'Isi file tidak sesuai dengan format gambar.' }, { status: 400 });

  const path = `${auth.orgId}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await auth.db.storage.from('program-media').upload(path, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error || !data) {
    console.error('Program media upload failed:', error?.message);
    return Response.json({ error: 'Gambar gagal disimpan. Coba lagi.' }, { status: 503 });
  }
  const { data: publicUrl } = auth.db.storage.from('program-media').getPublicUrl(data.path);
  return Response.json({ imageUrl: publicUrl.publicUrl });
}
