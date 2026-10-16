import { requirePsaAdmin } from '@/lib/supabase/server-admin';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requirePsaAdmin();
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const names = ['users', 'partner_organizations', 'programs', 'volunteer_applications', 'audit_logs', 'notifications'] as const;
  const results = await Promise.all([
    auth.db.from('users').select('*').order('created_at', { ascending: false }),
    auth.db.from('partner_organizations').select('*').order('created_at', { ascending: false }),
    auth.db.from('programs').select('*').order('created_at', { ascending: false }),
    auth.db.from('volunteer_applications').select('*').order('submitted_at', { ascending: false }),
    auth.db.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500),
    auth.db.from('notifications').select('*').order('timestamp', { ascending: false }).limit(500),
  ]);
  const failed = results.flatMap((result, index) => result.error ? [names[index]] : []);
  if (failed.length) {
    return Response.json({ error: `Gagal memuat data Supabase: ${failed.join(', ')}. Pastikan migrasi database sudah diterapkan.` }, { status: 503 });
  }

  const [users, partners, programs, applications, auditLogs, notifications] = results.map(result => result.data || []);
  return Response.json({
    users: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', role: u.role, avatar: u.avatar || undefined, verified: Boolean(u.verified), orgId: u.org_id || undefined })),
    partners: partners.map((p: any) => ({ id: p.id, userId: p.user_id, name: p.name, type: p.type, sector: p.sector, description: p.description || '', website: p.website || undefined, address: p.address || '', province: p.province, city: p.city, picName: p.pic_name, picRole: p.pic_role, picPhone: p.pic_phone, picEmail: p.pic_email, collaborationReason: p.collaboration_reason || '', collaborationFocus: p.collaboration_focus || [], collaborationObjective: p.collaboration_objective || '', targetImpact: p.target_impact || '', offeredContribution: p.offered_contribution || '', collaborationPeriod: p.collaboration_period || '', documents: [], status: p.status, reviewNotes: p.review_notes || undefined, history: p.history || [], createdAt: p.created_at })),
    programs: programs.map((p: any) => ({ id: p.id, partnerId: p.partner_id, partnerName: p.partner_name, title: p.title, category: p.category, summary: p.summary, description: p.description, objectives: p.objectives || [], format: p.format, province: p.province || undefined, city: p.city || undefined, address: p.address || undefined, startDate: p.start_date, endDate: p.end_date, schedule: p.schedule, targetQuota: p.target_quota, enrolledCount: p.enrolled_count, requirements: p.requirements || [], accessibilityInfo: p.accessibility_info || undefined, deadline: p.deadline, picName: p.pic_name, picContact: p.pic_contact, proposalStatus: p.proposal_status, publishedStatus: p.published_status, image: p.image, createdAt: p.created_at, reviewNotes: p.review_notes || undefined })),
    applications: applications.map((a: any) => ({ id: a.id, programId: a.program_id, programTitle: a.program_title, partnerName: a.partner_name, volunteerId: a.volunteer_id, volunteerName: a.volunteer_name, volunteerEmail: a.volunteer_email, volunteerPhone: a.volunteer_phone, volunteerGender: a.volunteer_gender || undefined, volunteerCity: a.volunteer_city, volunteerProvince: a.volunteer_province || undefined, motivation: a.motivation, answers: a.answers || {}, status: a.status, submittedAt: a.submitted_at, reviewNotes: a.review_notes || undefined, history: a.history || [] })),
    auditLogs: auditLogs.map((l: any) => ({ id: l.id, timestamp: l.timestamp, actorName: l.actor_name, actorRole: l.actor_role, action: l.action, entityType: l.entity_type, entityId: l.entity_id, details: l.details })),
    notifications: notifications.map((n: any) => ({ id: n.id, recipientUserId: n.recipient_user_id, title: n.title, message: n.message, timestamp: n.timestamp, read: Boolean(n.read), linkType: n.link_type || undefined })),
  });
}
