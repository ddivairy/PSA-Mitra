import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  Eye, 
  Building2,
  Calendar,
  Users,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Program, PublicationStatus } from '../../types';

export const ProgramProposalReviewList: React.FC = () => {
  const { programs, reviewProgramProposal, toggleProgramPublication } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProg, setSelectedProg] = useState<Program | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredPrograms = programs.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      p.title.toLowerCase().includes(q) ||
      p.partnerName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.proposalStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDecision = (decision: 'approved' | 'revision_required' | 'rejected') => {
    if (!selectedProg) return;
    reviewProgramProposal(selectedProg.id, decision, reviewNotes.trim() || undefined);
    setSelectedProg(null);
    setReviewNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Peninjauan Proposal Program Kolaborasi</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluasi proposal kegiatan yang diajukan oleh mitra sebelum ditayangkan ke publik relawan.
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
            placeholder="Cari judul proposal, mitra, atau kategori..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status Proposal</option>
          <option value="submitted">Terkirim (Menunggu Review)</option>
          <option value="under_review">Sedang Ditinjau</option>
          <option value="revision_required">Perlu Revisi</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Judul Program</th>
                <th className="px-5 py-3">Mitra Pengusul</th>
                <th className="px-5 py-3">Kategori &amp; Format</th>
                <th className="px-5 py-3">Target Relawan</th>
                <th className="px-5 py-3">Status Proposal</th>
                <th className="px-5 py-3">Status Publikasi</th>
                <th className="px-5 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada proposal program yang cocok.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400">Dibuat: {p.createdAt}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{p.partnerName}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-blue-600 font-medium">{p.category}</span>
                      <span className="text-slate-400 block text-[11px] uppercase">{p.format}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {p.enrolledCount} / {p.targetQuota}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.proposalStatus} size="sm" />
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={p.publishedStatus}
                        onChange={(e) => toggleProgramPublication(p.id, e.target.value as PublicationStatus)}
                        className="text-[11px] py-1 px-2 border border-slate-300 rounded bg-white text-slate-700 font-medium"
                      >
                        <option value="published">Tayang (Buka)</option>
                        <option value="closed">Tutup Pendaftaran</option>
                        <option value="draft">Draf (Sembunyi)</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedProg(p);
                          setReviewNotes(p.reviewNotes || '');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Tinjau Proposal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedProg && (
        <Modal
          isOpen={!!selectedProg}
          onClose={() => setSelectedProg(null)}
          title={`Peninjauan Proposal: ${selectedProg.title}`}
          subtitle={`Diajukan oleh ${selectedProg.partnerName} · Tanggal ${selectedProg.createdAt}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[11px]">Kategori</span>
                <span className="font-semibold text-slate-900">{selectedProg.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Format Kegiatan</span>
                <span className="font-semibold text-slate-900 uppercase">{selectedProg.format}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Target Relawan</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">{selectedProg.targetQuota} Orang</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Batas Pendaftaran</span>
                <span className="font-semibold text-rose-600">{selectedProg.deadline}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900">Deskripsi &amp; Konsep Program:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                {selectedProg.description}
              </p>
            </div>

            {/* Schedule & Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-900">Jadwal &amp; Lokasi:</span>
                <p className="text-slate-600">{selectedProg.schedule}</p>
                <p className="text-slate-500 text-[11px]">{selectedProg.address || selectedProg.city || 'Online'}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-900">PIC Penanggung Jawab:</span>
                <p className="text-slate-600 font-medium">{selectedProg.picName}</p>
                <p className="text-slate-500 text-[11px]">{selectedProg.picContact}</p>
              </div>
            </div>

            {/* Review Notes Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-900">
                Catatan Reviewer PSA untuk Mitra:
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Berikan instruksi revisi atau apresiasi persetujuan..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedProg(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Tolak Proposal</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('revision_required')}
                className="px-3.5 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Minta Revisi</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Setujui &amp; Publikasikan Program</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
