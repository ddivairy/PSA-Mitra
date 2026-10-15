import React, { useEffect, useState } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

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
    <header className="sticky top-0 z-40 w-full px-3 transition-all sm:px-5 lg:px-7">
      <div className={`mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-x-3 gap-y-0 rounded-2xl px-4 py-2.5 transition-all duration-300 ease-out sm:flex-nowrap sm:gap-4 sm:px-6 xl:px-8 ${
        isScrolled
          ? 'bg-[#111c23]/92 shadow-[0_8px_20px_rgba(4,17,27,0.16)] backdrop-blur-sm'
          : 'bg-[#111c23] shadow-[0_4px_14px_rgba(4,17,27,0.12)]'
      }`}>
        <div className="flex min-h-10 w-full items-center justify-between gap-3 xl:w-auto xl:flex-1">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex shrink-0 items-center gap-3">
            <button 
              onClick={() => onNavigate('public-home')}
              className="group flex items-center gap-2.5 rounded-full text-left"
            >
              <img src={psaLogo} alt="Logo PSA" className="h-11 w-10 shrink-0 object-contain" />
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
          <nav className="hidden flex-1 items-center justify-center gap-0.5 text-sm font-medium text-white xl:flex xl:gap-1.5">
            {publicLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap rounded-lg px-2 py-2 text-xs transition-colors xl:px-3 xl:text-sm ${
                    isActive 
                      ? 'bg-white/10 font-semibold text-white'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Portal Entrance */}
          <div className="hidden shrink-0 items-center justify-end gap-2 xl:flex xl:flex-1">
            {role !== 'public' && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterPortal}
                  className="flex items-center gap-1.5 rounded-xl bg-[#3479c5] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2868ad]"
                >
                  {role === 'volunteer' && <UserIcon size={14} className="text-[#3479c5]" />}
                  {role === 'partner' && <Building2 size={14} className="text-[#3479c5]" />}
                  {role === 'admin' && <ShieldCheck size={14} className="text-[#3479c5]" />}
                  <span>Masuk ke {getPortalLabel()}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={logoutToPublic}
                  className="rounded-lg p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => onOpenAuth('register_vol')}
                  className="whitespace-nowrap rounded-xl bg-[#3479c5] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2868ad]"
                >
                  Daftar Relawan
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/20 px-3 py-2 text-white transition-colors hover:bg-white/10 xl:hidden"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="w-full space-y-1 border-t border-white/10 pt-3 xl:hidden">
          {publicLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                currentTab === link.id ? 'bg-white/10 font-semibold text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'
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
                className="w-full rounded-xl bg-[#3479c5] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2868ad]"
              >
                Masuk ke {getPortalLabel()}
              </button>
              <button
                onClick={() => {
                  logoutToPublic();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-xl border border-white/20 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
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
                className="w-full rounded-xl border border-white/20 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register_vol');
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-xl bg-[#3479c5] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2868ad]"
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
