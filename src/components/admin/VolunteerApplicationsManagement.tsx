import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
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

export const VolunteerApplicationsManagement: React.FC = () => {
  const { applications, programs, reviewVolunteerApplication } = useApp();

  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Seleksi Relawan PSA</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan dan tata kelola pendaftaran relawan lintas seluruh program kemitraan.
          </p>
        </div>
      </div>

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
          onChange={(e) => setSelectedStatus(e.target.value)}
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Nama Relawan</th>
                <th className="px-5 py-3">Program &amp; Mitra</th>
                <th className="px-5 py-3">Domisili</th>
                <th className="px-5 py-3">Tanggal Lamar</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada pendaftar yang cocok.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{app.volunteerName}</div>
                      <div className="text-[11px] text-slate-400">{app.volunteerEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">{app.programTitle}</div>
                      <div className="text-[11px] text-slate-400">{app.partnerName}</div>
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
