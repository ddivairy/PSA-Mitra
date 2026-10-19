'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { VolunteerApplication, ApplicationStatus } from '../../types';

export const PartnerParticipantsList: React.FC = () => {
  const { applications, programs, partners, currentUser, reviewVolunteerApplication } = useApp();

  const currentOrg = partners.find(p => p.id === currentUser?.orgId) || partners[0];
  const orgPrograms = programs.filter(p => p.partnerId === currentOrg?.id);
  const orgProgramIds = orgPrograms.map(p => p.id);

  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeApplicationGroup, setActiveApplicationGroup] = useState<'pending' | 'accepted' | 'rejected' | 'withdrawn'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected app for review modal
  const [reviewingApp, setReviewingApp] = useState<VolunteerApplication | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      // Must belong to this partner's programs
      if (!orgProgramIds.includes(a.programId)) return false;

      // Program filter
      if (selectedProgramId !== 'all' && a.programId !== selectedProgramId) return false;

      // Status filter
      if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const match = a.volunteerName.toLowerCase().includes(q) ||
          a.volunteerEmail.toLowerCase().includes(q) ||
          a.programTitle.toLowerCase().includes(q) ||
          a.volunteerCity.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [applications, orgProgramIds, selectedProgramId, selectedStatus, searchQuery]);

  const pendingApps = filteredApps.filter(app =>
    app.status === 'submitted' || app.status === 'under_review' || app.status === 'waitlisted'
  );
  const acceptedApps = filteredApps.filter(app => app.status === 'accepted');
  const rejectedApps = filteredApps.filter(app => app.status === 'rejected');
  const withdrawnApps = filteredApps.filter(app => app.status === 'withdrawn');
  const visibleApps = {
    pending: pendingApps,
    accepted: acceptedApps,
    rejected: rejectedApps,
    withdrawn: withdrawnApps,
  }[activeApplicationGroup];
  const applicationGroups: { id: typeof activeApplicationGroup; label: string; count: number }[] = [
    { id: 'pending', label: 'Belum diterima', count: pendingApps.length },
    { id: 'accepted', label: 'Diterima', count: acceptedApps.length },
    { id: 'rejected', label: 'Ditolak', count: rejectedApps.length },
    { id: 'withdrawn', label: 'Mengundurkan diri', count: withdrawnApps.length },
  ];

  const handleDecision = (decision: ApplicationStatus) => {
    if (!reviewingApp) return;
    reviewVolunteerApplication(reviewingApp.id, decision, decisionNotes);
    setReviewingApp(null);
    setDecisionNotes('');
  };

  const handleExportCSV = () => {
    if (filteredApps.length === 0) {
      alert('Tidak ada data peserta untuk diekspor.');
      return;
    }
    const headers = ['ID Aplikasi', 'Nama Relawan', 'Email', 'Telepon', 'Kota', 'Gender', 'Program', 'Status', 'Tanggal Daftar'];
    const rows = filteredApps.map(a => [
      a.id,
      `"${a.volunteerName}"`,
      a.volunteerEmail,
      a.volunteerPhone,
      `"${a.volunteerCity}"`,
      a.volunteerGender || '-',
      `"${a.programTitle}"`,
      a.status,
      a.submittedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta_relawan_${currentOrg?.name.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8 space-y-6">
      {/* Filter and search bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama relawan, email, atau domisili..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={selectedProgramId}
          onChange={(e) => setSelectedProgramId(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Program ({orgPrograms.length})</option>
          {orgPrograms.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setSelectedStatus(nextStatus);
            if (nextStatus === 'all') setActiveApplicationGroup('pending');
            else if (nextStatus === 'accepted') setActiveApplicationGroup('accepted');
            else if (nextStatus === 'rejected') setActiveApplicationGroup('rejected');
            else if (nextStatus === 'withdrawn') setActiveApplicationGroup('withdrawn');
            else setActiveApplicationGroup('pending');
          }}
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="submitted">Terkirim (Baru)</option>
          <option value="under_review">Sedang Ditinjau</option>
          <option value="accepted">Diterima</option>
          <option value="waitlisted">Daftar Tunggu</option>
          <option value="rejected">Ditolak</option>
          <option value="withdrawn">Mengundurkan diri</option>
        </select>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
        >
          <Download size={14} />
          <span>Ekspor Data (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:grid-cols-4" role="tablist" aria-label="Kelompok status peserta">
        {applicationGroups.map(group => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={activeApplicationGroup === group.id}
            onClick={() => {
              setActiveApplicationGroup(group.id);
              setSelectedStatus('all');
            }}
            className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${
              activeApplicationGroup === group.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {group.label} <span className="ml-1 tabular-nums">({group.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 lg:hidden">
          {visibleApps.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              Tidak ada pendaftar pada kelompok status ini.
            </div>
          ) : (
            visibleApps.map(app => (
              <article key={app.id} className="space-y-3 p-4">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-slate-900">{app.volunteerName}</h3>
                  <p className="break-all text-[11px] text-slate-500">{app.volunteerEmail}</p>
                  <p className="text-[11px] text-slate-400">{app.volunteerPhone}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div className="col-span-2 min-w-0">
                    <dt className="text-slate-500">Program Dilamar</dt>
                    <dd className="mt-0.5 break-words font-medium text-slate-800">{app.programTitle}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-slate-500">Domisili</dt>
                    <dd className="mt-0.5 break-words text-slate-700">{app.volunteerCity || 'Tidak disebutkan'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-slate-500">Tanggal Lamar</dt>
                    <dd className="mt-0.5 break-words font-mono text-[11px] text-slate-600">{app.submittedAt}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="mt-1"><StatusBadge status={app.status} size="sm" /></dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    setReviewingApp(app);
                    setDecisionNotes(app.reviewNotes || '');
                  }}
                  className="w-full rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                >
                  Tinjau &amp; Keputusan
                </button>
              </article>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Nama Relawan</th>
                <th className="px-5 py-3">Program Dilamar</th>
                <th className="px-5 py-3">Domisili</th>
                <th className="px-5 py-3">Tanggal Lamar</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada pendaftar pada kelompok status ini.
                  </td>
                </tr>
              ) : (
                visibleApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{app.volunteerName}</div>
                      <div className="text-[11px] text-slate-400">{app.volunteerEmail} · {app.volunteerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <span className="font-medium text-slate-800 line-clamp-1">{app.programTitle}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.volunteerCity}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {app.submittedAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setReviewingApp(app);
                          setDecisionNotes(app.reviewNotes || '');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Tinjau &amp; Keputusan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Decision Modal */}
      {reviewingApp && (
        <Modal
          isOpen={!!reviewingApp}
          onClose={() => setReviewingApp(null)}
          title={`Tinjau Pendaftar: ${reviewingApp.volunteerName}`}
          subtitle={`Program: ${reviewingApp.programTitle}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Applicant details strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-semibold text-slate-900">{reviewingApp.volunteerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">No. Telepon / WA</span>
                <span className="font-semibold text-slate-900">{reviewingApp.volunteerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Kota Domisili</span>
                <span className="font-semibold text-slate-900">{reviewingApp.volunteerCity}</span>
              </div>
            </div>

            {/* Motivation statement */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800">Motivasi &amp; Pernyataan Pendaftar:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 italic leading-relaxed">
                "{reviewingApp.motivation}"
              </p>
            </div>

            {/* Additional answers if any */}
            {reviewingApp.answers && Object.keys(reviewingApp.answers).length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Jawaban Tambahan:</span>
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  {Object.entries(reviewingApp.answers).map(([q, a]) => (
                    <div key={q}>
                      <span className="text-slate-500 font-medium">{q}: </span>
                      <span className="text-slate-800">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision note input */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800">
                Catatan Keputusan untuk Peserta (Opsional):
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Contoh: Selamat bergabung di tim lapangan / Jadwal briefing akan dikirimkan via WA grup..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Decision action buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReviewingApp(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('waitlisted')}
                className="px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Daftar Tunggu</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('accepted')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Terima Relawan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
