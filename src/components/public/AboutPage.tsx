import React from 'react';
import { ShieldCheck, Eye, Layers, Lock, Smartphone, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const principles = [
    {
      title: 'Jelas & Terarah',
      desc: 'Pengguna selalu memahami langkah berikutnya tanpa kebingungan alur atau tombol mati.',
      icon: Eye,
    },
    {
      title: 'Transparan',
      desc: 'Status aplikasi relawan dan pengajuan kemitraan dapat dilacak realtime beserta catatan review.',
      icon: CheckCircle2,
    },
    {
      title: 'Terstruktur',
      desc: 'Pemisahan tegas antara akun pengguna, profil organisasi, permohonan kemitraan, proposal program, dan data pendaftar.',
      icon: Layers,
    },
    {
      title: 'Aman & Hak Akses Ketat',
      desc: 'Setiap peran (Relawan, Mitra, Admin) hanya dapat mengakses data sesuai batasan kewenangannya.',
      icon: Lock,
    },
    {
      title: 'Responsif & Adaptif',
      desc: 'Pengalaman formulir multi-langkah dan pemantauan data tetap nyaman di desktop, tablet, dan ponsel.',
      icon: Smartphone,
    },
    {
      title: 'Aksesibel & Inklusif',
      desc: 'Label formulir eksplisit, kontras warna terstandar WCAG AA, dan dukungan navigasi keyboard penuh.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Tentang Platform
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Menghubungkan Niat Baik dengan Tata Kelola Berdampak
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          PSA didirikan sebagai wadah kolaborasi terpusat untuk memberdayakan generasi muda Indonesia melalui aksi sosial nyata yang aman, terstandar, dan dapat dipertanggungjawabkan.
        </p>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Visi Kami</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Menjadi ekosistem kemitraan kerelawanan paling tepercaya di Indonesia yang mampu mengakselerasi pencapaian tujuan pembangunan berkelanjutan (SDGs) melalui sinergi pemuda dan institusi.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Misi Kami</h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Memfasilitasi pemuda Indonesia dengan program kerelawanan yang bermutu dan aman.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Membantu organisasi sosial, yayasan, dan CSR mengelola relawan secara transparan.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Mendokumentasikan data analitik dampak sosial untuk evaluasi kebijakan berkelanjutan.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Prinsip Produk Dokumen PSA */}
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Standar Rancang Bangun
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Prinsip Produk PSA Versi 1.0
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Panduan inti yang melandasi perancangan antarmuka pengguna dan arsitektur data sistem ini:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
