'use client';

import React, { useState } from 'react';
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
  const { programs, applications, reviewProgramProposal } = useApp();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const pendingPrograms = programs.filter(program => ['submitted', 'under_review', 'revision_required'].includes(program.proposalStatus));

  const toggleParticipants = (programId: string) => {
    setSelectedProgramId(currentId => currentId === programId ? null : programId);
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
            <div className="flex flex-wrap gap-2"><button onClick={() => void reviewProgramProposal(program.id, 'approved')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Setujui &amp; publikasikan</button><button onClick={() => void reviewProgramProposal(program.id, 'revision_required', 'Mohon perbaiki proposal program.')} className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800">Minta revisi</button><button onClick={() => void reviewProgramProposal(program.id, 'rejected', 'Proposal belum dapat disetujui.')} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Tolak</button></div>
          </article>)}
          {!pendingPrograms.length && <p className="py-5 text-center text-sm text-slate-500">Tidak ada proposal menunggu review.</p>}
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
    </div>
  );
};
