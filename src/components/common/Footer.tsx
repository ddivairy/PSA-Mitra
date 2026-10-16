'use client';

import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
const psaLogo = '/images/2D PSA LOGO.png';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'register_partner') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  const volunteerPortalEnabled = process.env.NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED === 'true';
  return (
    <footer className="bg-[#0B2238] text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#5C80B6] text-white flex items-center justify-center font-bold text-base">
                <img src={psaLogo} alt="Logo PSA" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PSA Partnership Platform
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Platform ekosistem kolaborasi berdampak yang menjembatani generasi muda relawan, organisasi mitra, korporasi CSR, dan inisiatif pemberdayaan masyarakat Indonesia.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>Gedung Kemitraan PSA, Jl. Rasuna Said Kav. B-12, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span>kemitraan@psa-platform.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>(021) 7890-2134 / WhatsApp: 0812-9876-5432</span>
              </div>
            </div>
          </div>

          {/* Kolom 1: Untuk Relawan */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Untuk Relawan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('public-programs')} className="hover:text-white transition-colors">
                  Eksplorasi Program
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('public-programs')} className="hover:text-white transition-colors">
                  Kategori Kegiatan
                </button>
              </li>
              {volunteerPortalEnabled && <li>
                <button onClick={() => onNavigate('vol-dashboard')} className="hover:text-white transition-colors">
                  Panduan Pendaftaran
                </button>
              </li>}
              {volunteerPortalEnabled && <li>
                <button onClick={() => onNavigate('vol-dashboard')} className="hover:text-white transition-colors">
                  Pelacakan Aplikasi
                </button>
              </li>}
              <li>
                <button onClick={() => onNavigate('public-about')} className="hover:text-white transition-colors">
                  Sertifikat & Pengakuan
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Untuk Mitra */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Untuk Mitra
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('public-become-partner')} className="hover:text-white transition-colors">
                  Mengapa Bermitra
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('public-become-partner')} className="hover:text-white transition-colors">
                  Alur Kemitraan Baru
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('register_partner')} className="hover:text-white transition-colors">
                  Form Registrasi Organisasi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('public-partners')} className="hover:text-white transition-colors">
                  Direktori Mitra Aktif
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('register_partner')} className="hover:text-white transition-colors">
                  Daftar Mitra
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kebijakan & Tata Kelola */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Tata Kelola & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('public-about')} className="hover:text-white transition-colors">
                  Tentang PSA & Prinsip
                </button>
              </li>
              <li>
                <span className="text-slate-400">Kode Etik Relawan</span>
              </li>
              <li>
                <span className="text-slate-400">Kebijakan Privasi Data</span>
              </li>
              <li>
                <span className="text-slate-400">Standar Keselamatan Kerja</span>
              </li>
              <li>
                <span className="text-slate-400">FAQ & Bantuan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 PSA Partnership Platform. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              Verifikasi Kemitraan Resmi Terpadu
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
