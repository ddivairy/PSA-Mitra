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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Peserta &amp; Relawan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau berkas pendaftaran calon relawan untuk program yang diselenggarakan oleh <strong>{currentOrg?.name}</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <Download size={14} />
          <span>Ekspor Data (CSV)</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
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
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="submitted">Terkirim (Baru)</option>
          <option value="under_review">Sedang Ditinjau</option>
          <option value="accepted">Diterima</option>
          <option value="waitlisted">Daftar Tunggu</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
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
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada pendaftar yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
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
          variant="pastel"
        >
          <div className="space-y-5 text-sm">
            {/* Applicant details strip */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</span>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-semibold text-slate-800">{reviewingApp.volunteerEmail}</div>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">No. Telepon / WA</span>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-semibold text-slate-800">{reviewingApp.volunteerPhone}</div>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">Kota Domisili</span>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 font-semibold text-slate-800">{reviewingApp.volunteerCity}</div>
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

            {/* Motivation statement */}
            <div className="space-y-2">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Motivasi &amp; Pernyataan Pendaftar</span>
              <p className="rounded-2xl border border-slate-200/80 bg-white p-4 leading-relaxed text-slate-700">
                "{reviewingApp.motivation}"
              </p>
            </div>

            {/* Additional answers if any */}
            {reviewingApp.answers && Object.keys(reviewingApp.answers).length > 0 && (
              <div className="space-y-2">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Jawaban Tambahan</span>
                <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4">
                  {Object.entries(reviewingApp.answers).map(([q, a]) => (
                    <div key={q} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <span className="font-medium text-slate-500">{q}: </span>
                      <span className="text-slate-800">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision note input */}
            <div className="space-y-2 border-t border-slate-200/80 pt-4">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Catatan Keputusan untuk Peserta (Opsional):
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Contoh: Selamat bergabung di tim lapangan / Jadwal briefing akan dikirimkan via WA grup..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-[#5C80B6] focus:ring-2 focus:ring-[#5C80B6]/20"
              />
            </div>

            {/* Decision action buttons */}
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
                className="flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
              >
                <XCircle size={14} />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('waitlisted')}
                className="flex items-center gap-1.5 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
              >
                <Clock size={14} />
                <span>Daftar Tunggu</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('accepted')}
                className="flex items-center gap-1.5 rounded-xl bg-[#0B2238] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5C80B6]"
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
