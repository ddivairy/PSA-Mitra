import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';

export const PartnerAnalyticsView: React.FC = () => {
  const { applications, programs, partners, currentUser } = useApp();

  const currentOrg = partners.find(p => p.id === currentUser?.orgId) || partners[0];
  const orgPrograms = programs.filter(p => p.partnerId === currentOrg?.id);
  const orgProgramIds = orgPrograms.map(p => p.id);
  const orgApps = applications.filter(a => orgProgramIds.includes(a.programId));

  // Gender stats
  const maleCount = orgApps.filter(a => a.volunteerGender === 'male').length;
  const femaleCount = orgApps.filter(a => a.volunteerGender === 'female').length;
  const undisclosedCount = orgApps.filter(a => !a.volunteerGender || a.volunteerGender === 'prefer_not_to_say').length;
  const totalWithGender = orgApps.length || 1;

  const malePercentage = (maleCount / totalWithGender) * 100;
  const femalePercentage = (femaleCount / totalWithGender) * 100;
  const undisclosedPercentage = (undisclosedCount / totalWithGender) * 100;
  const genderChartBackground = orgApps.length > 0
    ? `conic-gradient(from -90deg, #2563eb 0% ${malePercentage}%, #f43f5e ${malePercentage}% ${malePercentage + femalePercentage}%, #94a3b8 ${malePercentage + femalePercentage}% 100%)`
    : '#e2e8f0';

  const provinceByCity = new Map(
    INDONESIA_REGIONS.flatMap(region =>
      region.cities.map(city => [city.trim().toLocaleLowerCase('id-ID'), region.province] as const)
    )
  );
  const geographyMap: Record<string, { count: number; cities: Record<string, number> }> = {};
  orgApps.forEach(a => {
    const city = a.volunteerCity.trim() || 'Kota tidak disebutkan';
    const province = a.volunteerProvince?.trim()
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8 space-y-8">
      {/* KPI stats */}
      <div className="partner-analytics-kpis grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="partner-analytics-kpi-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="partner-analytics-kpi-label text-xs text-slate-500">Total Pendaftar Relawan</span>
          <div className="partner-analytics-kpi-value text-2xl font-bold text-slate-900 font-mono tabular-nums">{orgApps.length}</div>
          <span className="partner-analytics-kpi-caption text-[11px] text-slate-400">Lintas {orgPrograms.length} program</span>
        </div>
        <div className="partner-analytics-kpi-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="partner-analytics-kpi-label text-xs text-slate-500">Relawan Telah Diterima</span>
          <div className="partner-analytics-kpi-value text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {orgApps.filter(a => a.status === 'accepted').length}
          </div>
          <span className="partner-analytics-kpi-caption text-[11px] text-emerald-600">Terverifikasi kehadiran</span>
        </div>
        <div className="partner-analytics-kpi-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="partner-analytics-kpi-label text-xs text-slate-500">Rasio Keterisian Kuota</span>
          <div className="partner-analytics-kpi-value text-2xl font-bold text-blue-700 font-mono tabular-nums">
            {Math.round((orgApps.length / (orgPrograms.reduce((acc, p) => acc + p.targetQuota, 0) || 1)) * 100)}%
          </div>
          <span className="partner-analytics-kpi-caption text-[11px] text-slate-400">Dari target seluruh program</span>
        </div>
      </div>

      {/* 2 Grids: Gender & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Demographics Card */}
        <div className="partner-analytics-gender-card min-w-0 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <span>Distribusi Gender Peserta (Agregat)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Privasi Terjaga</span>
          </div>

          <div className="partner-analytics-gender-layout flex min-w-0 flex-col items-center gap-6 pt-2">
            <div
              className="relative h-48 w-48 max-w-full shrink-0 rounded-full"
              style={{ background: genderChartBackground }}
              role="img"
              aria-label={`Distribusi gender dari ${orgApps.length} pendaftar: ${maleCount} laki-laki, ${femaleCount} perempuan, ${undisclosedCount} memilih tidak menjawab.`}
            >
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold tabular-nums text-slate-900">{orgApps.length}</span>
                <span className="text-xs text-slate-500">Total peserta</span>
              </div>
            </div>
            <ul className="w-full min-w-0 space-y-3 text-xs">
              {[
                { label: 'Laki-laki', count: maleCount, percentage: malePercentage, color: 'bg-blue-600' },
                { label: 'Perempuan', count: femaleCount, percentage: femalePercentage, color: 'bg-rose-500' },
                { label: 'Memilih Tidak Menjawab', count: undisclosedCount, percentage: undisclosedPercentage, color: 'bg-slate-400' },
              ].map(item => (
                <li key={item.label} className="flex min-w-0 items-start justify-between gap-4">
                  <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-800">
                    <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-sm ${item.color}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono tabular-nums text-slate-600">
                    {item.count} ({Math.round(item.percentage)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            *Catatan: Sesuai pasal 10 panduan PSA, analitik gender disajikan tanpa menyimpulkan dari foto atau nama demi kepatuhan etika data.
          </p>
        </div>

        {/* Geographic Breakdown Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              <span>Sebaran Asal Domisili Relawan</span>
            </h3>
            <span className="text-[11px] text-slate-400">Kota / Kabupaten</span>
          </div>

          <div className="space-y-3 pt-2">
            {geographyByProvince.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">Belum ada data domisili pendaftar.</p>
            ) : (
              geographyByProvince.map(({ province, count, cities }) => {
                const provincePercentage = Math.round((count / totalWithGender) * 100);
                return (
                  <section key={province} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <div className="flex justify-between gap-4 text-xs">
                      <span className="font-semibold text-slate-900">{province}</span>
                      <span className="shrink-0 font-mono tabular-nums text-slate-600">
                        {count} Pendaftar ({provincePercentage}%)
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
                                {cityCount} ({cityPercentage}%)
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
    </div>
  );
};
