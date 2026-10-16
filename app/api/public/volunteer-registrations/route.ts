import { createServiceSupabase } from '@/lib/supabase/server-db';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const db = createServiceSupabase();
  if (!db) return Response.json({ error: 'Konfigurasi Supabase server belum lengkap.' }, { status: 503 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data pendaftaran tidak valid.' }, { status: 400 }); }
  const fields = ['fullName', 'email', 'phone', 'province', 'city', 'motivation'] as const;
  const values = Object.fromEntries(fields.map(key => [key, typeof input[key] === 'string' ? input[key].trim() : ''])) as Record<typeof fields[number], string>;
  if (fields.some(key => !values[key]) || values.fullName.length > 160 || values.motivation.length > 4000 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return Response.json({ error: 'Lengkapi data wajib dengan format yang benar.' }, { status: 400 });
  const { data: duplicate } = await db.from('volunteer_registrations').select('id').ilike('email', values.email).in('status', ['submitted', 'under_review', 'selected']).limit(1).maybeSingle();
  if (duplicate) return Response.json({ error: 'Pendaftaran aktif dengan email tersebut sudah tersedia.' }, { status: 409 });
  const { error } = await db.from('volunteer_registrations').insert({ full_name: values.fullName, email: values.email.toLowerCase(), phone: values.phone, province: values.province, city: values.city, motivation: values.motivation });
  if (error) return Response.json({ error: 'Pendaftaran belum dapat disimpan. Silakan coba kembali.' }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
