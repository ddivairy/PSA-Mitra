import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { VolunteerApplication, ApplicationStatus } from '../../types';

const numberFormatter = new Intl.NumberFormat('id-ID');

export const VolunteerApplicationsManagement: React.FC = () => {
  const { applications, programs, reviewVolunteerApplication } = useApp();

  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeApplicationGroup, setActiveApplicationGroup] = useState<'not-accepted' | 'accepted'>('not-accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingApp, setReviewingApp] = useState<VolunteerApplication | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      if (selectedProgramId !== 'all' && a.programId !== selectedProgramId) return false;
      if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
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
  }, [applications, selectedProgramId, selectedStatus, searchQuery]);

  const notAcceptedApps = filteredApps.filter(application => application.status !== 'accepted');
  const acceptedApps = filteredApps.filter(application => application.status === 'accepted');
  const visibleApps = activeApplicationGroup === 'accepted' ? acceptedApps : notAcceptedApps;
  const uniqueApplicants = new Set(applications.map(application => application.volunteerId)).size;

  const handleDecision = (decision: ApplicationStatus) => {
    if (!reviewingApp) return;
    reviewVolunteerApplication(reviewingApp.id, decision, decisionNotes);
    setReviewingApp(null);
    setDecisionNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Peserta</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data pendaftar relawan lintas program dan status seleksinya.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Ringkasan peserta">
        <article className="rounded-xl border border-blue-300 bg-blue-100 p-4">
          <p className="text-xs font-medium text-blue-800">Total pendaftaran</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-blue-900">{numberFormatter.format(applications.length)}</p>
        </article>
        <article className="rounded-xl border border-emerald-300 bg-emerald-100 p-4">
          <p className="text-xs font-medium text-emerald-800">Peserta unik</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{numberFormatter.format(uniqueApplicants)}</p>
        </article>
      </section>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative w-full min-w-0 sm:flex-[2]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama relawan, email, kota..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={selectedProgramId}
          onChange={(e) => setSelectedProgramId(e.target.value)}
          className="w-full min-w-0 text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 sm:flex-[2]"
        >
          <option value="all">Semua Program ({programs.length})</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setSelectedStatus(nextStatus);
            if (nextStatus === 'accepted') setActiveApplicationGroup('accepted');
            else if (nextStatus !== 'all') setActiveApplicationGroup('not-accepted');
          }}
          className="w-full min-w-0 text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 sm:flex-1"
        >
          <option value="all">Semua Status</option>
          <option value="submitted">Terkirim</option>
          <option value="under_review">Sedang Ditinjau</option>
          <option value="accepted">Diterima</option>
          <option value="waitlisted">Daftar Tunggu</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Kelompok status pendaftar">
        <button
          type="button"
          role="tab"
          aria-selected={activeApplicationGroup === 'not-accepted'}
          onClick={() => setActiveApplicationGroup('not-accepted')}
          className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeApplicationGroup === 'not-accepted' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Belum diterima <span className="ml-1 tabular-nums">({notAcceptedApps.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeApplicationGroup === 'accepted'}
          onClick={() => setActiveApplicationGroup('accepted')}
          className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeApplicationGroup === 'accepted' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sudah diterima <span className="ml-1 tabular-nums">({acceptedApps.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 2xl:hidden">
          {visibleApps.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              Tidak ada pendaftar di kelompok ini yang cocok dengan filter.
            </div>
          ) : (
            visibleApps.map((app) => (
              <article key={app.id} className="space-y-3 p-4">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-slate-900">{app.volunteerName}</h3>
                  <p className="break-all text-[11px] text-slate-500">{app.volunteerEmail}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div className="col-span-2 min-w-0">
                    <dt className="text-slate-500">Program &amp; Mitra</dt>
                    <dd className="mt-0.5 break-words font-medium text-slate-800">{app.programTitle}</dd>
                    <dd className="break-words text-[11px] text-slate-500">{app.partnerName}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-slate-500">Domisili</dt>
                    <dd className="mt-0.5 break-words text-slate-700">{app.volunteerCity || 'Tidak disebutkan'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Gender</dt>
                    <dd className="mt-0.5 text-slate-700">
                      {app.volunteerGender === 'male' ? 'Laki-laki' : app.volunteerGender === 'female' ? 'Perempuan' : 'Tidak disebutkan'}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-slate-500">Tanggal Lamar</dt>
                    <dd className="mt-0.5 break-words font-mono text-[11px] text-slate-600">{app.submittedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Status</dt>
                    <dd className="mt-1"><StatusBadge status={app.status} size="sm" /></dd>
                  </div>
                </dl>
                <button
                  onClick={() => {
                    setReviewingApp(app);
                    setDecisionNotes(app.reviewNotes || '');
                  }}
                  className="w-full rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                >
                  Detail &amp; Review
                </button>
              </article>
            ))
          )}
        </div>
        <div className="hidden 2xl:block">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="w-[18%] px-3 py-3">Nama Relawan</th>
                <th className="w-[22%] px-3 py-3">Program &amp; Mitra</th>
                <th className="w-[11%] px-3 py-3">Domisili</th>
                <th className="w-[10%] px-3 py-3">Gender</th>
                <th className="w-[14%] px-3 py-3">Tanggal Lamar</th>
                <th className="w-[13%] px-3 py-3">Status</th>
                <th className="w-[12%] px-3 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    Tidak ada pendaftar di kelompok ini yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                visibleApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="break-words px-3 py-3.5">
                      <div className="font-bold text-slate-900">{app.volunteerName}</div>
                      <div className="break-all text-[11px] text-slate-400">{app.volunteerEmail}</div>
                    </td>
                    <td className="break-words px-3 py-3.5">
                      <div className="font-medium text-slate-800">{app.programTitle}</div>
                      <div className="break-words text-[11px] text-slate-400">{app.partnerName}</div>
                    </td>
                    <td className="break-words px-3 py-3.5 text-slate-600">
                      {app.volunteerCity || 'Tidak disebutkan'}
                    </td>
                    <td className="break-words px-3 py-3.5 text-slate-600">
                      {app.volunteerGender === 'male' ? 'Laki-laki' : app.volunteerGender === 'female' ? 'Perempuan' : 'Tidak disebutkan'}
                    </td>
                    <td className="break-words px-3 py-3.5 font-mono text-[11px] text-slate-500">
                      {app.submittedAt}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setReviewingApp(app);
                          setDecisionNotes(app.reviewNotes || '');
                        }}
                        className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                      >
                        Detail &amp; Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewingApp && (
        <Modal
          isOpen={!!reviewingApp}
          onClose={() => setReviewingApp(null)}
          title={`Aplikasi Relawan: ${reviewingApp.volunteerName}`}
          subtitle={`Program: ${reviewingApp.programTitle} (${reviewingApp.partnerName})`}
          maxWidth="2xl"
          variant="pastel"
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</span>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-semibold text-slate-800">{reviewingApp.volunteerEmail}</div>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Telepon</span>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-semibold text-slate-800">{reviewingApp.volunteerPhone}</div>
              </div>
            </div>

            {reviewingApp.attachment && (
              <div className="space-y-2">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Lampiran Pendukung</span>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{reviewingApp.attachment.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{Math.ceil(reviewingApp.attachment.size / 1024)} KB</p>
                  </div>
                  <a
                    href={reviewingApp.attachment.dataUrl}
                    download={reviewingApp.attachment.name}
                    className="rounded-lg bg-[#0B2238] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Unduh lampiran
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Motivasi Relawan</span>
              <p className="rounded-2xl border border-slate-200/80 bg-white p-4 leading-relaxed text-slate-700">
                "{reviewingApp.motivation}"
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200/80 pt-4">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Catatan Seleksi:
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Catatan hasil verifikasi..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-[#5C80B6] focus:ring-2 focus:ring-[#5C80B6]/20"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setReviewingApp(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => handleDecision('waitlisted')}
                className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
              >
                Daftar Tunggu
              </button>
              <button
                type="button"
                onClick={() => handleDecision('accepted')}
                className="rounded-xl bg-[#0B2238] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C80B6]"
              >
                Terima Relawan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
