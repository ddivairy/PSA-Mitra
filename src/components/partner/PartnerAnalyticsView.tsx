'use client';

import React from 'react';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  PieChart, 
  BarChart3, 
  Calendar,
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  // City distribution
  const cityCounts: Record<string, number> = {};
  orgApps.forEach(a => {
    const c = a.volunteerCity || 'Lainnya';
    cityCounts[c] = (cityCounts[c] || 0) + 1;
  });

  const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          Laporan Agregat Program
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Analitik &amp; Demografi Relawan</h1>
        <p className="text-xs text-slate-500 mt-1">
          Data statistik agregat peserta program <strong>{currentOrg?.name}</strong> untuk evaluasi dampak sosial.
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">Total Pendaftar Relawan</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{orgApps.length}</div>
          <span className="text-[11px] text-slate-400">Lintas {orgPrograms.length} program</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">Relawan Telah Diterima</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {orgApps.filter(a => a.status === 'accepted').length}
          </div>
          <span className="text-[11px] text-emerald-600">Terverifikasi kehadiran</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">Rasio Keterisian Kuota</span>
          <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
            {Math.round((orgApps.length / (orgPrograms.reduce((acc, p) => acc + p.targetQuota, 0) || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400">Dari target seluruh program</span>
        </div>
      </div>

      {/* 2 Grids: Gender & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Demographics Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <span>Distribusi Gender Peserta (Agregat)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Privasi Terjaga</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Laki-laki</span>
                <span className="font-mono tabular-nums text-slate-500">{maleCount} ({Math.round((maleCount / totalWithGender) * 100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(maleCount / totalWithGender) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Perempuan</span>
                <span className="font-mono tabular-nums text-slate-500">{femaleCount} ({Math.round((femaleCount / totalWithGender) * 100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(femaleCount / totalWithGender) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Tidak Menjawab / Netral</span>
                <span className="font-mono tabular-nums text-slate-500">{undisclosedCount} ({Math.round((undisclosedCount / totalWithGender) * 100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(undisclosedCount / totalWithGender) * 100}%` }} />
              </div>
            </div>
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

          <div className="space-y-2.5 pt-2">
            {sortedCities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Belum ada data pendaftar.</p>
            ) : (
              sortedCities.slice(0, 5).map(([city, count]) => {
                const pct = Math.round((count / totalWithGender) * 100);
                return (
                  <div key={city}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{city}</span>
                      <span className="font-mono tabular-nums text-slate-500">{count} Relawan ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
