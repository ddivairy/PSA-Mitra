import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  Building2, 
  HeartHandshake, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Program } from '../../types';

interface PublicLandingProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register_vol' | 'register_partner') => void;
  onSelectProgram: (program: Program) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onNavigate,
  onOpenAuth,
  onSelectProgram,
}) => {
  const { programs, partners } = useApp();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const publishedPrograms = programs.filter(p => p.publishedStatus === 'published').slice(0, 3);

  const faqs = [
    {
      q: 'Apakah membuat akun otomatis menjadikan saya diterima sebagai relawan atau mitra?',
      a: 'Tidak. Sesuai prinsip PSA, pembuatan akun hanya memberikan akses portal. Relawan harus melengkapi profil dan mendaftar ke program spesifik, sementara organisasi wajib mengajukan verifikasi kemitraan resmi sebelum dapat mengirim proposal kolaborasi.',
    },
    {
      q: 'Bagaimana alur persetujuan untuk organisasi mitra baru?',
      a: 'Organisasi mendaftar melalui akun perwakilan, melengkapi profil organisasi dan dokumen pendukung, lalu mengajukan formulir kemitraan. Admin PSA akan meninjau kelengkapan berkas dan dapat menyetujui, meminta revisi dengan catatan perbaikan, atau menolak.',
    },
    {
      q: 'Apakah ada biaya untuk menjadi relawan atau mitra di PSA?',
      a: 'Seluruh pendaftaran relawan dan pengajuan kemitraan program dampak sosial di platform PSA adalah 100% gratis tanpa dipungut biaya apapun.',
    },
    {
      q: 'Apakah saya bisa mendaftar lebih dari satu program volunteer sekaligus?',
      a: 'Bisa, asalkan jadwal pelaksanaan program tidak bertabrakan dan Anda memiliki ketersediaan waktu untuk hadir secara penuh.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                <Sparkles size={14} />
                <span>Platform Resmi Kemitraan & Relawan PSA Versi 1.0</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
                Sinergi Nyata Relawan &amp; Organisasi untuk Indonesia Berdaya
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Wadahi aksi nyata generasi muda melalui program kerelawanan terstruktur, dan buka peluang kolaborasi strategis antara komunitas, yayasan nirlaba, serta korporasi CSR terpercaya.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('public-programs')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Jelajahi Program</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => onOpenAuth('register_vol')}
                  className="px-5 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                >
                  Daftar Jadi Relawan
                </button>
                <button
                  onClick={() => onNavigate('public-become-partner')}
                  className="px-5 py-3 text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Ajukan Kemitraan Mitra
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums">48+</span>
                  <span className="text-xs text-slate-500">Program Terlaksana</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums">3.400+</span>
                  <span className="text-xs text-slate-500">Relawan Terlibat</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums">82+</span>
                  <span className="text-xs text-slate-500">Mitra Terverifikasi</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900 font-mono tabular-nums">12</span>
                  <span className="text-xs text-slate-500">Provinsi Jangkauan</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3] lg:aspect-[16/11] bg-slate-100">
                <img
                  src="/src/assets/images/hero_volunteer_community_1791874040463.jpg"
                  alt="Relawan PSA bergotong royong dalam inisiatif pembangunan sosial desa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white text-xs">
                    <p className="font-semibold text-sm">Kolaborasi Inklusif &amp; Berdampak</p>
                    <p className="text-slate-200 text-[11px] mt-0.5">
                      Setiap program dirancang dengan standar keselamatan, transparansi kuota, dan pendampingan terstruktur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Kesempatan Terbuka
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Program Kolaborasi Unggulan
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Temukan kegiatan kerelawanan yang sesuai dengan minat, keahlian, dan jadwal Anda.
            </p>
          </div>
          <button
            onClick={() => onNavigate('public-programs')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>Lihat Semua Program ({programs.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group cursor-pointer"
              onClick={() => onSelectProgram(prog)}
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={prog.image}
                  alt={prog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-slate-100">
                  {prog.category}
                </div>
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2 py-0.5 rounded">
                  {prog.format.toUpperCase()}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 font-medium">
                    Oleh {prog.partnerName}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prog.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{prog.city || 'Online / Daring'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>Mulai: {prog.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-mono tabular-nums">
                      Kuota: <strong>{prog.enrolledCount}</strong> / {prog.targetQuota}
                    </span>
                    <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-1">
                      Detail Program
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Dual Track: Volunteer & Partner */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Alur Terstruktur &amp; Transparan
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Bagaimana Cara Bergabung?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Alur terpisah antara pendaftaran relawan dan kemitraan organisasi demi akuntabilitas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Volunteer Track */}
            <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alur Relawan (Volunteer)</h3>
                  <p className="text-xs text-slate-500">4 langkah mudah berkontribusi untuk aksi sosial</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Buat Akun &amp; Verifikasi Email</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Daftarkan nama dan email Anda, konfirmasi tautan aktivasi akun.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Lengkapi Profil &amp; Minat</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Isi data domisili, keahlian, dan preferensi kegiatan kerelawanan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pilih &amp; Lamar Program</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Ajukan lamaran ke program yang sesuai tanpa perlu mengisi ulang data dasar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">4</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pantau Status di Dashboard</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Lacak status mulai dari Terkirim, Ditinjau, hingga Diterima secara transparan.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('register_vol')}
                className="w-full py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                Mulai Daftar Relawan
              </button>
            </div>

            {/* Partner Track */}
            <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alur Mitra Baru (Partner)</h3>
                  <p className="text-xs text-slate-500">Mekanisme resmi pengajuan kerja sama organisasi</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Registrasi Akun Perwakilan</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Daftarkan nama PIC resmi dan data dasar entitas organisasi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Lengkapi Profil &amp; Legalitas</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Unggah dokumen identitas/legalitas dan tujuan strategis kolaborasi.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Peninjauan oleh Admin PSA</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Verifikasi berkas kemitraan dengan opsi persetujuan atau perbaikan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">4</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ajukan Proposal Program Kolaborasi</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Setelah disetujui, mitra dapat mempublikasikan program dan mengelola relawan.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('public-become-partner')}
                className="w-full py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-center"
              >
                Pelajari Ketentuan Kemitraan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Partner Logos & Collaboration Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Ekosistem Terpercaya
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Didukung oleh Komunitas, Yayasan, dan Korporasi CSR
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kami membangun standar verifikasi ketat sehingga setiap program yang tayang memiliki kejelasan penanggung jawab dan tujuan sosial yang nyata.
              </p>
              <button
                onClick={() => onNavigate('public-partners')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Lihat Seluruh Direktori Mitra</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4">
              {partners.slice(0, 4).map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B2238] text-white flex items-center justify-center text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{p.sector}</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Status: {p.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#5C80B6] mb-1">
            Tanya Jawab
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl bg-white overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  size={16}
                  className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B2238] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 border border-[#5C80B6]/30 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-xl mx-auto text-balance">
            Siap Berkontribusi Nyata untuk Perubahan Sosial Positif?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Bergabunglah bersama ribuan relawan di seluruh pelosok Indonesia atau ajukan program kemitraan organisasi Anda hari ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('register_vol')}
              className="px-6 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-colors"
            >
              Daftar Sebagai Relawan
            </button>
            <button
              onClick={() => onNavigate('public-become-partner')}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Pelajari Pengajuan Mitra
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
