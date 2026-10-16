'use client';

import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Users, 
  CheckCircle2, 
  Briefcase, 
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BecomePartnerLandingProps {
  onOpenAuth: (mode?: 'login' | 'register_partner') => void;
  onNavigate: (tab: string) => void;
}

export const BecomePartnerLanding: React.FC<BecomePartnerLandingProps> = ({
  onOpenAuth,
  onNavigate,
}) => {
  const { role, currentUser } = useApp();

  const benefits = [
    {
      title: 'Akses ke Jejaring Relawan Muda Berdaya',
      desc: 'Lebih dari 3.400 pemuda, mahasiswa, dan profesional dengan latar belakang lintas keahlian siap mendukung inisiatif sosial Anda.',
      icon: Users,
    },
    {
      title: 'Verifikasi & Standar Keamanan Baku',
      desc: 'Setiap program dipastikan memenuhi standar etika, keselamatan peserta, dan tata kelola perlindungan data yang jelas.',
      icon: ShieldCheck,
    },
    {
      title: 'Platform Manajemen & Laporan Terpadu',
      desc: 'Dashboard mandiri untuk menyeleksi pelamar, mencatat absensi, memantau sebaran demografi, dan mengekspor data peserta.',
      icon: FileCheck2,
    },
    {
      title: 'Pengakuan & Publikasi Kolaboratif',
      desc: 'Meningkatkan eksposur program dampak organisasi Anda di kanal resmi PSA dan direktori publik mitra terverifikasi.',
      icon: Sparkles,
    },
  ];

  const requiredDocuments = [
    { name: 'Legalitas Badan Usaha / Yayasan', desc: 'Akta Pendirian, SK Kemenkumham, atau NIB bagi entitas berbadan hukum.' },
    { name: 'Profil Lembaga / Company Profile', desc: 'Ringkasan visi misi, portofolio kegiatan 1 tahun terakhir, dan susunan pengurus.' },
    { name: 'Surat Komitmen Kemitraan PSA', desc: 'Surat resmi yang ditandatangani perwakilan pimpinan lembaga bermaterai.' },
    { name: 'Identitas & Penugasan PIC', desc: 'Surat tugas atau kartu identitas narahubung resmi organisasi.' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <Building2 size={14} />
                <span>Gerbang Kemitraan Strategis PSA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
                Perluas Jangkauan Dampak Sosial Organisasi Anda Bersama PSA
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                Bermitra dengan PSA membuka sinergi antara misi mulia organisasi Anda dan energi ribuan relawan terampil di seluruh Indonesia melalui mekanisme program yang transparan dan akuntabel.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (role === 'partner') {
                      onNavigate('part-dashboard');
                    } else {
                      onOpenAuth('register_partner');
                    }
                  }}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>{role === 'partner' ? 'Buka Dashboard Mitra' : 'Ajukan Kemitraan Baru'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3] bg-slate-100">
                <img
                  src="/images/partner_collaboration_handshake_1791874040258.jpg"
                  alt="Pertemuan strategis kemitraan PSA dan organisasi mitra"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilar Manfaat */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Nilai Tambah
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Mengapa Memilih Bermitra dengan PSA?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dokumen & Persyaratan Awal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 space-y-6">
          <div className="max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
              Kesiapan Administrasi
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Dokumen Persyaratan Awal Pengajuan
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Untuk menjamin kredibilitas dan perlindungan bagi peserta relawan, seluruh pengajuan kemitraan wajib menyertakan dokumen berikut:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alur Kemitraan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Tahapan Jelas
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Alur Kemitraan &amp; Persetujuan Program
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 relative">
            <span className="text-xs font-mono font-bold text-blue-600">Langkah 01</span>
            <h4 className="text-sm font-bold text-slate-900">Registrasi Akun PIC</h4>
            <p className="text-xs text-slate-600">Perwakilan resmi membuat akun dan memverifikasi alamat email dinas/kantor.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 relative">
            <span className="text-xs font-mono font-bold text-blue-600">Langkah 02</span>
            <h4 className="text-sm font-bold text-slate-900">Lengkapi Profil &amp; Berkas</h4>
            <p className="text-xs text-slate-600">Isi data domisili, profil organisasi, dan unggah dokumen legalitas pendukung.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 relative">
            <span className="text-xs font-mono font-bold text-blue-600">Langkah 03</span>
            <h4 className="text-sm font-bold text-slate-900">Review oleh Admin PSA</h4>
            <p className="text-xs text-slate-600">Tim PSA meninjau kelayakan (status: Disetujui, Perlu Revisi, atau Ditolak).</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 relative">
            <span className="text-xs font-mono font-bold text-blue-600">Langkah 04</span>
            <h4 className="text-sm font-bold text-slate-900">Pengajuan Proposal Program</h4>
            <p className="text-xs text-slate-600">Setelah kemitraan resmi, mitra dapat mengajukan proposal kolaborasi spesifik.</p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B2238] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-[#5C80B6]/30 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold">Mari Mulai Langkah Kolaborasi Bersama PSA</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Proses pengajuan kemitraan dapat diselesaikan dalam waktu kurang dari 15 menit melalui portal digital kami.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenAuth('register_partner')}
              className="px-6 py-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-colors"
            >
              Mulai Pendaftaran Kemitraan Organisasi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
