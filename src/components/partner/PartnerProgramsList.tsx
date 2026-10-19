'use client';

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { CreateProposalModal } from './CreateProposalModal';

export const PartnerProgramsList: React.FC = () => {
  const { programs, partners, currentUser, refreshPartnerWorkspace } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<import('../../types').Program | undefined>();
  const currentOrg = partners.find(p => p.id === currentUser?.orgId);
  const orgPrograms = programs.filter(p => p.partnerId === currentOrg?.id);

  const isApprovedPartner = currentOrg?.status === 'approved';

  return (
    <div className="space-y-6">
      {orgPrograms.length === 0 ? (
        <div className="card panel text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-extrabold text-[#0F172A]">Belum Ada Program</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Ajukan proposal program kolaborasi pertama organisasi Anda untuk menjaring relawan berdampak.
          </p>
          {isApprovedPartner && (
            <button
              type="button"
              onClick={() => { setEditingProgram(undefined); setIsModalOpen(true); }}
              className="navy-button"
            >
              Mulai Ajukan Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgPrograms.map(prog => (
            <div
              key={prog.id}
              className="card overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] bg-slate-100">
                  <img src={prog.image} alt={prog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 text-[#0F172A] text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
                      {prog.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={prog.proposalStatus} size="sm" />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#0F172A] line-clamp-2">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {prog.summary}
                  </p>
                  {prog.proposalStatus === 'revision_required' && prog.reviewNotes && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">Catatan admin: {prog.reviewNotes}</p>}

                  <div className="space-y-1.5 text-xs text-[#64748B] pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#5C80B6]" />
                      <span>{prog.city || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#5C80B6]" />
                      <span>Mulai: {prog.startDate}</span>
                    </div>
                  </div>
                </div>
                {prog.proposalStatus === 'approved' && ['published', 'closed'].includes(prog.publishedStatus) && <PartnerProgramExecutionPanel
                  programId={prog.id}
                  executionStatus={prog.executionStatus || 'planned'}
                  announcement={prog.publicAnnouncement || ''}
                  refresh={refreshPartnerWorkspace}
                />}
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="font-mono tabular-nums text-[#0F172A] font-bold">
                  Peserta: <strong>{prog.enrolledCount}</strong> / {prog.targetQuota > 0 ? prog.targetQuota : 'Tidak dibatasi'}
                </span>

                <div className="flex items-center gap-2">
                  {['draft', 'revision_required'].includes(prog.proposalStatus) && <button type="button" onClick={() => { setEditingProgram(prog); setIsModalOpen(true); }} className="rounded-md border border-blue-200 px-2 py-1 font-semibold text-blue-700">{prog.proposalStatus === 'draft' ? 'Edit draf' : 'Perbaiki'}</button>}
                  <StatusBadge status={prog.publishedStatus} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProgram(undefined); }}
        onSuccess={() => { setIsModalOpen(false); setEditingProgram(undefined); }}
        existingProgram={editingProgram}
      />
    </div>
  );
};

type ProgramReport = { id: string; file_name: string; status: string; review_notes?: string | null; notes?: string | null; url?: string | null };
const executionSteps = ['planned', 'registration_open', 'registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion'] as const;
const statusLabels: Record<string, string> = { planned: 'Segera dibuka', registration_open: 'Pendaftaran dibuka', registration_closed: 'Pendaftaran ditutup', selection: 'Seleksi peserta', participants_announced: 'Pengumuman peserta', preparing: 'Persiapan kegiatan', ongoing: 'Sedang berlangsung', pending_completion: 'Menunggu verifikasi selesai', completed: 'Selesai', canceled: 'Dibatalkan', approved: 'Disetujui', revision_required: 'Perlu revisi', submitted: 'Menunggu review' };

function PartnerProgramExecutionPanel({ programId, executionStatus, announcement, refresh }: { programId: string; executionStatus: string; announcement: string; refresh: () => Promise<void> }) {
  const [status, setStatus] = useState(executionStatus);
  const [message, setMessage] = useState(announcement);
  const [reports, setReports] = useState<ProgramReport[]>([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void fetch(`/api/partner/programs/${encodeURIComponent(programId)}/reports`, { cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Laporan gagal dimuat.');
      if (active) setReports(data.reports || []);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Laporan gagal dimuat.'); });
    return () => { active = false; };
  }, [programId]);
  const saveStatus = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/partner/programs/${encodeURIComponent(programId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ executionStatus: status, announcement: message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Status program gagal disimpan.');
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Status program gagal disimpan.'); }
    finally { setBusy(false); }
  };
  const uploadReport = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const form = new FormData(); form.set('report', file); form.set('notes', notes);
      const response = await fetch(`/api/partner/programs/${encodeURIComponent(programId)}/reports`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Laporan gagal diunggah.');
      setReports(items => [data.report, ...items]); setNotes('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Laporan gagal diunggah.'); }
    finally { setBusy(false); }
  };
  return <section className="mx-4 mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4" aria-label="Pelaksanaan dan laporan program">
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Tahap pelaksanaan
        {['completed', 'canceled'].includes(status) ? <span className="mt-1 block rounded-lg bg-slate-100 p-2 text-xs">{statusLabels[status]}</span> : <select value={status} onChange={event => setStatus(event.target.value)} disabled={status === 'pending_completion'} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs disabled:bg-slate-100">
          {executionSteps.map(step => <option key={step} value={step}>{statusLabels[step]}</option>)}
        </select>}
      </label>
      <label className="block text-xs font-semibold text-slate-700">Pengumuman untuk publik (opsional)
        <textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={2000} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs" />
      </label>
      <button type="button" disabled={busy || status === 'pending_completion'} onClick={() => void saveStatus()} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Simpan status</button>
    </div>
    {['ongoing', 'pending_completion'].includes(status) && <div className="space-y-2 border-t border-slate-100 pt-3">
      <p className="text-xs font-bold text-slate-800">Laporan kegiatan</p>
      <textarea value={notes} onChange={event => setNotes(event.target.value)} maxLength={3000} rows={2} placeholder="Ringkasan laporan atau keterangan dokumen" className="w-full rounded-lg border border-slate-300 p-2 text-xs" />
      <label className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">Unggah PDF/JPG/PNG, maks. 10 MB<input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" disabled={busy} onChange={event => { void uploadReport(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>
      {reports.map(report => <div key={report.id} className="text-xs text-slate-600"><a className="underline" href={report.url || undefined} target="_blank" rel="noreferrer">{report.file_name}</a> · {statusLabels[report.status] || report.status}{report.review_notes && <p className="text-orange-700">Catatan admin: {report.review_notes}</p>}</div>)}
    </div>}
    {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
  </section>;
}
