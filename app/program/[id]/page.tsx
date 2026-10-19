import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceSupabase } from '@/lib/supabase/server-db';
import { PublicProgramDetail } from '@/src/components/public/PublicProgramDetail';

export const dynamic = 'force-dynamic';

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createServiceSupabase();
  if (!db) return <Unavailable />;

  const { data, error } = await db.from('published_program_directory').select('*').eq('id', id).maybeSingle();
  if (error) return <Unavailable />;
  if (!data) notFound();

  const { data: history, error: historyError } = await db.from('program_status_history')
    .select('status,announcement,created_at').eq('program_id', id).eq('is_public', true)
    .order('created_at', { ascending: false }).limit(50);
  if (historyError) return <Unavailable />;

  const program = {
    id: data.id,
    partnerId: data.partner_id,
    partnerName: data.partner_name,
    title: data.title,
    category: data.category,
    summary: data.summary,
    description: data.description,
    objectives: data.objectives || [],
    format: data.format,
    province: data.province || undefined,
    city: data.city || undefined,
    address: data.address || undefined,
    startDate: data.start_date,
    endDate: data.end_date,
    schedule: data.schedule,
    targetQuota: data.target_quota,
    enrolledCount: data.enrolled_count,
    requirements: data.requirements || [],
    accessibilityInfo: data.accessibility_info || undefined,
    deadline: data.deadline,
    picName: data.pic_name || '',
    picContact: data.pic_contact || '',
    proposalStatus: data.proposal_status,
    publishedStatus: data.published_status,
    image: data.image,
    createdAt: data.created_at,
    executionStatus: data.execution_status || 'planned',
    publicAnnouncement: data.public_announcement || undefined,
    publicTimeline: (history || []).map(event => ({
      status: event.status,
      announcement: event.announcement || undefined,
      createdAt: event.created_at,
    })),
  };

  return <PublicProgramDetail program={program} />;
}

function Unavailable() {
  return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-2xl font-bold text-slate-900">Detail program belum tersedia</h1><p className="mt-3 text-slate-600">Katalog belum dapat dimuat. Silakan coba lagi atau kembali ke daftar program.</p><Link href="/" className="mt-6 inline-flex rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white">Kembali ke PSA</Link></main>;
}
