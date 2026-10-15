'use client';

import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { PartnerOrganization } from '../../types';

export const PartnershipReviewList: React.FC = () => {
  const { partners, reviewPartnership, updatePartnerDocumentVerification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePartnerGroup, setActivePartnerGroup] = useState<'pending' | 'approved'>('pending');
  const [selectedOrg, setSelectedOrg] = useState<PartnerOrganization | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredPartners = partners.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      p.name.toLowerCase().includes(q) ||
      p.sector.toLowerCase().includes(q) ||
      p.picName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const pendingPartners = filteredPartners.filter(partner => partner.status !== 'approved');
  const approvedPartners = filteredPartners.filter(partner => partner.status === 'approved');
  const visiblePartners = activePartnerGroup === 'approved' ? approvedPartners : pendingPartners;

  const handleDecision = (decision: 'approved' | 'revision_required' | 'rejected') => {
    if (!selectedOrg) return;
    if ((decision === 'revision_required' || decision === 'rejected') && !reviewNotes.trim()) {
      alert(decision === 'revision_required'
        ? 'Mohon cantumkan rincian catatan revisi agar mitra memahami apa yang perlu diperbaiki.'
        : 'Mohon cantumkan alasan penolakan agar mitra memahami keputusan PSA.');
      return;
    }
    if (decision === 'approved' && (
      selectedOrg.documents.length === 0 ||
      selectedOrg.documents.some(doc => (doc.verificationStatus ?? (selectedOrg.status === 'approved' ? 'verified' : 'pending')) !== 'verified')
    )) {
      alert('Verifikasi semua dokumen mitra sebelum menyetujui kemitraan.');
      return;
    }
    reviewPartnership(selectedOrg.id, decision, reviewNotes.trim() || undefined);
    setSelectedOrg(null);
    setReviewNotes('');
  };

  const handleDocumentVerification = (
    documentId: string,
    status: 'verified' | 'revision_required'
  ) => {
    if (!selectedOrg) return;
    const document = selectedOrg.documents.find(item => item.id === documentId);
    if (!document || !updatePartnerDocumentVerification(selectedOrg.id, documentId, status)) {
      alert('Dokumen tidak ditemukan. Muat ulang halaman dan coba lagi.');
      return;
    }
    setSelectedOrg(current => current ? {
      ...current,
      documents: current.documents.map(item => item.id === documentId
        ? { ...item, verificationStatus: status }
        : item),
    } : current);
  };

  const pendingPartnersCount = partners.filter(partner => partner.status === 'submitted' || partner.status === 'under_review').length;
  const approvedPartnersCount = partners.filter(partner => partner.status === 'approved').length;
  const revisionPartnersCount = partners.filter(partner => partner.status === 'revision_required').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Mitra</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verifikasi dokumen, tinjau status kemitraan, dan tetapkan keputusan untuk setiap organisasi.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Ringkasan status mitra">
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">Menunggu verifikasi</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">{pendingPartnersCount}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-800">Mitra disetujui</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{approvedPartnersCount}</p>
        </article>
        <article className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-xs font-medium text-orange-800">Perlu revisi</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-orange-900">{revisionPartnersCount}</p>
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
            placeholder="Cari nama organisasi, sektor, atau nama PIC..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            const nextStatus = e.target.value;
            setStatusFilter(nextStatus);
            if (nextStatus === 'approved') setActivePartnerGroup('approved');
            else if (nextStatus !== 'all') setActivePartnerGroup('pending');
          }}
          className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status Review</option>
          <option value="draft">Draf</option>
          <option value="submitted">Terkirim (Menunggu Review)</option>
          <option value="under_review">Sedang Ditinjau</option>
          <option value="revision_required">Perlu Revisi</option>
          <option value="approved">Disetujui (Mitra Resmi)</option>
          <option value="rejected">Ditolak</option>
          <option value="withdrawn">Ditarik</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Kelompok status mitra">
        <button
          type="button"
          role="tab"
          aria-selected={activePartnerGroup === 'pending'}
          onClick={() => setActivePartnerGroup('pending')}
          className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
            activePartnerGroup === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending / Belum disetujui <span className="ml-1 tabular-nums">({pendingPartners.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activePartnerGroup === 'approved'}
          onClick={() => setActivePartnerGroup('approved')}
          className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
            activePartnerGroup === 'approved' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sudah disetujui <span className="ml-1 tabular-nums">({approvedPartners.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 xl:hidden">
          {visiblePartners.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-500">
              Tidak ada mitra di kelompok ini yang sesuai filter.
            </div>
          ) : (
            visiblePartners.map((org) => {
              const verifiedDocuments = org.documents.filter(doc =>
                (doc.verificationStatus ?? (org.status === 'approved' ? 'verified' : 'pending')) === 'verified'
              ).length;
              return (
                <article key={org.id} className="space-y-3 p-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-bold text-slate-900">{org.name}</h3>
                    <p className="mt-0.5 break-words text-xs text-slate-500">{org.city}, {org.province}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div className="min-w-0">
                      <dt className="text-slate-500">Bentuk / Sektor</dt>
                      <dd className="mt-0.5 break-words font-medium capitalize text-slate-800">{org.type}</dd>
                      <dd className="break-words text-[11px] text-slate-500">{org.sector}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-slate-500">PIC &amp; Kontak</dt>
                      <dd className="mt-0.5 break-words font-medium text-slate-800">{org.picName}</dd>
                      <dd className="break-all text-[11px] text-slate-500">{org.picEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Berkas</dt>
                      <dd className="mt-0.5 font-mono text-slate-600">
                        {verifiedDocuments}/{org.documents.length} valid
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="mt-1"><StatusBadge status={org.status} size="sm" /></dd>
                    </div>
                  </dl>
                  <button
                    onClick={() => {
                      setSelectedOrg(org);
                      setReviewNotes(org.reviewNotes || '');
                    }}
                    className="w-full rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                  >
                    Tinjau Berkas
                  </button>
                </article>
              );
            })
          )}
        </div>
        <div className="hidden xl:block">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="w-[22%] px-3 py-3">Nama Organisasi</th>
                <th className="w-[19%] px-3 py-3">Bentuk / Sektor</th>
                <th className="w-[23%] px-3 py-3">PIC &amp; Kontak</th>
                <th className="w-[10%] px-3 py-3">Berkas</th>
                <th className="w-[14%] px-3 py-3">Status</th>
                <th className="w-[12%] px-3 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visiblePartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada mitra di kelompok ini yang sesuai filter.
                  </td>
                </tr>
              ) : (
                visiblePartners.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="break-words px-3 py-3.5">
                      <div className="font-bold text-slate-900">{org.name}</div>
                      <div className="break-words text-[11px] text-slate-400">{org.city}, {org.province}</div>
                    </td>
                    <td className="break-words px-3 py-3.5">
                      <div className="font-medium text-slate-800 capitalize">{org.type}</div>
                      <div className="break-words text-[11px] text-slate-500">{org.sector}</div>
                    </td>
                    <td className="break-words px-3 py-3.5">
                      <div className="text-slate-800 font-medium">{org.picName}</div>
                      <div className="break-all text-[11px] text-slate-400">{org.picEmail}</div>
                    </td>
                    <td className="break-words px-3 py-3.5 font-mono text-slate-600">
                      {org.documents.filter(doc =>
                        (doc.verificationStatus ?? (org.status === 'approved' ? 'verified' : 'pending')) === 'verified'
                      ).length}/{org.documents.length} valid
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={org.status} size="sm" />
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setReviewNotes(org.reviewNotes || '');
                        }}
                        className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                      >
                        Tinjau Berkas
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
      {selectedOrg && (
        <Modal
          isOpen={!!selectedOrg}
          onClose={() => setSelectedOrg(null)}
          title={`Peninjauan Kemitraan: ${selectedOrg.name}`}
          subtitle={`Tanggal Diajukan: ${selectedOrg.createdAt} · Status Saat Ini: ${selectedOrg.status.toUpperCase()}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Profile Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bentuk Organisasi</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedOrg.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sektor Fokus</span>
                  <span className="font-semibold text-slate-900">{selectedOrg.sector}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Resmi</span>
                  <span className="font-semibold text-slate-900">{selectedOrg.picName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kontak HP / WA</span>
                  <span className="font-semibold text-slate-900">{selectedOrg.picPhone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-slate-600 leading-relaxed">
                <strong>Alamat Kantor:</strong> {selectedOrg.address}, {selectedOrg.city}, {selectedOrg.province}
              </div>
            </div>

            {/* Motivation & Objectives */}
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Alasan Mengajukan Kemitraan PSA:</h4>
                <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 italic">
                  "{selectedOrg.collaborationReason || '-'}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-1">Target Dampak &amp; Objektif:</h4>
                  <p className="text-slate-600">{selectedOrg.collaborationObjective || '-'}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-800 mb-1">Bentuk Kontribusi Ditawarkan:</h4>
                  <p className="text-slate-600">{selectedOrg.offeredContribution || '-'}</p>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900">
              Verifikasi Dokumen Legalitas &amp; Surat Komitmen ({selectedOrg.documents.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedOrg.documents.length === 0 ? (
                <p className="col-span-full rounded-lg border border-dashed border-slate-300 p-4 text-center text-slate-500">
                  Mitra belum mengunggah dokumen legalitas.
                </p>
              ) : selectedOrg.documents.map((doc) => {
                const documentStatus = doc.verificationStatus ?? (selectedOrg.status === 'approved' ? 'verified' : 'pending');
                return (
                  <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileText size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 break-words">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.type} · {doc.size} · Diunggah {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold ${
                        documentStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : documentStatus === 'revision_required'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}>
                        {documentStatus === 'verified' ? 'Terverifikasi' : documentStatus === 'revision_required' ? 'Perlu revisi' : 'Belum diperiksa'}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDocumentVerification(doc.id, 'revision_required')}
                        className="rounded-md border border-orange-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-orange-700 hover:bg-orange-50"
                      >
                        Tandai perlu revisi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDocumentVerification(doc.id, 'verified')}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 size={13} />
                        Tandai valid
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
              <p className="text-[11px] text-slate-500">
              Setujui kemitraan hanya setelah seluruh dokumen ditandai valid.
              </p>
            </div>

            {/* Review Decision Notes Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-900">
                Catatan Keputusan / Instruksi Revisi (Wajib jika meminta revisi atau menolak):
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Contoh: Dokumen legalitas akta telah lengkap dan valid / Mohon unggah ulang surat tugas PIC dengan tanda tangan pimpinan..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
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
                <span>Tolak Kemitraan</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('revision_required')}
                className="px-3.5 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Minta Revisi Dokumen</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('approved')}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Setujui Kemitraan Resmi</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
