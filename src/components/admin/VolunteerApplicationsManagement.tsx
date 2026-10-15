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
        <article className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-800">Total pendaftaran</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-blue-900">{numberFormatter.format(applications.length)}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-800">Peserta unik</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{numberFormatter.format(uniqueApplicants)}</p>
        </article>
      </section>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
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
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
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
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-semibold text-slate-900">{reviewingApp.volunteerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Telepon</span>
                <span className="font-semibold text-slate-900">{reviewingApp.volunteerPhone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-800">Motivasi Relawan:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 italic">
                "{reviewingApp.motivation}"
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800">
                Catatan Seleksi:
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Catatan hasil verifikasi..."
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingApp(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => handleDecision('waitlisted')}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg"
              >
                Daftar Tunggu
              </button>
              <button
                type="button"
                onClick={() => handleDecision('accepted')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg"
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
