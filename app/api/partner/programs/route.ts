import { requirePartnerSession } from '@/lib/supabase/server-partner';

export const runtime = 'nodejs';

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

  if (!title?.trim() || !category || !summary?.trim() || !description?.trim() || !startDate || !deadline || !schedule?.trim()) {
    return Response.json({ error: 'Lengkapi semua kolom wajib proposal program.' }, { status: 400 });
  }

  const newProgId = `prog-${Date.now().toString().slice(-6)}`;
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
    end_date: endDate || startDate,
    schedule: schedule.trim(),
    target_quota: Number(targetQuota) || 0,
    enrolled_count: 0,
    requirements: Array.isArray(requirements) ? requirements : [],
    accessibility_info: accessibilityInfo || null,
    deadline,
    pic_name: picName?.trim() || auth.profile.name,
    pic_contact: picContact?.trim() || auth.profile.email,
    proposal_status: 'submitted',
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
    action: 'PROPOSAL_SUBMITTED',
    entity_type: 'proposal',
    entity_id: newProgId,
    details: `Mitra ${auth.orgName} mengajukan proposal program: ${title}`,
  });

  // Notify admin
  const { data: adminUsers } = await auth.db.from('users').select('id').eq('role', 'admin').limit(1);
  if (adminUsers && adminUsers[0]) {
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
