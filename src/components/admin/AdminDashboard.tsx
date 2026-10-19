'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { AssignmentsTrackerWidget, AssignmentProgressItem } from '../dashboard/AssignmentsTrackerWidget';
import { AnalyticsOverviewWidget, AnalyticsGaugeItem } from '../dashboard/AnalyticsOverviewWidget';
import { NotificationsPanelWidget, NoticeItem } from '../dashboard/NotificationsPanelWidget';
import { InteractiveCalendarWidget } from '../dashboard/InteractiveCalendarWidget';
import { HighlightActionCard } from '../dashboard/HighlightActionCard';
import { TodayTasksWidget, TodayTaskItem } from '../dashboard/TodayTasksWidget';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    partners,
    programs,
    applications,
    notifications,
    currentUser,
    reviewProgramProposal,
  } = useApp();

  const pendingPartnerships = partners.filter(partner =>
    ['submitted', 'under_review', 'revision_required'].includes(partner.status)
  );
  const pendingProposals = programs.filter(program =>
    ['submitted', 'under_review', 'revision_required'].includes(program.proposalStatus)
  );
  const pendingApplications = applications.filter(application =>
    ['submitted', 'under_review'].includes(application.status)
  );
  const approvedPartners = partners.filter(partner => partner.status === 'approved').length;
  const approvedProposals = programs.filter(program => program.proposalStatus === 'approved').length;
  const resolvedApplications = applications.filter(application =>
    ['accepted', 'rejected', 'withdrawn'].includes(application.status)
  ).length;

  const adminTasks: TodayTaskItem[] = [
    {
      id: 'partnership-review',
      title: pendingPartnerships[0]
        ? `Tinjau kemitraan ${pendingPartnerships[0].name}`
        : 'Tinjau antrean kemitraan',
      meta: `${pendingPartnerships.length} organisasi menunggu keputusan · Kemitraan`,
      assigneeInitial: 'A',
      isUrgent: true,
    },
    {
      id: 'application-review',
      title: pendingApplications[0]
        ? `Tinjau pendaftar ${pendingApplications[0].volunteerName}`
        : 'Tinjau pendaftaran relawan',
      meta: `${pendingApplications.length} pendaftar menunggu keputusan · Seleksi relawan`,
      assigneeInitial: 'A',
    },
    {
      id: 'proposal-review',
      title: pendingProposals[0]
        ? `Evaluasi proposal ${pendingProposals[0].title}`
        : 'Evaluasi antrean proposal program',
      meta: `${pendingProposals.length} proposal menunggu evaluasi · Program`,
      assigneeInitial: 'A',
    },
  ];

  const progressItems: AssignmentProgressItem[] = [
    {
      id: 'partner-review',
      title: 'Target Verifikasi Mitra Q4',
      progress: partners.length ? Math.round((approvedPartners / partners.length) * 100) : 0,
    },
    {
      id: 'proposal-review',
      title: 'Penyelesaian Seleksi Relawan',
      progress: applications.length ? Math.round((resolvedApplications / applications.length) * 100) : 0,
      isCoral: true,
    },
    {
      id: 'application-review',
      title: 'Audit Kepatuhan Berkas MoA',
      progress: programs.length ? Math.round((approvedProposals / programs.length) * 100) : 0,
    },
  ];

  const analyticsItems: AnalyticsGaugeItem[] = [
    {
      id: 'partner-approval',
      label: 'Mitra disetujui',
      percentage: partners.length ? Math.round((approvedPartners / partners.length) * 100) : 0,
    },
    {
      id: 'program-approval',
      label: 'Proposal program disetujui',
      percentage: programs.length ? Math.round((approvedProposals / programs.length) * 100) : 0,
      isCoral: true,
    },
  ];

  const adminNotices: NoticeItem[] = notifications
    .filter(notification => notification.recipientUserId === currentUser?.id)
    .slice(0, 5)
    .map(notification => ({
      id: notification.id,
      title: notification.title,
      description: notification.message,
      timeBadge: notification.timestamp,
    }));

  return (
    <div className="space-y-6">
      <WorkspaceIntroHeader
        eyebrow="ADMINISTRASI PSA"
        title="Dashboard Pengawasan & Tata Kelola PSA"
        description="Pusat kendali verifikasi organisasi mitra, evaluasi proposal kolaborasi, dan pengawasan operasional relawan Indonesia."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onNavigate('admin-analytics')} className="steel-button">
              Analitik Wilayah
            </button>
            <button type="button" onClick={() => onNavigate('admin-users-activity')} className="navy-button">
              Audit Trail
            </button>
          </div>
        }
      />

      <div className="dashboard-grid">
        <div className="stack">
          <AssignmentsTrackerWidget
            title="Indikator Kinerja & Verifikasi"
            subtitle="Capaian target SLA persetujuan berkas dan pemrosesan seleksi"
            timeframeBadge="Oktober 2026"
            items={progressItems}
          />

          <TodayTasksWidget
            title="Antrean Tugas Prioritas Hari Ini"
            initialTasks={adminTasks}
            timeframeBadge="Hari Ini"
          />

          <section className="card panel" aria-labelledby="partnerships-queue-heading">
            <div className="panel-head">
              <div>
                <h2 id="partnerships-queue-heading" className="text-base font-extrabold text-[#0F172A]">
                  Antrean Mitra Menunggu Verifikasi
                </h2>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {pendingPartnerships.length} organisasi memerlukan keputusan verifikasi
                </p>
              </div>
              <button type="button" onClick={() => onNavigate('admin-partnerships')} className="text-button">
                Lihat semua &rarr;
              </button>
            </div>

            {pendingPartnerships.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#64748B]">Tidak ada antrean verifikasi mitra.</p>
            ) : (
              <div className="space-y-3">
                {pendingPartnerships.slice(0, 3).map(partner => (
                  <article key={partner.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-sm font-extrabold text-[#0F172A]">{partner.name}</h3>
                          <StatusBadge status={partner.status} size="sm" />
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Sektor: <strong className="text-[#0F172A]">{partner.sector}</strong> · PIC: {partner.picName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('admin-partnerships')}
                        className="shrink-0 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        Tinjau
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card panel" aria-labelledby="proposals-queue-heading">
            <div className="panel-head">
              <div>
                <h2 id="proposals-queue-heading" className="text-base font-extrabold text-[#0F172A]">
                  Review Proposal Program Kolaborasi
                </h2>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {pendingProposals.length} proposal menanti evaluasi kelayakan program
                </p>
              </div>
              <button type="button" onClick={() => onNavigate('admin-proposals')} className="text-button">
                Lihat semua &rarr;
              </button>
            </div>

            {pendingProposals.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#64748B]">Tidak ada proposal program yang menunggu evaluasi.</p>
            ) : (
              <div className="space-y-3">
                {pendingProposals.slice(0, 3).map(program => (
                  <article key={program.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-sm font-extrabold text-[#0F172A]">{program.title}</h3>
                          <StatusBadge status={program.proposalStatus} size="sm" />
                        </div>
                        <p className="text-xs text-[#64748B]">
                          Mitra: <strong className="text-[#0F172A]">{program.partnerName}</strong> · Lokasi: {program.city || program.province || 'Belum dicantumkan'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void reviewProgramProposal(program.id, 'approved', 'Proposal disetujui untuk dipublikasikan ke relawan')}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                        >
                          Setujui Proposal
                        </button>
                        <button
                          type="button"
                          onClick={() => void reviewProgramProposal(program.id, 'revision_required', 'Mohon sesuaikan rincian anggaran dan kuota relawan')}
                          className="rounded-xl border border-[#5C80B6]/20 bg-[#5C80B6]/5 px-3 py-1.5 text-xs font-bold text-[#42699e] transition-colors hover:bg-[#5C80B6]/10"
                        >
                          Catatan Revisi
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>

        <div className="stack">
          <NotificationsPanelWidget
            initialNotices={adminNotices}
            onNoticeClick={notice => {
              const notification = notifications.find(item => item.id === notice.id);
              if (notification?.linkType === 'proposal') onNavigate('admin-proposals');
              else if (notification?.linkType === 'application') onNavigate('admin-applications');
              else onNavigate('admin-partnerships');
            }}
          />
          <InteractiveCalendarWidget />
          <AnalyticsOverviewWidget
            title="Efektivitas Seleksi & Tata Kelola"
            items={analyticsItems}
          />
          <HighlightActionCard
            eyebrow="TATA KELOLA TERPERCAYA"
            title="Audit Kepatuhan & Keamanan Data"
            description="Tinjau jejak aktivitas, verifikasi organisasi, dan keputusan program dalam satu ruang kerja."
            buttonText="Buka Log Aktivitas"
            onButtonClick={() => onNavigate('admin-users-activity')}
          />
        </div>
      </div>
    </div>
  );
};
