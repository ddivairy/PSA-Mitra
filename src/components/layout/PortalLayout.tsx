import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  LogOut, 
  Home,
  FileText,
  UserCheck,
  FolderGit2,
  BarChart3,
  LayoutDashboard,
  Gauge,
  Search,
  Bell,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import psaLogo from '../../assets/images/2D PSA LOGO.png';

interface PortalNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

interface PortalLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onGoToPublic: () => void;
  onOpenQuickAction?: () => void;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  currentTab,
  onNavigate,
  onGoToPublic,
  onOpenQuickAction,
  children,
}) => {
  const { 
    role, 
    currentUser, 
    logoutToPublic, 
    unreadNotifsCount,
    notifications,
    markNotificationsAsRead,
    partners,
    applications,
    programs
  } = useApp();

  const [topSearchQuery, setTopSearchQuery] = useState('');
  const [railExpanded, setRailExpanded] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (railExpanded && railRef.current && !railRef.current.contains(event.target as Node)) setRailExpanded(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, [railExpanded]);

  useEffect(() => setRailExpanded(false), [currentTab]);

  const pendingPartnerships = partners.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const pendingProposals = programs.filter(p => p.proposalStatus === 'submitted' || p.proposalStatus === 'under_review').length;
  const volunteerPending = applications.filter(a => (a.volunteerId === currentUser?.id) && (a.status === 'under_review' || a.status === 'submitted')).length;

  let navItems: PortalNavItem[] = [];
  if (role === 'volunteer') {
    navItems = [
      { id: 'vol-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'vol-applications', label: 'Aplikasi Saya', icon: FileText, badge: volunteerPending > 0 ? `${volunteerPending}` : undefined },
      { id: 'vol-profile', label: 'Profil Saya', icon: UserCheck },
      { id: 'public-programs', label: 'Program PSA', icon: Search },
    ];
  } else if (role === 'partner') {
    navItems = [
      { id: 'part-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'part-programs', label: 'Program Kolaborasi', icon: FolderGit2 },
      { id: 'part-participants', label: 'Data Relawan', icon: Users },
      { id: 'part-analytics', label: 'Analitik Program', icon: BarChart3 },
      { id: 'part-organization', label: 'Profil Organisasi', icon: Building2 },
    ];
  } else if (role === 'admin') {
    navItems = [
      { id: 'admin-overview', label: 'Overview', icon: Gauge },
      { id: 'admin-partnerships', label: 'Mitra', icon: Building2, badge: pendingPartnerships > 0 ? `${pendingPartnerships}` : undefined },
      { id: 'admin-proposals', label: 'Program', icon: FolderGit2, badge: pendingProposals > 0 ? `${pendingProposals}` : undefined },
      { id: 'admin-applications', label: 'Peserta', icon: Users },
      { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
    ];
  }

  const currentOrg = partners.find(partner => partner.id === currentUser?.orgId) || partners[0];
  const orgPrograms = programs.filter(program => program.partnerId === currentOrg?.id);
  const orgProgramIds = orgPrograms.map(program => program.id);
  const orgApplications = applications.filter(application => orgProgramIds.includes(application.programId));
  const userApplications = applications.filter(application => application.volunteerId === currentUser?.id || application.volunteerEmail === currentUser?.email);
  const pageTitle = navItems.find(item => item.id === currentTab)?.label || 'Dashboard';
  const roleLabel = role === 'admin' ? 'Admin PSA' : role === 'partner' ? 'Mitra' : 'Relawan';
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Pengguna';
  const userInitial = userName.charAt(0).toUpperCase();
  const kpis = role === 'admin'
    ? [
        { label: 'Mitra menunggu', value: pendingPartnerships },
        { label: 'Proposal ditinjau', value: pendingProposals },
        { label: 'Total aplikasi', value: applications.length },
        { label: 'Mitra disetujui', value: partners.filter(partner => partner.status === 'approved').length },
      ]
    : role === 'partner'
      ? [
          { label: 'Program', value: orgPrograms.length },
          { label: 'Relawan mendaftar', value: orgApplications.length },
          { label: 'Program aktif', value: orgPrograms.filter(program => program.publishedStatus === 'published').length },
          { label: 'Status kemitraan', value: currentOrg?.status === 'approved' ? 'Aktif' : 'Review' },
        ]
      : [
          { label: 'Aplikasi terkirim', value: userApplications.length },
          { label: 'Sedang ditinjau', value: userApplications.filter(application => ['submitted', 'under_review'].includes(application.status)).length },
          { label: 'Diterima', value: userApplications.filter(application => application.status === 'accepted').length },
          { label: 'Program tersedia', value: programs.filter(program => program.publishedStatus === 'published').length },
        ];
  const handleActionClick = () => {
    if (onOpenQuickAction) {
      onOpenQuickAction();
    } else if (role === 'volunteer') {
      onNavigate('public-programs');
    } else if (role === 'partner') {
      onNavigate('part-programs');
    } else {
      onNavigate('admin-proposals');
    }
  };

  const getActionLabel = () => {
    if (role === 'volunteer') return '+ Jelajahi Program';
    if (role === 'partner') return '+ Buat Program';
    return '+ Evaluasi Baru';
  };

  return (
    <div className="app-wrapper">
      {/* 
        ========================================================================
        AUTHENTIC SIDE RAIL NAVIGATION (from style.html)
        - .side-rail with curved organic border: 0 42px 60px 0 / 0 16% 23% 0
        - expands to 256px on hover/focus-within or via tap toggle on mobile
        - visible on both mobile and desktop
        ========================================================================
      */}
      <aside
        ref={railRef}
        className={`side-rail ${railExpanded ? 'expanded' : ''}`}
        aria-label="Main navigation"
        onMouseLeave={() => {
          if (document.activeElement instanceof HTMLElement && railRef.current?.contains(document.activeElement)) document.activeElement.blur();
        }}
      >
        <div
          className="rail-brand cursor-pointer select-none"
          onClick={() => setRailExpanded(expanded => !expanded)}
          title={railExpanded ? 'Ciutkan Menu' : 'Perluas Menu'}
          role="button"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') setRailExpanded(expanded => !expanded);
          }}
        >
          <img src={psaLogo} alt="Logo PSA" className="h-[34px] w-[34px] shrink-0 object-contain" />
          <div className="flex flex-1 overflow-hidden">
            <span className="brand-name font-black tracking-wider text-sm">PORTAL PSA</span>
          </div>
        </div>

        <nav className="rail-nav" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  (e.currentTarget as HTMLElement).blur();
                  setRailExpanded(false);
                  onNavigate(item.id);
                }}
                className={`rail-link ${isActive ? 'active' : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="rail-icon-slot">
                  <Icon size={20} className="h-6 w-6 shrink-0" />
                </span>
                <span className="rail-label truncate flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 mr-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E85D75] text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {/* Quick links to Public Web & Logout */}
          <div className="pt-4 mt-2 border-t border-white/10 space-y-1">
            <button
              type="button"
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                setRailExpanded(false);
                onGoToPublic();
              }}
              className="rail-link text-slate-300 hover:text-white"
              title="Kunjungi Web Publik"
            >
              <span className="rail-icon-slot">
                <Home size={18} className="h-6 w-6 shrink-0" />
              </span>
              <span className="rail-label text-xs">Web Publik</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                setRailExpanded(false);
                logoutToPublic();
              }}
              className="rail-link text-[#E85D75] hover:bg-[#E85D75]/20"
              title="Keluar"
            >
              <span className="rail-icon-slot">
                <LogOut size={18} className="h-6 w-6 shrink-0" />
              </span>
              <span className="rail-label text-xs font-bold text-[#E85D75]">Keluar</span>
            </button>
          </div>
        </nav>
      </aside>

      {railExpanded && (
        <div className="fixed inset-0 z-40 bg-[#0B2238]/30 backdrop-blur-[1px]" onClick={() => setRailExpanded(false)} aria-hidden="true" />
      )}

      {/* 
        ========================================================================
        WORKSPACE CONTAINER & TOPBAR (from style.html)
        ========================================================================
      */}
      <div className="workspace">
        <div className="dashboard-canvas">
        <header className="topbar">
          <div className="page-heading">
            <h1>{pageTitle}</h1>
            <div className="breadcrumbs"><span>Portal PSA</span><span>/</span><span>{roleLabel}</span><span>/</span><span>{pageTitle}</span></div>
          </div>

          <div className="top-actions">
            {/* Search Shell */}
            <label className="search-shell" htmlFor="top-search">
              <Search size={16} className="text-[#64748B] shrink-0" aria-hidden="true" />
              <input
                id="top-search"
                type="search"
                value={topSearchQuery}
                onChange={(event) => setTopSearchQuery(event.target.value)}
                aria-label="Pencarian tugas atau program"
                placeholder="Cari tugas atau program..."
              />
            </label>

            <div className="topbar-actions">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifPopover(!showNotifPopover);
                    markNotificationsAsRead();
                  }}
                  className="round-action"
                  aria-label="Notifikasi"
                  aria-expanded={showNotifPopover}
                >
                  <Bell size={17} />
                  {unreadNotifsCount > 0 && <span className="dot" aria-hidden="true" />}
                </button>
                {showNotifPopover && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-slate-100 bg-white py-2 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                      <span className="text-xs font-bold text-[#0F172A]">Notifikasi</span>
                      <span className="text-[10px] text-[#64748B]">{notifications.length} pembaruan</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#64748B]">Tidak ada notifikasi baru</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="p-3 transition-colors hover:bg-slate-50">
                            <p className="text-xs font-bold text-[#0F172A]">{notification.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-[#64748B]">{notification.message}</p>
                            <span className="mt-1 block text-[10px] text-[#5C80B6]">{notification.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="avatar" role="img" aria-label={`${userName} avatar`}>
                {userInitial}
              </div>
              {role !== 'admin' && (
                <button type="button" onClick={handleActionClick} className="round-action round-action-primary" aria-label={getActionLabel().replace(/^\+\s*/, '')} title={getActionLabel().replace(/^\+\s*/, '')}>
                  <Plus size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="dashboard-main pt-2">
          {currentTab.endsWith('dashboard') && (
            <section className="kpi-grid" aria-label="Ringkasan metrik">
              {kpis.map(kpi => <article className="kpi-card" key={kpi.label}><span>{kpi.value}</span><p>{kpi.label}</p></article>)}
            </section>
          )}
          {children}
        </main>
        </div>
      </div>
    </div>
  );
};
