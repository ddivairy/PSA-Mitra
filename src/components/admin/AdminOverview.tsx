'use client';

import React from 'react';
import { Building2, FolderGit2, UserRoundCheck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const numberFormatter = new Intl.NumberFormat('id-ID');

export const AdminOverview: React.FC = () => {
  const { partners, programs, applications } = useApp();

  const approvedPartners = partners.filter(partner => partner.status === 'approved').length;
  const publishedPrograms = programs.filter(program => program.publishedStatus === 'published').length;
  const activeApplications = applications.filter(application => application.status !== 'withdrawn');
  const participantCount = new Set(activeApplications.map(application => application.volunteerId)).size;
  const pendingApplications = applications.filter(application =>
    application.status === 'submitted' || application.status === 'under_review'
  ).length;

  const metrics = [
    {
      label: 'Total Mitra',
      value: partners.length,
      detail: `${numberFormatter.format(approvedPartners)} mitra terverifikasi`,
      icon: Building2,
      accent: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Program',
      value: programs.length,
      detail: `${numberFormatter.format(publishedPrograms)} program dipublikasikan`,
      icon: FolderGit2,
      accent: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Peserta',
      value: participantCount,
      detail: `${numberFormatter.format(applications.filter(application => application.status === 'accepted').length)} peserta diterima`,
      icon: Users,
      accent: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Pendaftaran',
      value: applications.length,
      detail: `${numberFormatter.format(pendingApplications)} menunggu keputusan`,
      icon: UserRoundCheck,
      accent: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5C80B6]">Ringkasan platform</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#0B2238]">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">Pantau perkembangan mitra, program, dan partisipasi relawan.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistik platform">
        {metrics.map(({ label, value, detail, icon: Icon, accent }) => (
          <article key={label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#0B2238]">
                  {numberFormatter.format(value)}
                </p>
              </div>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${accent}`}>
                <Icon size={21} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

    </div>
  );
};
