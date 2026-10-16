import { requirePsaAdmin } from '@/lib/supabase/server-admin';

export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data notifikasi tidak valid.' }, { status: 400 }); }
  const ids = Array.isArray(input.ids) ? input.ids.filter((id): id is string => typeof id === 'string' && id.length < 100) : [];
  if (!ids.length || ids.length > 200) return Response.json({ error: 'Daftar notifikasi tidak valid.' }, { status: 400 });
  const { error } = await auth.db.from('notifications').update({ read: true }).in('id', ids);
  if (error) return Response.json({ error: 'Gagal memperbarui notifikasi.' }, { status: 500 });
  return Response.json({ ok: true });
}
