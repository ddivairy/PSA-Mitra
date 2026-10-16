import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  FolderGit2, 
  Clock, 
  CheckCircle2, 
  Plus,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { CreateProposalModal } from './CreateProposalModal';
import { InteractiveCalendarWidget } from '../dashboard/InteractiveCalendarWidget';
import { AnalyticsOverviewWidget, AnalyticsGaugeItem } from '../dashboard/AnalyticsOverviewWidget';
import { NotificationsPanelWidget, NoticeItem } from '../dashboard/NotificationsPanelWidget';
import { AssignmentsTrackerWidget, AssignmentProgressItem } from '../dashboard/AssignmentsTrackerWidget';
import { TodayTasksWidget, TodayTaskItem } from '../dashboard/TodayTasksWidget';
import { HighlightActionCard } from '../dashboard/HighlightActionCard';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';

interface PartnerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onNavigate }) => {
  const { partners, programs, applications, currentUser } = useApp();
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const currentOrg = partners.find(p => p.id === currentUser?.orgId) || partners[0];
  const orgPrograms = programs.filter(p => p.partnerId === currentOrg?.id);
  const orgProgramIds = orgPrograms.map(p => p.id);
  const orgParticipants = applications.filter(a => orgProgramIds.includes(a.programId));

  const isApprovedPartner = currentOrg?.status === 'approved';

  const partnerTasks: TodayTaskItem[] = [
    {
      id: 'pt-1',
      title: 'Verifikasi 8 Pendaftar Program Muara Gembong',
      meta: 'Batas: 15:00 WIB · Data Relawan',
      assigneeInitial: 'B',
      isUrgent: true,
      isCompleted: false,
    },
    {
      id: 'pt-2',
      title: 'Kirim Modul Briefing Lapangan ke Relawan',
      meta: 'Batas: 17:00 WIB · Koordinasi Program',
      assigneeInitial: 'S',
      isUrgent: false,
      isCompleted: true,
    },
    {
      id: 'pt-3',
      title: 'Finalisasi Berita Acara Pelaksanaan Kegiatan',
      meta: 'Batas: Besok 11:00 WIB · Laporan Kemitraan',
      assigneeInitial: 'H',
      isUrgent: false,
      isCompleted: false,
    },
  ];

  const partnerProgress: AssignmentProgressItem[] = [
    {
      id: 'pp-1',
      title: 'Target Kuota Relawan Restorasi Mangrove',
      progress: 75,
      isCoral: false,
    },
    {
      id: 'pp-2',
      title: 'Pelaksanaan Program Kakak Asuh Literasi',
      progress: 45,
      isCoral: true,
    },
    {
      id: 'pp-3',
      title: 'Penyusunan Laporan Dampak Sosial',
      progress: 82,
      isCoral: false,
    },
  ];

  const partnerGauges: AnalyticsGaugeItem[] = [
    {
      id: 'pg-1',
      label: 'Target Kuota',
      percentage: 82,
      isCoral: false,
    },
    {
      id: 'pg-2',
      label: 'Seleksi Terpenuhi',
      percentage: 68,
      isCoral: true,
    },
  ];

  const partnerNotices: NoticeItem[] = [
    {
      id: 'pn-1',
      title: 'Status Kemitraan: Aktif & Terverifikasi',
      description: 'Organisasi Anda berhak mengajukan hingga 5 proposal program kolaborasi aktif.',
      timeBadge: 'Hari ini',
    },
    {
      id: 'pn-2',
      title: '12 Relawan baru mendaftar hari ini',
      description: 'Pelamar baru menunggu peninjauan pada dashboard data relawan.',
      timeBadge: '2 jam',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Intro Header */}
      <WorkspaceIntroHeader
        eyebrow="PORTAL MITRA"
        title={currentOrg?.name || 'Organisasi Mitra PSA'}
        description={`PIC Resmi: ${currentOrg?.picName || currentUser?.name || 'Admin'} (${currentOrg?.picRole || 'Koordinator Kemitraan'}) · Sektor ${currentOrg?.sector || 'Sosial'}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('part-organization')}
              className="steel-button"
            >
              Profil Organisasi
            </button>
            {isApprovedPartner && (
              <button
                type="button"
                onClick={() => setIsProposalModalOpen(true)}
                className="navy-button"
              >
                + Ajukan Program Baru
              </button>
            )}
          </div>
        }
      />
      {/* Partnership Status Alert Banner */}
      {currentOrg && (
        <div>
          {currentOrg.status === 'approved' ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Kemitraan Organisasi Terverifikasi PSA</p>
                  <p className="text-xs text-emerald-700">Organisasi Anda telah disetujui penuh untuk mempublikasikan inisiatif sosial dan menerima aplikasi relawan.</p>
                </div>
              </div>
              <StatusBadge status="approved" size="sm" />
            </div>
          ) : (
            <div className="p-4 bg-[#5C80B6]/5 border border-[#5C80B6]/20 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#5C80B6] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0B2238]">Pengajuan Kemitraan Dalam Tahap Review</p>
                  <p className="text-xs text-[#5C80B6]">Tim admin PSA sedang memeriksa kelengkapan dokumen organisasi Anda (SLA estimasi 1-2 hari kerja).</p>
                </div>
              </div>
              <StatusBadge status={currentOrg.status} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* 3 Modular Feature Highlights Grid (from style.html) */}

      {/* Main 2-Column Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column (Minmax 1.6fr) */}
        <div className="stack">
          {/* Progress across partner projects */}
          <AssignmentsTrackerWidget
            title="Linimasa & Progres Program"
            subtitle="Pemenuhan kuota relawan dan capaian implementasi lapangan"
            timeframeBadge="Q4 2026"
            items={partnerProgress}
          />

          {/* Today's Tasks */}
          <TodayTasksWidget
            title="Agenda Koordinasi & Tugas Hari Ini"
            initialTasks={partnerTasks}
            timeframeBadge="Hari Ini"
          />

          {/* Program Kolaborasi Aktif Milik Mitra */}
          <section className="card panel" aria-labelledby="partner-programs-heading">
            <div className="panel-head">
              <div>
                <h2 id="partner-programs-heading" className="text-base font-extrabold text-[#0F172A]">
                  Daftar Program Kolaborasi Organisasi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {orgPrograms.length} program terdaftar di platform PSA
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('part-programs')}
                className="text-button"
              >
                Kelola program &rarr;
              </button>
            </div>

            {orgPrograms.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                Belum ada program yang diajukan. Klik tombol di atas untuk mengajukan proposal pertama Anda.
              </div>
            ) : (
              <div className="space-y-3">
                {orgPrograms.map((prg) => {
                  const applicantsCount = applications.filter(a => a.programId === prg.id).length;
                  return (
                    <div
                      key={prg.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0F172A]">{prg.title}</span>
                          <StatusBadge status={prg.proposalStatus} size="sm" />
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Kategori: <strong className="text-[#0F172A]">{prg.category}</strong> · Lokasi: {prg.city} · Mulai: {prg.startDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {applicantsCount} / {prg.targetQuota} Relawan
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate('part-participants')}
                          className="px-3 py-1.5 text-xs font-bold text-[#5C80B6] hover:text-[#0B2238] border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer bg-white"
                        >
                          Lihat Peserta
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Stack) */}
        <div className="stack">
          {/* Notifications Panel */}
          <NotificationsPanelWidget
            initialNotices={partnerNotices}
            onNoticeClick={() => onNavigate('part-participants')}
          />

          {/* Monthly Interactive Calendar */}
          <InteractiveCalendarWidget />

          {/* Circular Analytics Overview */}
          <AnalyticsOverviewWidget
            title="Efektivitas Perekrutan Relawan"
            items={partnerGauges}
          />

          {/* Premium Callout Card */}
          <HighlightActionCard
            eyebrow="LEBIH BANYAK DAMPAK"
            title="Kolaborasi Berkelanjutan PSA"
            description="Dapatkan akses prioritas ke ribuan relawan terverifikasi di 34 provinsi dengan proposal terstandarisasi."
            buttonText="Pelajari Panduan Mitra"
            onButtonClick={() => onNavigate('part-organization')}
          />
        </div>
      </div>

      {/* Modal Buat Proposal Program */}
      <CreateProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={() => setIsProposalModalOpen(false)}
      />
    </div>
  );
};
