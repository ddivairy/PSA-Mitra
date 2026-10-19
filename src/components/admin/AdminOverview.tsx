'use client';

import React, { useState } from 'react';
import { Building2, FolderGit2, UserRoundCheck, Users, TrendingDown, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const numberFormatter = new Intl.NumberFormat('id-ID');
const TREND_YEARS = 5;
const chartWidth = 640;
const chartHeight = 300;
const chartPadding = { top: 24, right: 20, bottom: 42, left: 54 };

type TrendMetric = 'partners' | 'programs' | 'applications';

const getRecordYear = (date: string) => {
  const year = Number(date.slice(0, 4));
  return /^\d{4}/.test(date) && Number.isInteger(year) ? year : null;
};

export const AdminOverview: React.FC = () => {
  const { partners, programs, applications } = useApp();
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('partners');

  const approvedPartners = partners.filter(partner => partner.status === 'approved').length;
  const publishedPrograms = programs.filter(program => program.publishedStatus === 'published').length;
  const activeApplications = applications.filter(application => application.status !== 'withdrawn');
  const participantCount = new Set(activeApplications.map(application => application.volunteerId)).size;
  const pendingApplications = applications.filter(application =>
    application.status === 'submitted' || application.status === 'under_review'
  ).length;
  const currentYear = new Date().getFullYear();
  const trendYears = Array.from({ length: TREND_YEARS }, (_, index) => currentYear - TREND_YEARS + 1 + index);
  const trendSources = {
    partners: partners.map(partner => partner.createdAt),
    programs: programs.map(program => program.createdAt),
    applications: applications.map(application => application.submittedAt),
  };
  const trendData = trendYears.map(year => ({
    year,
    count: trendSources[trendMetric].filter(date => getRecordYear(date) === year).length,
  }));
  const previousYearCount = trendData[trendData.length - 2]?.count ?? 0;
  const currentYearCount = trendData[trendData.length - 1]?.count ?? 0;
  const trendDifference = currentYearCount - previousYearCount;
  const trendLabel = trendMetric === 'partners'
    ? 'Mitra baru'
    : trendMetric === 'programs'
      ? 'Program baru'
      : 'Pendaftaran relawan';
  const maxCount = Math.max(...trendData.map(point => point.count), 1);
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const points = trendData.map((point, index) => ({
    ...point,
    x: chartPadding.left + (trendData.length === 1 ? 0 : index * plotWidth / (trendData.length - 1)),
    y: chartPadding.top + plotHeight - (point.count / maxCount) * plotHeight,
  }));
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartPadding.top + plotHeight} L ${points[0].x} ${chartPadding.top + plotHeight} Z`;
  const yAxisTicks = Array.from({ length: 4 }, (_, index) => Math.round(maxCount * (3 - index) / 3));

  const metrics = [
    {
      label: 'Total Mitra',
      value: partners.length,
      detail: `${numberFormatter.format(approvedPartners)} mitra terverifikasi`,
      icon: Building2,
      accent: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Total Program',
      value: programs.length,
      detail: `${numberFormatter.format(publishedPrograms)} program dipublikasikan`,
      icon: FolderGit2,
      accent: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Peserta',
      value: participantCount,
      detail: `${numberFormatter.format(applications.filter(application => application.status === 'accepted').length)} peserta diterima`,
      icon: Users,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Pendaftaran',
      value: applications.length,
      detail: `${numberFormatter.format(pendingApplications)} menunggu keputusan`,
      icon: UserRoundCheck,
      accent: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="space-y-6">
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

      <section className="card p-5 sm:p-6" aria-labelledby="annual-trend-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5C80B6]">Perkembangan platform</p>
            <h3 id="annual-trend-heading" className="mt-1 text-lg font-bold text-[#0B2238]">Tren Tahunan</h3>
            <p className="mt-1 text-xs text-slate-500">Jumlah data baru yang tercatat setiap tahun.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="sr-only">Pilih data tren tahunan</span>
            <select
              value={trendMetric}
              onChange={event => setTrendMetric(event.target.value as TrendMetric)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#5C80B6] focus:outline-none focus:ring-2 focus:ring-[#5C80B6]/20"
            >
              <option value="partners">Mitra baru</option>
              <option value="programs">Program baru</option>
              <option value="applications">Pendaftaran relawan</option>
            </select>
          </label>
        </div>

        <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-center">
          <div
            className="min-w-0"
            role="img"
            aria-label={`${trendLabel} per tahun: ${trendData.map(point => `${point.year}, ${point.count}`).join('; ')}`}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="mx-auto block h-auto w-full max-w-[480px]"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="annual-trend-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#5C80B6" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#5C80B6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {yAxisTicks.map((tick, index) => {
                const y = chartPadding.top + index * plotHeight / (yAxisTicks.length - 1);
                return (
                  <g key={`${tick}-${index}`}>
                    <line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 5" />
                    <text x={chartPadding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                      {numberFormatter.format(tick)}
                    </text>
                  </g>
                );
              })}
              <path d={areaPath} fill="url(#annual-trend-fill)" />
              <path d={linePath} fill="none" stroke="#5C80B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map(point => (
                <g key={point.year}>
                  <title>{`${point.year}: ${numberFormatter.format(point.count)} ${trendLabel.toLowerCase()}`}</title>
                  <circle cx={point.x} cy={point.y} r="5" fill="white" stroke="#5C80B6" strokeWidth="3" />
                  <text x={point.x} y={chartHeight - 12} textAnchor="middle" className="fill-slate-500 text-[11px]">
                    {point.year}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{trendLabel} · {currentYear}</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#0B2238]">{numberFormatter.format(currentYearCount)}</p>
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${
              trendDifference > 0 ? 'text-emerald-700' : trendDifference < 0 ? 'text-rose-700' : 'text-slate-500'
            }`}>
              {trendDifference > 0 ? <TrendingUp size={15} /> : trendDifference < 0 ? <TrendingDown size={15} /> : null}
              <span>
                {trendDifference > 0
                  ? `Naik ${numberFormatter.format(trendDifference)}`
                  : trendDifference < 0
                    ? `Turun ${numberFormatter.format(Math.abs(trendDifference))}`
                    : 'Sama dengan tahun lalu'}
                {' '}dari {numberFormatter.format(previousYearCount)} ({currentYear - 1})
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Data dihitung berdasarkan tanggal pencatatan. Tahun berjalan masih berlangsung.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
