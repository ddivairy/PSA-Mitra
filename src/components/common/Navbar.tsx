import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import psaLogo from '../../assets/images/2D PSA LOGO.png';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (initialMode?: 'login' | 'register_vol' | 'register_partner') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { 
    role, 
    setRole, 
    currentUser, 
    logoutToPublic, 
    unreadNotifsCount, 
    notifications, 
    markNotificationsAsRead,
    resetAllData 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'volunteer': return 'Relawan Aktif';
      case 'partner': return 'Mitra PSA';
      case 'admin': return 'Admin PSA';
      default: return 'Pengunjung Publik';
    }
  };

  const navLinks = role === 'public' ? [
    { id: 'public-home', label: 'Beranda' },
    { id: 'public-about', label: 'Tentang PSA' },
    { id: 'public-programs', label: 'Program Kolaborasi' },
    { id: 'public-partners', label: 'Mitra Terdaftar' },
    { id: 'public-become-partner', label: 'Kemitraan Baru' },
  ] : role === 'volunteer' ? [
    { id: 'vol-dashboard', label: 'Ringkasan' },
    { id: 'public-programs', label: 'Cari Program' },
    { id: 'vol-applications', label: 'Aplikasi Saya' },
    { id: 'vol-profile', label: 'Profil Relawan' },
  ] : role === 'partner' ? [
    { id: 'part-dashboard', label: 'Dashboard Mitra' },
    { id: 'part-programs', label: 'Program Saya' },
    { id: 'part-participants', label: 'Data Peserta' },
    { id: 'part-analytics', label: 'Analitik Program' },
    { id: 'part-organization', label: 'Profil Organisasi' },
  ] : [
    { id: 'admin-dashboard', label: 'Ikhtisar' },
    { id: 'admin-partnerships', label: 'Pengajuan Kemitraan' },
    { id: 'admin-proposals', label: 'Proposal Program' },
    { id: 'admin-applications', label: 'Seleksi Relawan' },
    { id: 'admin-analytics', label: 'Analitik Wilayah' },
    { id: 'admin-audit', label: 'Audit Log' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Simulation / Role Switching Quick Bar */}
      <div className="bg-[#0B2238] text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#5C80B6]/30">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Mode Simulasi Peran:</span>
          <div className="inline-flex rounded-md p-0.5 bg-slate-900/60 border border-slate-700">
            <button
              onClick={() => { setRole('public'); onNavigate('public-home'); }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                role === 'public' ? 'bg-[#5C80B6] text-white font-medium shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Publik
            </button>
            <button
              onClick={() => { setRole('volunteer'); onNavigate('vol-dashboard'); }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                role === 'volunteer' ? 'bg-[#5C80B6] text-white font-medium shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Relawan
            </button>
            <button
              onClick={() => { setRole('partner'); onNavigate('part-dashboard'); }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                role === 'partner' ? 'bg-[#5C80B6] text-white font-medium shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Mitra
            </button>
            <button
              onClick={() => { setRole('admin'); onNavigate('admin-dashboard'); }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors whitespace-nowrap ${
                role === 'admin' ? 'bg-[#E85D75] text-white font-medium shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin PSA
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="hidden sm:inline">
            Status: <span className="text-white font-medium">{getRoleLabel(role)}</span>
          </span>
          <button
            onClick={() => {
              if (confirm('Reset seluruh data ke kondisi awal simulasi?')) {
                resetAllData();
                onNavigate('public-home');
              }
            }}
            className="flex items-center gap-1 hover:text-white text-slate-400 text-xs transition-colors"
            title="Reset Database Lokal"
          >
            <RotateCcw size={12} />
            <span className="hidden md:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Top Navigation conforming to Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate(role === 'public' ? 'public-home' : role === 'volunteer' ? 'vol-dashboard' : role === 'partner' ? 'part-dashboard' : 'admin-dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <img src={psaLogo} alt="Logo PSA" className="w-10 h-11 object-contain shrink-0" />
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  Partnership Platform
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Kemitraan & Relawan
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                    isActive 
                      ? 'text-blue-600 border-blue-600 font-semibold' 
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action or session actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification bell for logged-in users */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    markNotificationsAsRead();
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 relative transition-colors"
                  aria-label="Notifikasi"
                >
                  <Bell size={18} />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">Notifikasi</span>
                      <span className="text-[11px] text-slate-500">{notifications.length} pembaruan</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-left">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-xs text-slate-500 text-center">Belum ada notifikasi</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If logged in */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs font-medium text-slate-900 block truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {getRoleLabel(role)}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logoutToPublic();
                        onNavigate('public-home');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register_vol')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  Daftar Relawan
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
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
          {!currentUser && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-medium text-slate-700 border border-slate-300 rounded-lg"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register_vol');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-white bg-blue-600 rounded-lg"
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
