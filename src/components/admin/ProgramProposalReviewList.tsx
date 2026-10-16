import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

const numberFormatter = new Intl.NumberFormat('id-ID');

export const ProgramProposalReviewList: React.FC = () => {
  const { programs } = useApp();

  const pendingCount = programs.filter(program =>
    program.proposalStatus === 'submitted' || program.proposalStatus === 'under_review'
  ).length;
  const approvedCount = programs.filter(program => program.proposalStatus === 'approved').length;
  const publishedCount = programs.filter(program => program.publishedStatus === 'published').length;
  const totalRegistrations = programs.reduce((total, program) => total + program.enrolledCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Program</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau progres pendaftaran, keterisian kuota, dan status seluruh program.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan program">
        <article className="rounded-xl border border-amber-300 bg-amber-100 p-4">
          <p className="text-xs font-medium text-amber-800">Menunggu review</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900">{numberFormatter.format(pendingCount)}</p>
        </article>
        <article className="rounded-xl border border-emerald-300 bg-emerald-100 p-4">
          <p className="text-xs font-medium text-emerald-800">Proposal disetujui</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{numberFormatter.format(approvedCount)}</p>
        </article>
        <article className="rounded-xl border border-blue-300 bg-blue-100 p-4">
          <p className="text-xs font-medium text-blue-800">Program dipublikasikan</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-blue-900">{numberFormatter.format(publishedCount)}</p>
        </article>
        <article className="rounded-xl border border-violet-300 bg-violet-100 p-4">
          <p className="text-xs font-medium text-violet-800">Total pendaftaran</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-violet-900">{numberFormatter.format(totalRegistrations)}</p>
        </article>
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
                return (
                  <article key={program.id} className="space-y-3 p-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-slate-900">{program.title}</h3>
                      <p className="mt-0.5 break-words text-xs text-slate-500">{program.partnerName}</p>
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
                    return (
                      <tr key={program.id} className="hover:bg-slate-50">
                        <td className="break-words px-3 py-3.5 xl:px-4">
                          <p className="font-bold text-slate-900">{program.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{program.partnerName}</p>
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
