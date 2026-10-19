import { requirePartnerSession } from '@/lib/supabase/server-partner';

export const runtime = 'nodejs';
const textFields = ['name','sector','description','website','address','province','city','pic_name','pic_role','pic_phone','collaboration_reason','collaboration_objective','target_impact','offered_contribution','collaboration_period'] as const;
const types = ['corporate','foundation','community','university','school'];

export async function PATCH(request: Request) {
  const auth = await requirePartnerSession({ allowRevision:true });
  if ('error' in auth) return Response.json({ error:auth.error }, { status:auth.status });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return Response.json({ error:'Data profil organisasi tidak valid.' }, { status:400 }); }
  const changes: Record<string, unknown> = {};
  const fieldMap: Record<string,string> = { picName:'pic_name', picRole:'pic_role', picPhone:'pic_phone', collaborationReason:'collaboration_reason', collaborationObjective:'collaboration_objective', targetImpact:'target_impact', offeredContribution:'offered_contribution', collaborationPeriod:'collaboration_period' };
  for (const key of textFields) {
    const camel = Object.entries(fieldMap).find(([, value]) => value === key)?.[0] || key;
    if (typeof input[camel] !== 'string') continue;
    const value = input[camel].trim();
    if (value.length > 5000) return Response.json({ error:'Beberapa kolom profil terlalu panjang.' }, { status:400 });
    changes[key] = value || null;
  }
  if (typeof input.type === 'string') {
    if (!types.includes(input.type)) return Response.json({ error:'Jenis organisasi tidak valid.' }, { status:400 });
    changes.type = input.type;
  }
  for (const required of ['name','sector','province','city','pic_name','pic_role','pic_phone']) {
    if (required in changes && !(changes[required] as string)?.trim()) return Response.json({ error:'Nama organisasi, sektor, wilayah, serta identitas PIC wajib diisi.' }, { status:400 });
  }
  if (typeof input.picEmail === 'string' && input.picEmail.trim().toLowerCase() !== auth.profile.email.toLowerCase()) {
    return Response.json({ error:'Email login PIC tidak dapat diganti dari formulir profil. Hubungi admin untuk memperbarui identitas akun.' }, { status:409 });
  }
  const resubmit = input.resubmit === true;
  if (resubmit && auth.orgId) {
    const { data: org, error: orgError } = await auth.db.from('partner_organizations').select('status').eq('id',auth.orgId).eq('user_id',auth.user.id).single();
    if (orgError || !org) return Response.json({ error:'Organisasi tidak ditemukan.' }, { status:404 });
    if (org?.status !== 'revision_required') return Response.json({ error:'Pengajuan ini tidak sedang menunggu revisi.' }, { status:409 });
  }
  if (!Object.keys(changes).length) return Response.json({ error:'Tidak ada perubahan profil.' }, { status:400 });
  const { data: organization, error } = await auth.db.from('partner_organizations').update(changes).eq('id',auth.orgId).eq('user_id',auth.user.id).select('*').single();
  if (error) { console.error('Partner organization update failed:',error.message); return Response.json({ error:'Profil organisasi gagal disimpan.' }, { status:500 }); }
  if (resubmit) {
    const { error: resubmitError } = await auth.db.rpc('resubmit_partner_application', { p_partner_id:auth.orgId, p_user_id:auth.user.id });
    if (resubmitError) {
      console.error('Partner application resubmission failed:',resubmitError.message);
      return Response.json({ error:'Profil tersimpan, tetapi pengajuan gagal dikirim ulang. Silakan coba lagi.' }, { status:409 });
    }
    const refreshed = await auth.db.from('partner_organizations').select('*').eq('id',auth.orgId).single();
    if (refreshed.error) return Response.json({ error:'Pengajuan terkirim, tetapi status profil gagal dimuat ulang.' }, { status:500 });
    return Response.json({ organization:refreshed.data });
  }
  const audit = await auth.db.from('audit_logs').insert({
    id:crypto.randomUUID(),actor_name:auth.profile.name,actor_role:'partner',action:'PARTNER_PROFILE_UPDATED',
    entity_type:'partnership',entity_id:auth.orgId,details:'Mitra memperbarui profil organisasi.',
  });
  if (audit.error) console.error('Partner profile audit log failed:',audit.error.message);
  return Response.json({ organization });
}
