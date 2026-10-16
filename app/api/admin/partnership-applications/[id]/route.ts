import { requirePsaAdmin } from '@/lib/supabase/server-admin';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const validStatuses = ['under_review', 'revision_required', 'rejected'];

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error: 'Data keputusan tidak valid.' }, { status: 400 }); }
  const { id } = await params;
  const { data: application, error } = await auth.db.from('partnership_applications').select('*').eq('id', id).maybeSingle();
  if (error || !application) return Response.json({ error: 'Pengajuan tidak ditemukan.' }, { status: 404 });
  const status = typeof input.status === 'string' ? input.status : '';
  const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 4000) : '';
  if (status !== 'approved' && !validStatuses.includes(status)) return Response.json({ error: 'Status keputusan tidak valid.' }, { status: 400 });
  if (['revision_required', 'rejected'].includes(status) && !notes) return Response.json({ error: 'Catatan wajib diisi untuk revisi atau penolakan.' }, { status: 400 });
  if (status !== 'approved') {
    const updated = await auth.db.from('partnership_applications').update({ status, review_notes: notes || null, reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (updated.error) return Response.json({ error: 'Gagal menyimpan keputusan.' }, { status: 500 });
    await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin', action: `PARTNERSHIP_APPLICATION_${status.toUpperCase()}`, entity_type: 'partnership', entity_id: id, details: `Status pengajuan mitra diubah menjadi ${status}. Catatan: ${notes || '-'}` });
    return Response.json({ application: updated.data });
  }
  const created = new Date(`${application.registration_date}T00:00:00Z`);
  const datePart = `${String(created.getUTCDate()).padStart(2,'0')}${String(created.getUTCMonth()+1).padStart(2,'0')}${created.getUTCFullYear()}`;
  const passwordName = application.organization_name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]/g, '');
  const temporaryPassword = `${passwordName}${datePart}`;
  if (temporaryPassword.length < 8) return Response.json({ error: 'Nama organisasi menghasilkan kata sandi sementara yang terlalu pendek.' }, { status: 400 });
  if (application.account_status === 'created' && application.auth_user_id && application.partner_id) {
    const { data: existingAccount } = await auth.db.auth.admin.getUserById(application.auth_user_id);
    const stillTemporary = existingAccount.user?.app_metadata?.must_change_password === true;
    return Response.json({ application, accountAlreadyCreated: true, temporaryPassword: stillTemporary ? temporaryPassword : null });
  }
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const claim = await auth.db.from('partnership_applications').update({ account_status: 'creating', account_error: null, updated_at: new Date().toISOString() }).eq('id', id).or(`account_status.in.(not_created,failed),and(account_status.eq.creating,updated_at.lt.${cutoff})`).select('id').maybeSingle();
  if (claim.error || !claim.data) return Response.json({ error: 'Approval lain sedang memproses pengajuan ini. Muat ulang sebelum mencoba lagi.' }, { status: 409 });
  const { data: existingList, error: listError } = await auth.db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) { await auth.db.from('partnership_applications').update({ account_status:'failed', account_error:'Tidak dapat memeriksa akun Auth.' }).eq('id', id); return Response.json({ error: 'Tidak dapat memeriksa akun Auth.' }, { status: 500 }); }
  const existing = (existingList.users as Array<{ id: string; email?: string; app_metadata: Record<string, unknown> }>).find(item => item.email?.toLowerCase() === application.pic_email.toLowerCase());
  let authUser = existing;
  if (existing && (existing.app_metadata?.partnership_application_id !== id || existing.app_metadata?.psa_role !== 'partner')) {
    const legacy = application.partner_id
      ? await auth.db.from('users').select('id,role,org_id').eq('email', application.pic_email).maybeSingle()
      : { data: null, error: null };
    if (legacy.data?.role === 'partner' && legacy.data.org_id === application.partner_id && existing.id === legacy.data.id) {
      const adopted = await auth.db.auth.admin.updateUserById(existing.id, { app_metadata: { ...existing.app_metadata, psa_role: 'partner', must_change_password: false, partnership_application_id: id } });
      if (adopted.error || !adopted.data.user) return Response.json({ error: 'Akun lama cocok dengan organisasi tetapi claim mitra gagal diperbarui.' }, { status: 500 });
      authUser = adopted.data.user;
    } else {
      await auth.db.from('partnership_applications').update({ account_status: 'failed', account_error: 'Email telah digunakan akun yang tidak terhubung dengan pengajuan ini.' }).eq('id', id);
      return Response.json({ error: 'Email ini sudah dipakai akun lain. Hubungi admin utama untuk menghindari pengambilalihan akun.' }, { status: 409 });
    }
  }
  if (!authUser) {
    const result = await auth.db.auth.admin.createUser({ email: application.pic_email, password: temporaryPassword, email_confirm: true, user_metadata: { name: application.pic_name, phone: application.pic_phone }, app_metadata: { psa_role: 'partner', must_change_password: true, partnership_application_id: id } });
    if (result.error || !result.data.user) { await auth.db.from('partnership_applications').update({ account_status:'failed', account_error:result.error?.message || 'Pembuatan akun gagal.' }).eq('id', id); return Response.json({ error: 'Akun mitra gagal dibuat. Pengajuan tetap dapat dicoba kembali.' }, { status: 502 }); }
    authUser = result.data.user;
  }
  const user = authUser;
  const partnerId = application.partner_id || crypto.randomUUID();
  const profile = await auth.db.from('users').upsert({ id: user.id, name: application.pic_name, email: application.pic_email, phone: application.pic_phone, role: 'partner', org_id: null, verified: true }, { onConflict: 'id' });
  if (profile.error) { await auth.db.from('partnership_applications').update({ account_status:'failed', auth_user_id:user.id, account_error:'Profil mitra gagal disimpan.' }).eq('id', id); return Response.json({ error: 'Akun terbuat, tetapi profil database gagal disimpan. Ulangi approval untuk memperbaiki tautan.' }, { status: 500 }); }
  const org = await auth.db.from('partner_organizations').upsert({ id: partnerId, user_id: user.id, name: application.organization_name, type: application.organization_type, sector: application.sector, description: application.description || '', website: application.website || null, address: application.address || '', province: application.province, city: application.city, pic_name: application.pic_name, pic_role: application.pic_role, pic_phone: application.pic_phone, pic_email: application.pic_email, status: 'approved', review_notes: notes || null }, { onConflict: 'id' });
  if (org.error) { await auth.db.from('partnership_applications').update({ account_status:'failed', auth_user_id:user.id, partner_id:partnerId, account_error:'Profil organisasi gagal disimpan.' }).eq('id', id); return Response.json({ error: 'Akun terbuat, tetapi profil organisasi gagal ditautkan. Ulangi approval untuk memperbaiki.' }, { status: 500 }); }
  const linked = await auth.db.from('users').update({ org_id: partnerId }).eq('id', user.id);
  if (linked.error) { await auth.db.from('partnership_applications').update({ account_status:'failed', auth_user_id:user.id, partner_id:partnerId, account_error:'Tautan profil mitra gagal disimpan.' }).eq('id', id); return Response.json({ error: 'Profil organisasi ada, tetapi tautan pengguna gagal disimpan. Ulangi approval untuk memperbaiki.' }, { status: 500 }); }
  const done = await auth.db.from('partnership_applications').update({ status:'approved', review_notes:notes || null, reviewed_by:auth.user.id, reviewed_at:new Date().toISOString(), auth_user_id:user.id, partner_id:partnerId, account_status:'created', account_error:null, updated_at:new Date().toISOString() }).eq('id', id).select('*').single();
  if (done.error) return Response.json({ error: 'Akun dan organisasi terbuat, tetapi status pengajuan gagal diperbarui. Ulangi approval.' }, { status: 500 });
  await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.user.user_metadata?.name || auth.user.email || 'Admin PSA', actor_role: 'admin', action: 'PARTNERSHIP_APPLICATION_APPROVED', entity_type: 'partnership', entity_id: id, details: `Pengajuan ${application.organization_name} disetujui dan akun mitra ditautkan.` });
  return Response.json({ application:done.data, temporaryPassword: authUser.app_metadata?.must_change_password === true ? temporaryPassword : null, accountAlreadyCreated:Boolean(existing) });
}
