import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  ExternalLink, 
  User as UserIcon,
  Building2,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import psaLogo from '../../assets/images/2D PSA LOGO.png';

interface PublicNavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register_vol' | 'register_partner') => void;
  onEnterPortal: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenAuth,
  onEnterPortal,
}) => {
  const { role, currentUser, logoutToPublic } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicLinks = [
    { id: 'public-home', label: 'Beranda' },
    { id: 'public-about', label: 'Tentang PSA' },
    { id: 'public-programs', label: 'Program Kolaborasi' },
    { id: 'public-partners', label: 'Mitra Terdaftar' },
    { id: 'public-become-partner', label: 'Menjadi Mitra' },
  ];

  const getPortalLabel = () => {
    if (role === 'volunteer') return 'Portal Relawan';
    if (role === 'partner') return 'Portal Mitra';
    if (role === 'admin') return 'Admin Dashboard';
    return 'Portal';
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-4 transition-all sm:px-6">
      <div className="mx-auto flex max-w-[1150px] flex-wrap items-center justify-between gap-3 rounded-[30px] bg-[#111c23] px-4 py-3 shadow-[0_16px_35px_rgba(4,17,27,0.18)] sm:flex-nowrap sm:gap-4 sm:rounded-full sm:px-7 sm:py-2.5">
        <div className="flex min-h-10 w-full items-center justify-between gap-3 sm:w-auto">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex shrink-0 items-center gap-3">
            <button 
              onClick={() => onNavigate('public-home')}
              className="group flex items-center gap-2.5 rounded-full text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
                <img src={psaLogo} alt="Logo PSA" className="h-full w-full object-contain" />
              </span>
              <div>
                <span className="block whitespace-nowrap text-sm font-bold leading-tight tracking-tight text-white sm:text-base">
                  Partnership Platform
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[#b5c6d1] sm:text-[10px]">
                  Kemitraan &amp; Relawan
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 single-line nav links */}
          <nav className="hidden items-center gap-1 text-sm font-medium text-white lg:flex xl:gap-2">
            {publicLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-xs transition-colors xl:px-3.5 xl:text-sm ${
                    isActive 
                      ? 'bg-white/15 font-bold text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Portal Entrance */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {role !== 'public' && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterPortal}
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#092d43] transition-colors hover:bg-[#eaf2f7]"
                >
                  {role === 'volunteer' && <UserIcon size={14} className="text-[#3479c5]" />}
                  {role === 'partner' && <Building2 size={14} className="text-[#3479c5]" />}
                  {role === 'admin' && <ShieldCheck size={14} className="text-[#3479c5]" />}
                  <span>Masuk ke {getPortalLabel()}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={logoutToPublic}
                  className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-bold text-[#092d43] transition-colors hover:bg-[#eaf2f7]"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => onOpenAuth('register_vol')}
                  className="whitespace-nowrap rounded-full bg-[#3479c5] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#2868ad]"
                >
                  Daftar Relawan
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-white/30 px-3.5 py-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mx-auto mt-2 max-w-[1150px] space-y-1 rounded-[30px] bg-[#111c23] p-4 shadow-xl lg:hidden">
          {publicLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full rounded-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                currentTab === link.id ? 'bg-white/15 font-bold text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}

          {role !== 'public' ? (
            <div className="space-y-2 border-t border-white/15 pt-4">
              <button
                onClick={() => {
                  onEnterPortal();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full bg-[#3479c5] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#2868ad]"
              >
                Masuk ke {getPortalLabel()}
              </button>
              <button
                onClick={() => {
                  logoutToPublic();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full border border-white/25 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Keluar Akun
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-4">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full bg-white py-3 text-center text-sm font-bold text-[#092d43] transition-colors hover:bg-[#eaf2f7]"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register_vol');
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full bg-[#3479c5] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#2868ad]"
              >
                Daftar Relawan
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </header>
  );
};
