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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('public-home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0B2238] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[#5C80B6] transition-colors">
                <img src={psaLogo} alt="Logo PSA" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap block leading-tight">
                  Partnership Platform
                </span>
                <span className="text-[10px] text-[#5C80B6] uppercase tracking-wider font-semibold">
                  Kemitraan &amp; Relawan
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 single-line nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#64748B]">
            {publicLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap transition-colors py-1 border-b-2 text-xs sm:text-sm ${
                    isActive 
                      ? 'text-[#0B2238] border-[#0B2238] font-bold' 
                      : 'border-transparent hover:text-[#0F172A] hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Portal Entrance */}
          <div className="flex items-center gap-3 shrink-0">
            {role !== 'public' && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterPortal}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0B2238] hover:bg-[#0B2238]/90 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {role === 'volunteer' && <UserIcon size={14} className="text-[#5C80B6]" />}
                  {role === 'partner' && <Building2 size={14} className="text-[#5C80B6]" />}
                  {role === 'admin' && <ShieldCheck size={14} className="text-[#5C80B6]" />}
                  <span>Masuk ke {getPortalLabel()}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={logoutToPublic}
                  className="p-2 text-[#64748B] hover:text-[#E85D75] rounded-xl hover:bg-slate-100 transition-colors"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Masuk Akun
                </button>
                <button
                  onClick={() => onOpenAuth('register_vol')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0B2238] hover:bg-[#0B2238]/90 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Daftar Relawan
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {publicLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === link.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {role !== 'public' ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  onEnterPortal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#0B2238] rounded-xl"
              >
                Masuk ke {getPortalLabel()}
              </button>
              <button
                onClick={() => {
                  logoutToPublic();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-medium text-[#E85D75] border border-[#E85D75]/30 rounded-xl"
              >
                Keluar Akun
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-medium text-[#0F172A] border border-slate-300 rounded-xl"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register_vol');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-white bg-[#0B2238] rounded-xl"
              >
                Daftar Relawan
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
