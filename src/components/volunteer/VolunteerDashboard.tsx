import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  UserCheck,
  Search,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Program } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';
import { FeatureHighlightsGrid, FeatureHighlightItem } from '../dashboard/FeatureHighlightsGrid';
import { InteractiveCalendarWidget } from '../dashboard/InteractiveCalendarWidget';
import { AnalyticsOverviewWidget, AnalyticsGaugeItem } from '../dashboard/AnalyticsOverviewWidget';
import { NotificationsPanelWidget, NoticeItem } from '../dashboard/NotificationsPanelWidget';
import { AssignmentsTrackerWidget, AssignmentProgressItem } from '../dashboard/AssignmentsTrackerWidget';
import { TodayTasksWidget, TodayTaskItem } from '../dashboard/TodayTasksWidget';
import { HighlightActionCard } from '../dashboard/HighlightActionCard';

interface VolunteerDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenApply: (program: Program) => void;
  onOpenDetail: (program: Program) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  onNavigate,
  onOpenApply,
  onOpenDetail,
}) => {
  const { volunteerProfile, applications, programs, currentUser } = useApp();

  const userApps = applications.filter(a => {
    if (!currentUser) return true;
    return a.volunteerId === currentUser.id || a.volunteerEmail === currentUser.email;
  });

  const calculateCompleteness = () => {
    let score = 30;
    if (volunteerProfile.fullName) score += 10;
    if (volunteerProfile.city && volunteerProfile.province) score += 20;
    if (volunteerProfile.interests && volunteerProfile.interests.length > 0) score += 15;
    if (volunteerProfile.skills && volunteerProfile.skills.length > 0) score += 15;
    if (volunteerProfile.experience) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  const recommendedPrograms = programs.filter(p => {
    if (p.publishedStatus !== 'published') return false;
    const matchInterest = volunteerProfile.interests.some(i => i.toLowerCase().includes(p.category.toLowerCase()));
    const matchCity = p.city === volunteerProfile.city;
    return matchInterest || matchCity;
  }).slice(0, 2);

  const featureItems: FeatureHighlightItem[] = [
    {
      id: 'vf-1',
      icon: '▦',
      title: 'Eksplorasi Program',
      description: 'Temukan program kerelawanan di bidang pendidikan, lingkungan, kesehatan, dan pemberdayaan.',
      actionText: 'Jelajahi program',
      onAction: () => onNavigate('public-programs'),
    },
    {
      id: 'vf-2',
      icon: '✎',
      title: 'Profil & Portofolio',
      description: 'Perbarui minat keahlian, sertifikat kerelawanan, dan riwayat pengalaman lapangan.',
      actionText: 'Kelola profil',
      onAction: () => onNavigate('vol-profile'),
    },
    {
      id: 'vf-3',
      icon: '◎',
      title: 'Pantau Seleksi Aplikasi',
      description: 'Lihat status evaluasi berkas, jadwal wawancara, dan surat penerimaan program secara real-time.',
      actionText: 'Lihat aplikasi',
      onAction: () => onNavigate('vol-applications'),
    },
  ];

  const volunteerTasks: TodayTaskItem[] = [
    {
      id: 'vt-1',
      title: 'Unduh Surat Komitmen Program Muara Gembong',
      meta: 'Batas: 18:00 WIB · Dokumen Persyaratan',
      assigneeInitial: 'B',
      isUrgent: true,
      isCompleted: false,
    },
    {
      id: 'vt-2',
      title: 'Ikuti Pembekalan Online Relawan Batch 4',
      meta: '19:30 - 21:00 WIB · Zoom Meeting PSA',
      assigneeInitial: 'B',
      isUrgent: false,
      isCompleted: false,
    },
    {
      id: 'vt-3',
      title: 'Lengkapi 2 Minat Keahlian Baru pada Profil',
      meta: 'Selesai · Profil Relawan',
      assigneeInitial: 'B',
      isUrgent: false,
      isCompleted: true,
    },
  ];

  const volunteerProgress: AssignmentProgressItem[] = [
    {
      id: 'vp-1',
      title: 'Progres Seleksi: Restorasi Mangrove',
      progress: 75,
      isCoral: false,
    },
    {
      id: 'vp-2',
      title: 'Progres Seleksi: Kakak Asuh Literasi',
      progress: 40,
      isCoral: true,
    },
    {
      id: 'vp-3',
      title: 'Kelengkapan Portofolio Kerelawanan',
      progress: completeness,
      isCoral: false,
    },
  ];

  const volunteerGauges: AnalyticsGaugeItem[] = [
    {
      id: 'vg-1',
      label: 'Kelengkapan Profil',
      percentage: completeness,
      isCoral: false,
    },
    {
      id: 'vg-2',
      label: 'Kehadiran Program',
      percentage: 95,
      isCoral: true,
    },
  ];

  const volunteerNotices: NoticeItem[] = [
    {
      id: 'vn-1',
      title: 'Aplikasi Anda sedang ditinjau mitra',
      description: 'PT Bumi Lestari Hijau sedang mengevaluasi berkas pendaftaran program Anda.',
      timeBadge: '1 jam',
    },
    {
      id: 'vn-2',
      title: 'Program baru sesuai minat Anda',
      description: 'Tersedia inisiatif literasi di kota domisili Anda yang membutuhkan relawan.',
      timeBadge: '3 jam',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Intro Header */}
      <WorkspaceIntroHeader
        eyebrow="PORTAL RELAWAN"
        title={`Selamat Datang, ${volunteerProfile.fullName || currentUser?.name || 'Relawan PSA'}!`}
        description="Pantau status aplikasi program kerelawanan, lengkapi portofolio keahlian, dan temukan inisiatif berdampak nyata."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('vol-profile')}
              className="steel-button"
            >
              Profil Saya
            </button>
            <button
              type="button"
              onClick={() => onNavigate('public-programs')}
              className="navy-button"
            >
              + Jelajahi Program
            </button>
          </div>
        }
      />

      {/* 3 Modular Feature Highlights Grid (from style.html) */}
      <FeatureHighlightsGrid items={featureItems} />

      {/* Main 2-Column Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column (Minmax 1.6fr) */}
        <div className="stack">
          {/* Volunteer Assignments & Application Progress */}
          <AssignmentsTrackerWidget
            title="Linimasa Tahapan Aplikasi Program"
            subtitle="Status verifikasi berkas dan jadwal konfirmasi penerimaan relawan"
            timeframeBadge="Oktober 2026"
            items={volunteerProgress}
          />

          {/* Today's Tasks */}
          <TodayTasksWidget
            title="Daftar Agenda & Tugas Kerelawanan"
            initialTasks={volunteerTasks}
            timeframeBadge="Hari Ini"
          />

          {/* Aplikasi Program Saya */}
          <section className="card panel" aria-labelledby="vol-apps-heading">
            <div className="panel-head">
              <div>
                <h2 id="vol-apps-heading" className="text-base font-extrabold text-[#0F172A]">
                  Aplikasi Program Terdaftar
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {userApps.length} program telah Anda ajukan
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('vol-applications')}
                className="text-button"
              >
                Lihat semua &rarr;
              </button>
            </div>

            {userApps.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                Anda belum mengajukan aplikasi ke program manapun. Mulai temukan inisiatif yang sesuai minat Anda.
              </div>
            ) : (
              <div className="space-y-3">
                {userApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0F172A]">{app.programTitle}</span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Mitra: <strong className="text-[#0F172A]">{app.partnerName}</strong> · Diajukan pada {app.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigate('vol-applications')}
                        className="px-3 py-1.5 text-xs font-bold text-[#5C80B6] hover:text-[#0B2238] border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer bg-white"
                      >
                        Detail Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Program Rekomendasi Terdekat */}
          {recommendedPrograms.length > 0 && (
            <section className="card panel" aria-labelledby="recommended-heading">
              <div className="panel-head">
                <div>
                  <h2 id="recommended-heading" className="text-base font-extrabold text-[#0F172A]">
                    Rekomendasi Program untuk Anda
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Dipersonalisasi berdasarkan minat dan kota domisili Anda
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('public-programs')}
                  className="text-button"
                >
                  Lihat direktori &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedPrograms.map((prg) => (
                  <div
                    key={prg.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between space-y-3 hover:bg-white hover:border-[#5C80B6]/40 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#5C80B6] uppercase tracking-wider block mb-1">
                        {prg.category}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#0F172A] line-clamp-1">{prg.title}</h4>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{prg.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-[#64748B] flex items-center gap-1">
                        <MapPin size={12} className="text-[#5C80B6]" />
                        {prg.city}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenApply(prg)}
                        className="font-bold text-[#0B2238] hover:text-[#5C80B6] transition-colors"
                      >
                        Daftar &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Stack) */}
        <div className="stack">
          {/* Notifications Panel */}
          <NotificationsPanelWidget
            initialNotices={volunteerNotices}
            onNoticeClick={() => onNavigate('vol-applications')}
          />

          {/* Monthly Interactive Calendar */}
          <InteractiveCalendarWidget />

          {/* Circular Analytics Overview */}
          <AnalyticsOverviewWidget
            title="Statistik Kerelawanan Anda"
            items={volunteerGauges}
          />

          {/* Premium Callout Card */}
          <HighlightActionCard
            eyebrow="RUANG KERELAWANAN"
            title="Lengkapi Portofolio Anda"
            description="Relawan dengan profil terverifikasi lengkap memiliki peluang 3x lebih cepat diterima pada program unggulan PSA."
            buttonText="Perbarui Portofolio"
            onButtonClick={() => onNavigate('vol-profile')}
          />
        </div>
      </div>
    </div>
  );
};
