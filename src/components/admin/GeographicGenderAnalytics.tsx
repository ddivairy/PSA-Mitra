'use client';

import React, { useState } from 'react';
import { 
  ChevronDown,
  MapPin, 
  Users, 
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';

export const GeographicGenderAnalytics: React.FC = () => {
  const { partners, programs, applications } = useApp();
  const numberFormatter = new Intl.NumberFormat('id-ID');

  const [activeTab, setActiveTab] = useState<'geography' | 'gender' | 'partners'>('partners');
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);

  // Aggregated calculations
  const totalApplicants = applications.length;

  // Gender aggregated distribution
  const maleCount = applications.filter(a => a.volunteerGender === 'male').length;
  const femaleCount = applications.filter(a => a.volunteerGender === 'female').length;
  const undisclosedCount = applications.filter(a => !a.volunteerGender || a.volunteerGender === 'prefer_not_to_say').length;
  const totalGender = totalApplicants || 1;
  const malePercentage = (maleCount / totalGender) * 100;
  const femalePercentage = (femaleCount / totalGender) * 100;
  const undisclosedPercentage = (undisclosedCount / totalGender) * 100;
  const maleEnd = malePercentage;
  const femaleEnd = maleEnd + femalePercentage;
  const genderChartBackground = totalApplicants > 0
    ? `conic-gradient(from -90deg, #2563eb 0% ${maleEnd}%, #f43f5e ${maleEnd}% ${femaleEnd}%, #94a3b8 ${femaleEnd}% 100%)`
    : '#e2e8f0';

  // City & province aggregated distribution, using saved applicant province or city lookup for legacy records.
  const geographyMap: Record<string, { count: number; cities: Record<string, number> }> = {};
  const provinceByCity = new Map(
    INDONESIA_REGIONS.flatMap(region =>
      region.cities.map(city => [city.trim().toLocaleLowerCase('id-ID'), region.province] as const)
    )
  );

  applications.forEach(app => {
    const city = app.volunteerCity.trim() || 'Kota tidak disebutkan';
    const province = app.volunteerProvince?.trim()
      || provinceByCity.get(city.toLocaleLowerCase('id-ID'))
      || 'Provinsi tidak diketahui';
    const region = geographyMap[province] ?? { count: 0, cities: {} };
    region.count += 1;
    region.cities[city] = (region.cities[city] || 0) + 1;
    geographyMap[province] = region;
  });

  const geographyByProvince = Object.entries(geographyMap)
    .map(([province, region]) => ({
      province,
      count: region.count,
      cities: Object.entries(region.cities).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'id')),
    }))
    .sort((a, b) => b.count - a.count || a.province.localeCompare(b.province, 'id'));
  const topProvinces = geographyByProvince.map(region => [region.province, region.count] as const);
  const partnerStats = partners.map(partner => {
    const partnerPrograms = programs.filter(program => program.partnerId === partner.id);
    const programIds = new Set(partnerPrograms.map(program => program.id));
    const partnerApplications = applications.filter(application => programIds.has(application.programId));
    return {
      partner,
      programs: partnerPrograms,
      applications: partnerApplications,
      accepted: partnerApplications.filter(application => application.status === 'accepted').length,
    };
  });
  const programStats = programs.map(program => {
    const programApplications = applications.filter(application => application.programId === program.id);
    return {
      program,
      applications: programApplications.length,
      accepted: programApplications.filter(application => application.status === 'accepted').length,
      quotaProgress: program.targetQuota > 0
        ? Math.min(100, Math.round((program.enrolledCount / program.targetQuota) * 100))
        : 0,
    };
  });

  const handleExportReport = () => {
    const rows: string[][] = [
      ['Bagian', 'Nama', 'Status / Kategori', 'Jumlah program', 'Pendaftar', 'Detail'],
      ...partnerStats.map(({ partner, programs: partnerPrograms, applications: partnerApplications, accepted }) => [
        'Mitra',
        partner.name,
        partner.status,
        String(partnerPrograms.length),
        String(partnerApplications.length),
        `Diterima: ${accepted}; sektor: ${partner.sector}`,
      ]),
      ...programStats.map(({ program, applications: programApplicationCount, accepted, quotaProgress }) => [
        'Program',
        program.title,
        `${program.proposalStatus} / ${program.publishedStatus}`,
        String(programApplicationCount),
        String(program.enrolledCount),
        `Mitra: ${program.partnerName}; kategori: ${program.category}; diterima: ${accepted}; kuota: ${program.enrolledCount}/${program.targetQuota} (${quotaProgress}%)`,
      ]),
      ['Gender', 'Laki-laki', '', '', String(maleCount), `Persentase: ${Math.round((maleCount / totalGender) * 100)}%`],
      ['Gender', 'Perempuan', '', '', String(femaleCount), `Persentase: ${Math.round((femaleCount / totalGender) * 100)}%`],
      ['Gender', 'Tidak menjawab', '', '', String(undisclosedCount), `Persentase: ${Math.round((undisclosedCount / totalGender) * 100)}%`],
      ...geographyByProvince.flatMap(({ province, cities }) =>
        cities.map(([city, count]) => ['Kota pendaftar', city, '', '', String(count), `Provinsi: ${province}`])
      ),
      ...topProvinces.map(([province, count]) => ['Provinsi pendaftar', province, '', '', String(count), 'Jumlah pendaftaran']),
    ];
    const csv = `\uFEFF${rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-analytics-psa-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Tabs */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-600 shadow-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
        <div className="flex min-w-0 flex-wrap gap-x-4 sm:flex-1 sm:gap-x-6">
          <button
            onClick={() => setActiveTab('geography')}
            className={`border-b-2 pb-2.5 transition-colors ${
              activeTab === 'geography' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sebaran Wilayah &amp; Kota
          </button>
          <button
            onClick={() => setActiveTab('gender')}
            className={`border-b-2 pb-2.5 transition-colors ${
              activeTab === 'gender' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Distribusi Gender &amp; Demografi
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`border-b-2 pb-2.5 transition-colors ${
              activeTab === 'partners' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Performa Mitra &amp; Program
          </button>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 sm:w-auto"
        >
          <Download size={15} aria-hidden="true" />
          Export laporan CSV
        </button>
      </div>

      {/* TAB 1: GEOGRAPHY */}
      {activeTab === 'geography' && (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <span>Sebaran Asal Pendaftar Relawan per Provinsi &amp; Kota/Kab</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{geographyByProvince.length} Provinsi</span>
            </div>

            <p className="text-[11px] text-slate-500">
              Bar provinsi menunjukkan persentase dari seluruh pendaftar; bar kota menunjukkan persentase di dalam provinsi.
            </p>
            <div className="space-y-3">
              {geographyByProvince.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">Belum ada data domisili pendaftar.</p>
              ) : (
                geographyByProvince.map(({ province, count, cities }) => {
                  const provincePercentage = Math.round((count / totalGender) * 100);
                  return (
                    <section key={province} className="space-y-2 rounded-lg bg-slate-50 p-3">
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="font-semibold text-slate-900">{province}</span>
                        <span className="shrink-0 font-mono tabular-nums text-slate-600">
                          {numberFormatter.format(count)} Pendaftar ({provincePercentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${provincePercentage}%` }} />
                      </div>
                      <div className="ml-3 space-y-2 border-l-2 border-blue-100 pl-3 pt-1">
                        {cities.map(([city, cityCount]) => {
                          const cityPercentage = Math.round((cityCount / count) * 100);
                          return (
                            <div key={city} className="space-y-1 text-xs">
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-700">{city}</span>
                                <span className="shrink-0 font-mono tabular-nums text-slate-500">
                                  {numberFormatter.format(cityCount)} ({cityPercentage}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${cityPercentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENDER */}
      {activeTab === 'gender' && (
        <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Distribusi Gender Relawan Seluruh Platform (Agregat)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data hanya disajikan dalam bentuk agregat statistik tanpa menyimpulkan dari nama atau foto.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
            <div
              className="relative h-48 w-48 shrink-0 rounded-full"
              style={{ background: genderChartBackground }}
              role="img"
              aria-label={`Distribusi gender dari ${totalApplicants} pendaftar: ${maleCount} laki-laki, ${femaleCount} perempuan, ${undisclosedCount} memilih tidak menjawab.`}
            >
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold tabular-nums text-slate-900">{numberFormatter.format(totalApplicants)}</span>
                <span className="text-xs text-slate-500">Total peserta</span>
              </div>
            </div>
            <ul className="w-full space-y-3 text-xs sm:max-w-xs">
              {[
                { label: 'Laki-laki', count: maleCount, percentage: malePercentage, color: 'bg-blue-600' },
                { label: 'Perempuan', count: femaleCount, percentage: femalePercentage, color: 'bg-rose-500' },
                { label: 'Memilih Tidak Menjawab', count: undisclosedCount, percentage: undisclosedPercentage, color: 'bg-slate-400' },
              ].map(item => (
                <li key={item.label} className="flex items-start justify-between gap-4">
                  <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-800">
                    <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-sm ${item.color}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono tabular-nums text-slate-600">
                    {numberFormatter.format(item.count)} ({Math.round(item.percentage)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERS */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900">Performa Mitra Kemitraan</h3>
            <p className="mt-1 text-xs text-slate-500">Pilih mitra untuk melihat grafik progres programnya.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {partnerStats.map(({ partner, programs: partnerPrograms, applications: partnerApplications, accepted }) => {
              const isExpanded = expandedPartnerId === partner.id;
              const partnerProgramStats = programStats.filter(item => item.program.partnerId === partner.id);
              const panelId = `partner-programs-${partner.id}`;
              return (
                <section key={partner.id}>
                  <h4>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => setExpandedPartnerId(isExpanded ? null : partner.id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
                    >
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-bold text-slate-900">{partner.name}</span>
                        <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-normal text-slate-500">
                          <span>{numberFormatter.format(partnerPrograms.length)} Program</span>
                          <span>
                            {numberFormatter.format(partnerApplications.length)} Pendaftar
                            <span className="text-emerald-700"> · {numberFormatter.format(accepted)} diterima</span>
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h4>
                  {isExpanded && (
                    <div id={panelId} className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                      <h5 className="text-xs font-bold text-slate-800">Progres program · keterisian target relawan</h5>
                      {partnerProgramStats.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
                          Mitra ini belum memiliki program.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                          {partnerProgramStats.map(({ program, applications: applicationCount, accepted: programAccepted, quotaProgress }) => (
                            <article key={program.id} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                              <div className="min-w-0">
                                <h6 className="break-words text-xs font-semibold text-slate-800">{program.title}</h6>
                              </div>
                              <dl className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <dt className="text-slate-500">Pendaftar</dt>
                                  <dd className="mt-0.5 font-mono text-slate-700">{numberFormatter.format(applicationCount)}</dd>
                                </div>
                                <div>
                                  <dt className="text-slate-500">Diterima</dt>
                                  <dd className="mt-0.5 font-mono text-slate-700">{numberFormatter.format(programAccepted)}</dd>
                                </div>
                                <div className="col-span-2">
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <dt className="text-slate-500">Kapasitas terisi</dt>
                                    <dd className="font-mono tabular-nums text-slate-700">
                                      {numberFormatter.format(program.enrolledCount)}/{numberFormatter.format(program.targetQuota)} ({quotaProgress}%)
                                    </dd>
                                  </div>
                                  <div
                                    className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
                                    role="progressbar"
                                    aria-label={`Kapasitas terisi ${program.title}`}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={quotaProgress}
                                  >
                                    <div
                                      className={`h-full rounded-full transition-[width] ${quotaProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                      style={{ width: `${quotaProgress}%` }}
                                    />
                                  </div>
                                </div>
                              </dl>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
