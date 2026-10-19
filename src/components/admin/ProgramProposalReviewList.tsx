'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { VolunteerApplication } from '../../types';

const numberFormatter = new Intl.NumberFormat('id-ID');

const ProgramParticipants: React.FC<{ applications: VolunteerApplication[] }> = ({ applications }) => (
  <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
      <Users size={16} className="text-blue-600" />
      Daftar peserta
      <span className="font-medium text-slate-500">({numberFormatter.format(applications.length)})</span>
    </h4>
    {applications.length === 0 ? (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
        Belum ada peserta yang mendaftar di program ini.
      </p>
    ) : (
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {applications.map(application => (
          <li key={application.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">{application.volunteerName}</p>
              <p className="break-all text-xs text-slate-500">{application.volunteerEmail}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Domisili: {application.volunteerCity || 'Tidak disebutkan'}
              </p>
            </div>
            <StatusBadge status={application.status} size="sm" />
          </li>
        ))}
      </ul>
    )}
  </div>
);

export const ProgramProposalReviewList: React.FC = () => {
  const { programs, applications, reviewProgramProposal, toggleProgramPublication, refreshAdminWorkspace } = useApp();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const pendingPrograms = programs.filter(program => ['submitted', 'under_review', 'revision_required'].includes(program.proposalStatus));

  const toggleParticipants = (programId: string) => {
    setSelectedProgramId(currentId => currentId === programId ? null : programId);
  };
  const handleProposalDecision = (programId: string, status: 'approved' | 'revision_required' | 'rejected') => {
    if (status === 'approved') { void reviewProgramProposal(programId, status); return; }
    const notes = window.prompt(status === 'rejected' ? 'Catatan penolakan proposal:' : 'Catatan yang perlu diperbaiki mitra:')?.trim();
    if (!notes) return;
    void reviewProgramProposal(programId, status, notes);
  };

  const pendingCount = programs.filter(program =>
    program.proposalStatus === 'submitted' || program.proposalStatus === 'under_review'
  ).length;
  const approvedCount = programs.filter(program => program.proposalStatus === 'approved').length;
  const publishedCount = programs.filter(program => program.publishedStatus === 'published').length;
  const totalRegistrations = programs.reduce((total, program) => total + program.enrolledCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan program">
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">Menunggu review</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">{numberFormatter.format(pendingCount)}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-800">Proposal disetujui</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{numberFormatter.format(approvedCount)}</p>
        </article>
        <article className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-800">Program dipublikasikan</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-blue-900">{numberFormatter.format(publishedCount)}</p>
        </article>
        <article className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-medium text-violet-800">Total pendaftaran</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-violet-900">{numberFormatter.format(totalRegistrations)}</p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="proposal-review-queue">
        <h2 id="proposal-review-queue" className="text-lg font-bold text-slate-900">Antrean review proposal</h2>
        <p className="mt-1 text-xs text-slate-500">Keputusan disimpan langsung ke Supabase.</p>
        <div className="mt-3 divide-y divide-slate-100">
          {pendingPrograms.map(program => <article key={program.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><h3 className="break-words text-sm font-semibold text-slate-900">{program.title}</h3><p className="mt-1 text-xs text-slate-500">{program.partnerName} · {program.city || 'Lokasi belum dicantumkan'} · {program.proposalStatus}</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => handleProposalDecision(program.id, 'approved')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Setujui proposal</button><button onClick={() => handleProposalDecision(program.id, 'revision_required')} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800">Minta revisi</button><button onClick={() => handleProposalDecision(program.id, 'rejected')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Tolak</button></div>
          </article>)}
          {!pendingPrograms.length && <p className="py-5 text-center text-sm text-slate-500">Tidak ada proposal menunggu review.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="program-publication-heading">
        <h2 id="program-publication-heading" className="text-lg font-bold text-slate-900">Publikasi program</h2>
        <p className="mt-1 text-xs text-slate-500">Persetujuan proposal tidak otomatis membuka pendaftaran. Publikasikan setelah memeriksa informasi serta tanggal program.</p>
        <div className="mt-3 divide-y divide-slate-100">
          {programs.filter(program => program.proposalStatus === 'approved').map(program => <div key={program.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-slate-900">{program.title}</p><p className="text-xs text-slate-500">{program.partnerName} · {program.publishedStatus}</p></div><select aria-label={`Status publikasi ${program.title}`} value={program.publishedStatus} onChange={event => void toggleProgramPublication(program.id, event.target.value as 'draft' | 'published' | 'closed' | 'archived')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Publikasikan</option><option value="closed">Tutup pendaftaran</option><option value="archived">Arsipkan</option></select></div>)}
          {!programs.some(program => program.proposalStatus === 'approved') && <p className="py-4 text-sm text-slate-500">Belum ada proposal yang disetujui.</p>}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="program-progress-heading">
        <div>
          <h2 id="program-progress-heading" className="text-lg font-bold text-slate-900">Tracking progres program</h2>
          <p className="mt-1 text-xs text-slate-500">Pantau keterisian target relawan dan periode setiap program.</p>
        </div>
        {programs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Belum ada program untuk dipantau.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="divide-y divide-slate-100 lg:hidden">
              {programs.map(program => {
                const progress = program.targetQuota > 0
                  ? Math.min(100, Math.round((program.enrolledCount / program.targetQuota) * 100))
                  : 0;
                const programApplications = applications.filter(application => application.programId === program.id);
                const isExpanded = selectedProgramId === program.id;
                const participantsId = `program-participants-${program.id}`;
                return (
                  <article key={program.id} className="border-b border-slate-100 last:border-b-0">
                    <div className="space-y-3 p-4">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-bold text-slate-900">{program.title}</h3>
                          <p className="mt-0.5 break-words text-xs text-slate-500">{program.partnerName}</p>
                        </div>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={participantsId}
                          onClick={() => toggleParticipants(program.id)}
                          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <Users size={14} />
                          Peserta ({numberFormatter.format(programApplications.length)})
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div className="min-w-0">
                        <dt className="text-slate-500">Periode</dt>
                        <dd className="mt-0.5 break-words font-medium text-slate-700">
                          {program.startDate} – {program.endDate}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Pendaftar / Target</dt>
                        <dd className="mt-0.5 font-mono font-medium text-slate-700">
                          {numberFormatter.format(program.enrolledCount)} / {numberFormatter.format(program.targetQuota)}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500">Progres Kuota</dt>
                        <dd className="mt-1 flex items-center gap-2">
                          <div
                            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
                            role="progressbar"
                            aria-label={`Progres kuota ${program.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress}
                          >
                            <div
                              className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-slate-600">{progress}%</span>
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500">Status</dt>
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                          <StatusBadge status={program.proposalStatus} size="sm" />
                          <StatusBadge status={program.publishedStatus} size="sm" />
                        </dd>
                      </div>
                    </dl>
                    </div>
                    {isExpanded && (
                      <div id={participantsId}>
                        <ProgramParticipants applications={programApplications} />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="w-[28%] px-3 py-3 xl:px-4">Program &amp; Mitra</th>
                    <th className="w-[20%] px-3 py-3 xl:px-4">Periode</th>
                    <th className="w-[18%] px-3 py-3 xl:px-4">Pendaftar / Target</th>
                    <th className="w-[19%] px-3 py-3 xl:px-4">Progres Kuota</th>
                    <th className="w-[15%] px-3 py-3 xl:px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map(program => {
                    const progress = program.targetQuota > 0
                      ? Math.min(100, Math.round((program.enrolledCount / program.targetQuota) * 100))
                      : 0;
                    const programApplications = applications.filter(application => application.programId === program.id);
                    const isExpanded = selectedProgramId === program.id;
                    const participantsId = `program-participants-${program.id}`;
                    return (
                      <React.Fragment key={program.id}>
                        <tr className="hover:bg-slate-50">
                          <td className="break-words px-3 py-3.5 xl:px-4">
                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              aria-controls={participantsId}
                              onClick={() => toggleParticipants(program.id)}
                              className="group flex w-full items-start justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              <span className="min-w-0">
                                <span className="block break-words font-bold text-slate-900 group-hover:text-blue-700">{program.title}</span>
                                <span className="mt-0.5 block text-[11px] text-slate-500">{program.partnerName}</span>
                              </span>
                              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-700">
                                <Users size={13} />
                                <span>{numberFormatter.format(programApplications.length)}</span>
                                <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </span>
                            </button>
                          </td>
                          <td className="break-words px-3 py-3.5 text-slate-600 xl:px-4">
                            {program.startDate} – {program.endDate}
                          </td>
                          <td className="break-words px-3 py-3.5 font-mono text-slate-700 xl:px-4">
                            {numberFormatter.format(program.enrolledCount)} / {numberFormatter.format(program.targetQuota)}
                          </td>
                          <td className="px-3 py-3.5 xl:px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
                                role="progressbar"
                                aria-label={`Progres kuota ${program.title}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={progress}
                              >
                                <div
                                  className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="w-9 text-right font-mono text-slate-600">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 xl:px-4">
                            <div className="flex flex-col items-start gap-1.5">
                              <StatusBadge status={program.proposalStatus} size="sm" />
                              <StatusBadge status={program.publishedStatus} size="sm" />
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} id={participantsId} className="p-0">
                              <ProgramParticipants applications={programApplications} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      <ProgramReportsReview programs={programs.filter(program => program.proposalStatus === 'approved' && ['published', 'closed'].includes(program.publishedStatus))} refresh={refreshAdminWorkspace} />
    </div>
  );
};

type ReportRow = { id: string; file_name: string; notes?: string | null; status: string; review_notes?: string | null; url?: string | null };
function ProgramReportsReview({ programs, refresh }: { programs: { id: string; title: string; partnerName: string; executionStatus?: string }[]; refresh: () => Promise<void> }) {
  const [programId, setProgramId] = useState('');
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!programId) { setReports([]); return; }
    let active = true;
    void fetch(`/api/admin/programs/${encodeURIComponent(programId)}/reports`, { cache: 'no-store' }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Laporan gagal dimuat.');
      if (active) setReports(data.reports || []);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Laporan gagal dimuat.'); });
    return () => { active = false; };
  }, [programId]);
  const review = async (reportId: string, status: 'approved' | 'revision_required') => {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/programs/${encodeURIComponent(programId)}/reports`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId, status, notes: reviewNotes[reportId] || '' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Review laporan gagal disimpan.');
      const refreshResponse = await fetch(`/api/admin/programs/${encodeURIComponent(programId)}/reports`, { cache: 'no-store' });
      const refreshed = await refreshResponse.json(); if (refreshResponse.ok) setReports(refreshed.reports || []);
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Review laporan gagal disimpan.'); }
    finally { setBusy(false); }
  };
  const finalize = async () => {
    if (!programId) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/programs/${encodeURIComponent(programId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ executionStatus: 'completed' }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Penyelesaian program gagal dikonfirmasi.');
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Penyelesaian program gagal dikonfirmasi.'); }
    finally { setBusy(false); }
  };
  const selected = programs.find(program => program.id === programId);
  return <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="program-report-review">
    <h2 id="program-report-review" className="text-lg font-bold text-slate-900">Laporan &amp; penyelesaian program</h2>
    <p className="mt-1 text-xs text-slate-500">Tinjau laporan mitra dan konfirmasi program selesai setelah tahap verifikasi.</p>
    <select value={programId} onChange={event => { setProgramId(event.target.value); setError(''); }} className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-sm">
      <option value="">Pilih program terbit</option>{programs.map(program => <option key={program.id} value={program.id}>{program.title} — {program.partnerName}</option>)}
    </select>
    {selected?.executionStatus === 'pending_completion' && <button type="button" disabled={busy} onClick={() => void finalize()} className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Konfirmasi program selesai</button>}
    <div className="mt-3 space-y-3">
      {reports.map(report => <article key={report.id} className="rounded-lg border border-slate-200 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2"><a href={report.url || undefined} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">{report.file_name}</a><StatusBadge status={report.status} size="sm" /></div>
        {report.notes && <p className="mt-1 text-xs text-slate-600">{report.notes}</p>}
        {report.status === 'submitted' && <div className="mt-3 space-y-2"><textarea value={reviewNotes[report.id] || ''} onChange={event => setReviewNotes(current => ({ ...current, [report.id]: event.target.value }))} maxLength={3000} rows={2} placeholder="Catatan admin (wajib jika meminta revisi)" className="w-full rounded-lg border border-slate-300 p-2 text-xs" /><div className="flex gap-2"><button disabled={busy} onClick={() => void review(report.id, 'approved')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Setujui laporan</button><button disabled={busy} onClick={() => void review(report.id, 'revision_required')} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800 disabled:opacity-50">Minta revisi</button></div></div>}
        {report.review_notes && <p className="mt-2 text-xs text-amber-800">Catatan review: {report.review_notes}</p>}
      </article>)}
      {programId && reports.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">Belum ada laporan untuk program ini.</p>}
    </div>
    {error && <p role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
  </section>;
}
