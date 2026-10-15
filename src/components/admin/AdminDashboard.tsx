'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  FolderGit2, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { InteractiveCalendarWidget } from '../dashboard/InteractiveCalendarWidget';
import { AnalyticsOverviewWidget } from '../dashboard/AnalyticsOverviewWidget';
import { NotificationsPanelWidget } from '../dashboard/NotificationsPanelWidget';
import { AssignmentsTrackerWidget } from '../dashboard/AssignmentsTrackerWidget';
import { TodayTasksWidget, TodayTaskItem } from '../dashboard/TodayTasksWidget';
import { HighlightActionCard } from '../dashboard/HighlightActionCard';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { partners, programs, applications, reviewPartnership, reviewProgramProposal } = useApp();

  const pendingPartnerships = partners.filter(p => p.status === 'submitted' || p.status === 'under_review');
  const pendingProposals = programs.filter(p => p.proposalStatus === 'submitted' || p.proposalStatus === 'under_review');
  const approvedPartners = partners.filter(p => p.status === 'approved');
  const totalVolunteers = applications.length;

  const adminTasks: TodayTaskItem[] = [
    {
      id: 'at-1',
      title: 'Validasi Berkas Legalitas Yayasan Lentera Nusantara',
      meta: 'Batas: 14:00 WIB · Kemitraan Organisasi',
      assigneeInitial: 'D',
      isUrgent: true,
      isCompleted: false,
    },
    {
      id: 'at-2',
      title: 'Verifikasi 15 Pendaftar Relawan Restorasi Mangrove',
      meta: 'Batas: 16:30 WIB · Seleksi Relawan',
      assigneeInitial: 'A',
      isUrgent: false,
      isCompleted: true,
    },
    {
      id: 'at-3',
      title: 'Kaji Ulang Anggaran Proposal Kakak Asuh Literasi',
      meta: 'Batas: Besok 10:00 WIB · Proposal Program',
      assigneeInitial: 'S',
      isUrgent: false,
      isCompleted: false,
    },
  ];

  const assignmentProgress = [
    {
      id: 'ap-1',
      title: 'Target Verifikasi Mitra Q4',
      progress: 85,
      isCoral: false,
    },
    {
      id: 'ap-2',
      title: 'Penyelesaian Seleksi Relawan',
      progress: 62,
      isCoral: true,
    },
    {
      id: 'ap-3',
      title: 'Audit Kepatuhan Berkas MoA',
      progress: 94,
      isCoral: false,
    },
  ];

  const analyticsGauges = [
    {
      id: 'g-1',
      label: 'Kemitraan Lolos',
      percentage: 88,
      isCoral: false,
    },
    {
      id: 'g-2',
      label: 'Relawan Terpilih',
      percentage: 65,
      isCoral: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Intro Section */}
      <WorkspaceIntroHeader
        eyebrow="ADMINISTRASI PSA"
        title="Dashboard Pengawasan & Tata Kelola PSA"
        description="Pusat kendali verifikasi organisasi mitra, evaluasi proposal kolaborasi, dan pengawasan operasional relawan Indonesia."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('admin-analytics')}
              className="steel-button"
            >
              Analitik Wilayah
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin-audit')}
              className="navy-button"
            >
              Audit Trail
            </button>
          </div>
        }
      />

      {/* 3 Modular Feature Highlight Cards (from style.html) */}

      {/* Main 2-Column Dashboard Grid (style.html) */}
      <div className="dashboard-grid">
        {/* Left Column (Minmax 1.6fr) */}
        <div className="stack">
          {/* Assignments / Tasks Progress Tracker */}
          <AssignmentsTrackerWidget
            title="Indikator Kinerja & Verifikasi"
            subtitle="Capaian target SLA persetujuan berkas dan pemrosesan seleksi"
            timeframeBadge="Oktober 2026"
            items={assignmentProgress}
          />

          {/* Today's Tasks List */}
          <TodayTasksWidget
            title="Antrean Tugas Prioritas Hari Ini"
            initialTasks={adminTasks}
            timeframeBadge="Hari Ini"
          />

          {/* Antrean Verifikasi Kemitraan Baru */}
          <section className="card panel" aria-labelledby="partnerships-queue-heading">
            <div className="panel-head">
              <div>
                <h2 id="partnerships-queue-heading" className="text-base font-extrabold text-[#0F172A]">
                  Antrean Mitra Menunggu Verifikasi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {pendingPartnerships.length} organisasi memerlukan keputusan verifikasi legalitas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-partnerships')}
                className="text-button"
              >
                Lihat semua &rarr;
              </button>
            </div>

            {pendingPartnerships.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#64748B]">
                Tidak ada antrean verifikasi mitra yang tertunda.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPartnerships.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0F172A]">{p.name}</span>
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Sektor: <strong className="text-[#0F172A]">{p.sector}</strong> · PIC: {p.picName} ({p.picPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => reviewPartnership(p.id, 'approved', 'Dokumen legalitas diverifikasi lengkap oleh PSA')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewPartnership(p.id, 'revision_required', 'Mohon lengkapi lampiran akta pendirian terbaru')}
                        className="px-3 py-1.5 text-xs font-bold text-[#42699e] hover:bg-[#5C80B6]/10 border border-[#5C80B6]/30 rounded-xl transition-colors cursor-pointer"
                      >
                        Minta Revisi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Antrean Proposal Program Kolaborasi */}
          <section className="card panel" aria-labelledby="proposals-queue-heading">
            <div className="panel-head">
              <div>
                <h2 id="proposals-queue-heading" className="text-base font-extrabold text-[#0F172A]">
                  Review Proposal Program Kolaborasi
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {pendingProposals.length} proposal menanti evaluasi kelayakan program
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-proposals')}
                className="text-button"
              >
                Lihat semua &rarr;
              </button>
            </div>

            {pendingProposals.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#64748B]">
                Tidak ada proposal program yang menunggu evaluasi.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProposals.slice(0, 3).map((prg) => (
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
                        Mitra: <strong className="text-[#0F172A]">{prg.partnerName}</strong> · Lokasi: {prg.city}, {prg.province}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => reviewProgramProposal(prg.id, 'approved', 'Proposal disetujui untuk dipublikasikan ke relawan')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Setujui Proposal
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewProgramProposal(prg.id, 'revision_required', 'Mohon sesuaikan rincian anggaran dan kuota relawan')}
                        className="px-3 py-1.5 text-xs font-bold text-[#42699e] bg-[#5C80B6]/5 hover:bg-[#5C80B6]/10 border border-[#5C80B6]/20 rounded-xl transition-colors cursor-pointer"
                      >
                        Catatan Revisi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Stack of Widgets: Notifications, Calendar, Analytics, Premium Callout) */}
        <div className="stack">
          {/* Notifications Panel */}
          <NotificationsPanelWidget
            onNoticeClick={() => onNavigate('admin-partnerships')}
          />

          {/* Monthly Interactive Calendar */}
          <InteractiveCalendarWidget />

          {/* Circular Analytics Overview */}
          <AnalyticsOverviewWidget
            title="Efektivitas Seleksi & Tata Kelola"
            items={analyticsGauges}
          />

          {/* Premium Callout Card */}
          <HighlightActionCard
            eyebrow="TATA KELOLA TERPERCAYA"
            title="Audit Kepatuhan & Keamanan Data"
            description="Seluruh aksi verifikasi dilindungi standar audit trail PSA dan tersimpan aman di basis data terverifikasi."
            buttonText="Buka Log Aktivitas"
            onButtonClick={() => onNavigate('admin-users-activity')}
          />
        </div>
      </div>
    </div>
  );
};
