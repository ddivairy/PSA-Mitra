import React, { useState } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Building2, 
  CheckCircle2, 
  FileText,
  TrendingUp,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GeographicGenderAnalytics: React.FC = () => {
  const { partners, programs, applications } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'gender' | 'partners'>('overview');

  // Aggregated calculations
  const totalPartners = partners.length;
  const activeApprovedPartners = partners.filter(p => p.status === 'approved').length;
  const totalPrograms = programs.length;
  const publishedPrograms = programs.filter(p => p.publishedStatus === 'published').length;
  const totalApplicants = applications.length;
  const acceptedApplicants = applications.filter(a => a.status === 'accepted').length;

  // Gender aggregated distribution
  const maleCount = applications.filter(a => a.volunteerGender === 'male').length;
  const femaleCount = applications.filter(a => a.volunteerGender === 'female').length;
  const undisclosedCount = applications.filter(a => !a.volunteerGender || a.volunteerGender === 'prefer_not_to_say').length;
  const totalGender = totalApplicants || 1;

  // City & Province aggregated distribution
  const provinceMap: Record<string, number> = {};
  const cityMap: Record<string, number> = {};

  applications.forEach(app => {
    const c = app.volunteerCity || 'Lainnya';
    cityMap[c] = (cityMap[c] || 0) + 1;
  });

  programs.forEach(p => {
    if (p.province) {
      provinceMap[p.province] = (provinceMap[p.province] || 0) + 1;
    }
  });

  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
  const topProvinces = Object.entries(provinceMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          Laporan Tingkat Platform
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Analitik Geografis, Gender &amp; Dampak PSA</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Visualisasi data agregat sesuai ketentuan pasal 10 rancangan platform untuk audit dan evaluasi strategis.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'overview' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Ikhtisar Ekosistem
        </button>
        <button
          onClick={() => setActiveTab('geography')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'geography' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Sebaran Wilayah &amp; Kota
        </button>
        <button
          onClick={() => setActiveTab('gender')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'gender' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Distribusi Gender &amp; Demografi
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-2.5 transition-colors border-b-2 ${
            activeTab === 'partners' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Performa Mitra &amp; Program
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Mitra Terverifikasi Aktif</span>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {activeApprovedPartners} <span className="text-xs text-slate-400 font-normal">/ {totalPartners}</span>
              </div>
              <span className="text-[11px] text-emerald-600">Lolos seleksi PSA</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Program Dipublikasikan</span>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {publishedPrograms} <span className="text-xs text-slate-400 font-normal">/ {totalPrograms}</span>
              </div>
              <span className="text-[11px] text-blue-600">Terbuka untuk umum</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Total Pendaftar Relawan</span>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {totalApplicants}
              </div>
              <span className="text-[11px] text-slate-400">Seluruh inisiatif</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500">Tingkat Penerimaan Relawan</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                {Math.round((acceptedApplicants / (totalApplicants || 1)) * 100)}%
              </div>
              <span className="text-[11px] text-slate-400">{acceptedApplicants} relawan diterima</span>
            </div>
          </div>

          {/* Program Distribution Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Kapasitas &amp; Rasio Pendaftar Tiap Program
            </h3>
            <div className="space-y-3">
              {programs.map(prog => {
                const pct = Math.min(100, Math.round((prog.enrolledCount / (prog.targetQuota || 1)) * 100));
                return (
                  <div key={prog.id} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{prog.title}</span>
                        <span className="text-slate-500 ml-2">({prog.partnerName})</span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-600">
                        {prog.enrolledCount} / {prog.targetQuota} ({pct}%)
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-600' : 'bg-blue-600'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEOGRAPHY */}
      {activeTab === 'geography' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <span>Sebaran Asal Pendaftar Relawan (Kota/Kab)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{topCities.length} Kota Terdata</span>
            </div>

            <div className="space-y-3">
              {topCities.map(([city, count]) => {
                const pct = Math.round((count / totalGender) * 100);
                return (
                  <div key={city} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-800">{city}</span>
                      <span className="font-mono text-slate-600">{count} Relawan ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-emerald-600" />
                <span>Sebaran Lokasi Pelaksanaan Program (Provinsi)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{topProvinces.length} Provinsi</span>
            </div>

            <div className="space-y-3">
              {topProvinces.map(([prov, count]) => (
                <div key={prov} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{prov}</span>
                    <span className="font-mono text-slate-600">{count} Program Aktif</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(count / (totalPrograms || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GENDER */}
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

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Laki-laki</span>
                <span className="font-mono tabular-nums text-slate-600">{maleCount} Peserta ({Math.round((maleCount / totalGender) * 100)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(maleCount / totalGender) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Perempuan</span>
                <span className="font-mono tabular-nums text-slate-600">{femaleCount} Peserta ({Math.round((femaleCount / totalGender) * 100)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(femaleCount / totalGender) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Memilih Tidak Menjawab</span>
                <span className="font-mono tabular-nums text-slate-600">{undisclosedCount} Peserta ({Math.round((undisclosedCount / totalGender) * 100)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(undisclosedCount / totalGender) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNERS */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Performa &amp; Status Mitra Kemitraan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3">Organisasi</th>
                  <th className="px-5 py-3">Bentuk</th>
                  <th className="px-5 py-3">Status Mitra</th>
                  <th className="px-5 py-3">Jumlah Program</th>
                  <th className="px-5 py-3">Total Peserta Terkumpul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map(p => {
                  const pProgs = programs.filter(pr => pr.partnerId === p.id);
                  const pApps = applications.filter(a => pProgs.map(pr => pr.id).includes(a.programId));
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="px-5 py-3.5 capitalize text-slate-600">{p.type}</td>
                      <td className="px-5 py-3.5"><span className="uppercase text-[11px] font-semibold text-slate-700">{p.status}</span></td>
                      <td className="px-5 py-3.5 font-mono">{pProgs.length} Program</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{pApps.length} Relawan</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
