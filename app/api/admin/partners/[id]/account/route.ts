import { requirePsaAdmin } from '@/lib/supabase/server-admin';
import type { SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
type PartnerAuthUser = { id: string; email?: string; app_metadata: Record<string, any> };

function temporaryPassword(name: string, registeredAt: string) {
  const date = new Date(registeredAt);
  const datePart = `${String(date.getUTCDate()).padStart(2, '0')}${String(date.getUTCMonth() + 1).padStart(2, '0')}${date.getUTCFullYear()}`;
  const cleanName = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]/g, '');
  return `${cleanName}${datePart}`;
}

async function findAuthUserByEmail(db: SupabaseClient, email: string): Promise<PartnerAuthUser | null> {
  for (let page = 1; ; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data.users as unknown as PartnerAuthUser[];
    const found = users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 1000) return null;
  }
}

export async function POST(_request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const { data: organization, error: organizationError } = await auth.db.from('partner_organizations').select('*').eq('id', id).maybeSingle();
  if (organizationError || !organization) return Response.json({ error: 'Organisasi mitra tidak ditemukan.' }, { status: 404 });
  if (organization.status !== 'approved') return Response.json({ error: 'Akun hanya dapat dibuat untuk organisasi yang telah disetujui.' }, { status: 409 });

  const { data: application } = await auth.db.from('partnership_applications')
    .select('registration_date')
    .eq('partner_id', organization.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const password = temporaryPassword(organization.name, application?.registration_date || organization.created_at);
  if (password.length < 12) return Response.json({ error: 'Nama organisasi menghasilkan kata sandi sementara yang terlalu pendek.' }, { status: 400 });
  let user;
  let createdAccount = false;
  try { user = await findAuthUserByEmail(auth.db, organization.pic_email); }
  catch { return Response.json({ error: 'Gagal memeriksa akun Supabase Auth.' }, { status: 503 }); }

  if (user && (user.app_metadata?.psa_role !== 'partner' || user.app_metadata?.partner_organization_id !== organization.id)) {
    const { data: existingProfile } = await auth.db.from('users').select('id,role,org_id').eq('email', organization.pic_email).maybeSingle();
    if (existingProfile?.role !== 'partner' || existingProfile.org_id !== organization.id || existingProfile.id !== user.id) {
      return Response.json({ error: 'Email PIC sudah dipakai akun yang tidak tertaut ke organisasi ini.' }, { status: 409 });
    }
  }
  let temporary = false;
  if (!user) {
    const created = await auth.db.auth.admin.createUser({
      email: organization.pic_email, password, email_confirm: true,
      user_metadata: { name: organization.pic_name, phone: organization.pic_phone },
      app_metadata: { psa_role: 'partner', must_change_password: true, partner_organization_id: organization.id },
    });
    if (created.error || !created.data.user) return Response.json({ error: 'Akun mitra gagal dibuat di Supabase Auth.' }, { status: 502 });
    user = created.data.user;
    temporary = true;
    createdAccount = true;
  } else {
    const updated = await auth.db.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, psa_role: 'partner', partner_organization_id: organization.id },
    });
    if (updated.error || !updated.data.user) return Response.json({ error: 'Claim role akun mitra gagal disimpan.' }, { status: 500 });
    user = updated.data.user;
    temporary = user.app_metadata?.must_change_password === true;
  }

  const { data: linkedProfile, error: profileError } = await auth.db.from('users').select('id').eq('id', user.id).maybeSingle();
  if (profileError || !linkedProfile) return Response.json({ error: 'Akun Auth dibuat, tetapi profil belum tertaut. Terapkan migrasi auth profile sync lalu ulangi aksi ini.' }, { status: 503 });
  const profile = await auth.db.from('users').upsert({
    id: user.id, name: organization.pic_name, email: organization.pic_email.toLowerCase(), phone: organization.pic_phone,
    role: 'partner', org_id: organization.id, verified: true,
  }, { onConflict: 'id' });
  if (profile.error) return Response.json({ error: 'Akun dibuat, tetapi profil mitra gagal diperbarui.' }, { status: 500 });
  const linkedOrganization = await auth.db.from('partner_organizations').update({ user_id: user.id }).eq('id', organization.id);
  if (linkedOrganization.error) return Response.json({ error: 'Akun dan profil dibuat, tetapi tautan organisasi gagal diperbarui.' }, { status: 500 });
  await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin',
    action: createdAccount ? 'PARTNER_AUTH_ACCOUNT_CREATED' : 'PARTNER_AUTH_ACCOUNT_LINKED', entity_type: 'user', entity_id: user.id,
    details: `Akun mitra ${organization.name} ditautkan dengan organisasi ${organization.id}.`,
  });
  return Response.json({ ok: true, accountAlreadyExisted: !createdAccount, temporaryPassword: temporary ? password : null });
}
