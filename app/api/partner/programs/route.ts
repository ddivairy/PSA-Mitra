import { requirePartnerSession } from '@/lib/supabase/server-partner';
import { isAllowedProgramImage } from '@/lib/program-image';

export const runtime = 'nodejs';

function isValidCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function GET() {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  if (!auth.orgId) {
    return Response.json({ programs: [], applications: [] });
  }

  const { data: programs, error: progError } = await auth.db
    .from('programs')
    .select('*')
    .eq('partner_id', auth.orgId)
    .order('created_at', { ascending: false });

  if (progError) {
    return Response.json({ error: 'Gagal memuat program organisasi.' }, { status: 500 });
  }

  const programIds = (programs || []).map(p => p.id);
  let applications: any[] = [];
  if (programIds.length > 0) {
    const { data: appsData } = await auth.db
      .from('volunteer_applications')
      .select('*')
      .in('program_id', programIds)
      .order('submitted_at', { ascending: false });
    applications = appsData || [];
  }

  return Response.json({ programs, applications });
}

export async function POST(request: Request) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  if (!auth.orgId) {
    return Response.json({ error: 'Organisasi mitra belum tertaut ke akun Anda.' }, { status: 400 });
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Format data proposal tidak valid.' }, { status: 400 });
  }

  const {
    title,
    category,
    summary,
    description,
    objectives,
    format,
    province,
    city,
    address,
    startDate,
    endDate,
    schedule,
    targetQuota,
    requirements,
    accessibilityInfo,
    deadline,
    picName,
    picContact,
    image,
  } = body;
  if (body.saveAs !== undefined && !['draft', 'submitted'].includes(body.saveAs)) return Response.json({ error: 'Tujuan penyimpanan proposal tidak valid.' }, { status: 400 });
  const proposalStatus = body.saveAs === 'draft' ? 'draft' : 'submitted';

  if (typeof title !== 'string' || !title.trim() || typeof category !== 'string' || !['Pendidikan', 'Lingkungan', 'Kesehatan', 'Pemberdayaan Masyarakat', 'Teknologi & Digital'].includes(category) || typeof summary !== 'string' || !summary.trim() || typeof description !== 'string' || !description.trim() || !isValidCalendarDate(startDate) || !isValidCalendarDate(deadline) || typeof schedule !== 'string' || !schedule.trim()) {
    return Response.json({ error: 'Lengkapi semua kolom wajib proposal program.' }, { status: 400 });
  }
  if (title.length > 200 || summary.length > 1500 || description.length > 12000 || schedule.length > 2000 || (typeof picName === 'string' && picName.length > 200) || (typeof picContact === 'string' && picContact.length > 300)) return Response.json({ error: 'Beberapa kolom proposal melebihi batas panjang.' }, { status: 400 });
  if (!['offline', 'online', 'hybrid'].includes(format) || (Array.isArray(objectives) && (objectives.length > 30 || objectives.some(value => typeof value !== 'string' || value.length > 500))) || (Array.isArray(requirements) && (requirements.length > 50 || requirements.some(value => typeof value !== 'string' || value.length > 500)))) return Response.json({ error: 'Format atau daftar tujuan/persyaratan tidak valid.' }, { status: 400 });
  if (!isAllowedProgramImage(image, auth.orgId)) return Response.json({ error: 'Gambar harus berasal dari aset PSA atau unggahan organisasi Anda.' }, { status: 400 });
  if (endDate && !isValidCalendarDate(endDate)) return Response.json({ error: 'Tanggal akhir program tidak valid.' }, { status: 400 });
  const effectiveEndDate = isValidCalendarDate(endDate) ? endDate : startDate;
  if (startDate > effectiveEndDate || deadline > startDate || deadline < new Date().toISOString().slice(0, 10)) return Response.json({ error: 'Tanggal kegiatan harus berurutan dan batas pendaftaran harus hari ini atau setelahnya, sebelum kegiatan dimulai.' }, { status: 400 });
  if (!Number.isInteger(Number(targetQuota)) || Number(targetQuota) < 0 || Number(targetQuota) > 100000) return Response.json({ error: 'Kuota program tidak valid.' }, { status: 400 });

  const newProgId = crypto.randomUUID();
  const programRecord = {
    id: newProgId,
    partner_id: auth.orgId,
    partner_name: auth.orgName || 'Mitra PSA',
    title: title.trim(),
    category,
    summary: summary.trim(),
    description: description.trim(),
    objectives: Array.isArray(objectives) ? objectives : [],
    format: format || 'offline',
    province: province || null,
    city: city || null,
    address: address || null,
    start_date: startDate,
    end_date: effectiveEndDate,
    schedule: schedule.trim(),
    target_quota: Number(targetQuota) || 0,
    enrolled_count: 0,
    requirements: Array.isArray(requirements) ? requirements : [],
    accessibility_info: accessibilityInfo || null,
    deadline,
    pic_name: picName?.trim() || auth.profile.name,
    pic_contact: picContact?.trim() || auth.profile.email,
    proposal_status: proposalStatus,
    published_status: 'draft',
    image: image || '/images/program_youth_mentoring_1791874040738.jpg',
  };

  const { data: program, error: insertError } = await auth.db
    .from('programs')
    .insert(programRecord)
    .select('*')
    .single();

  if (insertError) {
    console.error('Error inserting program proposal:', insertError);
    return Response.json({ error: 'Gagal menyimpan proposal program ke database.' }, { status: 500 });
  }

  // Record audit log
  await auth.db.from('audit_logs').insert({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor_name: auth.profile.name || auth.user.email || 'Mitra',
    actor_role: 'partner',
    action: proposalStatus === 'draft' ? 'PROPOSAL_DRAFT_SAVED' : 'PROPOSAL_SUBMITTED',
    entity_type: 'proposal',
    entity_id: newProgId,
    details: proposalStatus === 'draft' ? `Mitra ${auth.orgName} menyimpan draf program: ${title}` : `Mitra ${auth.orgName} mengajukan proposal program: ${title}`,
  });

  // Notify admin
  const { data: adminUsers } = proposalStatus === 'submitted'
    ? await auth.db.from('users').select('id').eq('role', 'admin').limit(1)
    : { data: [] as { id: string }[] };
  if (proposalStatus === 'submitted' && adminUsers && adminUsers[0]) {
    await auth.db.from('notifications').insert({
      id: crypto.randomUUID(),
      recipient_user_id: adminUsers[0].id,
      title: 'Proposal Program Baru',
      message: `Mitra "${auth.orgName}" telah mengajukan proposal program baru: "${title}".`,
      link_type: 'proposal',
      read: false,
    });
  }

  return Response.json({ success: true, program }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePartnerSession();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let body: Record<string, any>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Format perubahan proposal tidak valid.' }, { status: 400 }); }
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id || !auth.orgId) return Response.json({ error: 'Proposal tidak ditemukan.' }, { status: 404 });
  const { data: existing, error: readError } = await auth.db.from('programs').select('id,proposal_status').eq('id', id).eq('partner_id', auth.orgId).maybeSingle();
  if (readError || !existing) return Response.json({ error: 'Proposal tidak ditemukan pada organisasi Anda.' }, { status: 404 });
  if (!['draft', 'revision_required'].includes(existing.proposal_status)) return Response.json({ error: 'Proposal hanya dapat diedit saat berstatus draf atau perlu revisi.' }, { status: 409 });
  const { data: current } = await auth.db.from('programs').select('enrolled_count,published_status,partner_name').eq('id', id).single();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const categories = ['Pendidikan', 'Lingkungan', 'Kesehatan', 'Pemberdayaan Masyarakat', 'Teknologi & Digital'];
  const isDate = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  if (!title || !summary || !description || title.length > 200 || summary.length > 1500 || description.length > 12000 || !categories.includes(category) || !isDate(body.startDate) || !isDate(body.deadline) || !isDate(body.endDate) || body.startDate > body.endDate || body.deadline > body.startDate || body.deadline < new Date().toISOString().slice(0, 10) || typeof body.schedule !== 'string' || !body.schedule.trim() || body.schedule.length > 2000 || !Number.isInteger(Number(body.targetQuota)) || Number(body.targetQuota) < Number(current?.enrolled_count || 0) || Number(body.targetQuota) > 100000) return Response.json({ error: 'Lengkapi kolom wajib dan periksa kategori, tanggal, serta kuota proposal.' }, { status: 400 });
  if (!['online', 'offline', 'hybrid'].includes(body.format) || !isAllowedProgramImage(body.image, auth.orgId)) return Response.json({ error: 'Format atau gambar program tidak valid.' }, { status: 400 });
  if ((Array.isArray(body.objectives) && (body.objectives.length > 30 || body.objectives.some(value => typeof value !== 'string' || value.length > 500))) || (Array.isArray(body.requirements) && (body.requirements.length > 50 || body.requirements.some(value => typeof value !== 'string' || value.length > 500)))) return Response.json({ error: 'Daftar tujuan atau persyaratan terlalu panjang.' }, { status: 400 });
  if (body.saveAs !== undefined && !['draft', 'submitted'].includes(body.saveAs)) return Response.json({ error: 'Tujuan penyimpanan proposal tidak valid.' }, { status: 400 });
  const submit = body.saveAs !== 'draft';
  const changes = {
    title, category, summary, description, objectives: Array.isArray(body.objectives) ? body.objectives : [],
    format: ['online', 'offline', 'hybrid'].includes(body.format) ? body.format : 'offline',
    province: body.province || null, city: body.city || null, address: body.address || null,
    start_date: body.startDate, end_date: body.endDate, schedule: body.schedule.trim(), target_quota: Number(body.targetQuota),
    requirements: Array.isArray(body.requirements) ? body.requirements : [], accessibility_info: body.accessibilityInfo || null,
    deadline: body.deadline, pic_name: typeof body.picName === 'string' ? body.picName.trim() : auth.profile.name,
    pic_contact: typeof body.picContact === 'string' ? body.picContact.trim() : auth.profile.email,
    image: body.image,
    proposal_status: submit ? 'submitted' : existing.proposal_status,
    review_notes: submit && existing.proposal_status === 'revision_required' ? null : undefined,
  };
  const { data: program, error } = await auth.db.from('programs').update(changes).eq('id', id).eq('partner_id', auth.orgId).in('proposal_status', ['draft', 'revision_required']).select('*').maybeSingle();
  if (error) return Response.json({ error: 'Perubahan proposal gagal disimpan.' }, { status: 500 });
  if (!program) return Response.json({ error: 'Status proposal berubah. Muat ulang halaman sebelum mengedit.' }, { status: 409 });
  const audit = await auth.db.from('audit_logs').insert({ id: crypto.randomUUID(), actor_name: auth.profile.name, actor_role: 'partner', action: submit ? 'PROPOSAL_RESUBMITTED' : 'PROPOSAL_DRAFT_UPDATED', entity_type: 'proposal', entity_id: id, details: submit ? `Mitra mengirim ulang proposal ${title} untuk review.` : `Mitra menyimpan perubahan draf ${title}.` });
  if (audit.error) console.error('Failed to write proposal edit audit log:', audit.error.message);
  if (submit) {
    const { data: admins } = await auth.db.from('users').select('id').eq('role', 'admin').limit(1);
    if (admins?.[0]) await auth.db.from('notifications').insert({ id: crypto.randomUUID(), recipient_user_id: admins[0].id, title: 'Proposal Program Dikirim Ulang', message: `Mitra ${current?.partner_name || auth.orgName} mengirim ulang proposal: "${title}".`, link_type: 'proposal', read: false });
  }
  return Response.json({ success: true, program });
}
