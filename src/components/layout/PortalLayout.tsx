import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Home,
  FileText,
  UserCheck,
  FolderGit2,
  BarChart3,
  History,
  LayoutDashboard,
  Search,
  Sun,
  Moon,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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
    notifications, 
    unreadNotifsCount, 
    markNotificationsAsRead,
    partners,
    applications,
    programs
  } = useApp();

  const [railExpanded, setRailExpanded] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [topSearchQuery, setTopSearchQuery] = useState('');
  const railRef = useRef<HTMLElement>(null);

  // Close sidebar when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (railExpanded && railRef.current && !railRef.current.contains(e.target as Node)) {
        setRailExpanded(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [railExpanded]);

  // Automatically close sidebar whenever active portal tab changes
  useEffect(() => {
    setRailExpanded(false);
    if (document.activeElement instanceof HTMLElement && railRef.current?.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }, [currentTab]);

  const pendingPartnerships = partners.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
  const pendingProposals = programs.filter(p => p.proposalStatus === 'submitted' || p.proposalStatus === 'under_review').length;
  const volunteerPending = applications.filter(a => (a.volunteerId === currentUser?.id) && (a.status === 'under_review' || a.status === 'submitted')).length;

  let navItems: PortalNavItem[] = [];
  let portalRoleBadge = '';

  if (role === 'volunteer') {
    portalRoleBadge = 'Relawan Aktif';
    navItems = [
      { id: 'vol-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'vol-applications', label: 'Aplikasi Saya', icon: FileText, badge: volunteerPending > 0 ? `${volunteerPending}` : undefined },
      { id: 'vol-profile', label: 'Profil Saya', icon: UserCheck },
      { id: 'public-programs', label: 'Program PSA', icon: Search },
    ];
  } else if (role === 'partner') {
    portalRoleBadge = 'Mitra Organisasi';
    navItems = [
      { id: 'part-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'part-programs', label: 'Program Kolaborasi', icon: FolderGit2 },
      { id: 'part-participants', label: 'Data Relawan', icon: Users },
      { id: 'part-analytics', label: 'Analitik Program', icon: BarChart3 },
      { id: 'part-organization', label: 'Profil Organisasi', icon: Building2 },
    ];
  } else if (role === 'admin') {
    portalRoleBadge = 'PSA Admin';
    navItems = [
      { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'admin-partnerships', label: 'Verifikasi Mitra', icon: Building2, badge: pendingPartnerships > 0 ? `${pendingPartnerships}` : undefined },
      { id: 'admin-proposals', label: 'Review Proposal', icon: FolderGit2, badge: pendingProposals > 0 ? `${pendingProposals}` : undefined },
      { id: 'admin-applications', label: 'Seleksi Relawan', icon: Users },
      { id: 'admin-analytics', label: 'Analitik Wilayah', icon: BarChart3 },
      { id: 'admin-audit', label: 'Audit Trail', icon: History },
    ];
  }

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'James';
  const userInitial = userName.charAt(0).toUpperCase();

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
    <div className={`app-wrapper ${isDarkMode ? 'dark' : ''}`}>
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
          if (document.activeElement instanceof HTMLElement && railRef.current?.contains(document.activeElement)) {
            document.activeElement.blur();
          }
        }}
      >
        <div 
          className="rail-brand cursor-pointer select-none"
          onClick={() => setRailExpanded(!railExpanded)}
          title={railExpanded ? "Ciutkan Menu" : "Perluas Menu"}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRailExpanded(!railExpanded); }}
        >
          <span className="brand-mark shrink-0" aria-hidden="true">✦</span>
          <div className="flex items-center justify-between flex-1 pr-3 overflow-hidden">
            <span className="brand-name font-black tracking-wider text-sm">WORKSPACE</span>
            <ChevronRight 
              size={15} 
              className={`brand-name text-slate-400 transition-transform duration-200 ${railExpanded ? 'rotate-180' : ''}`} 
            />
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
                <Icon size={20} className="shrink-0" />
                <span className="rail-label truncate flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E85D75] text-white">
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
              <Home size={18} className="shrink-0" />
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
              <LogOut size={18} className="shrink-0" />
              <span className="rail-label text-xs font-bold text-[#E85D75]">Keluar</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Global backdrop overlay when sidebar is expanded - closes sidebar on outside click */}
      {railExpanded && (
        <div 
          className="fixed inset-0 bg-[#0B2238]/30 backdrop-blur-[1px] z-40 transition-opacity cursor-pointer"
          onClick={() => {
            setRailExpanded(false);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          aria-hidden="true"
        />
      )}

      {/* 
        ========================================================================
        WORKSPACE CONTAINER & TOPBAR (from style.html)
        ========================================================================
      */}
      <div className="workspace">
        <header className="topbar">
          <div className="greeting-wrapper">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#5C80B6] mb-0.5">
              {portalRoleBadge}
            </div>
            <div className="greeting">
              Hi, {userName}! What are your plans today?
            </div>
          </div>

          <div className="top-actions">
            {/* Search Shell */}
            <label className="search-shell" htmlFor="top-search">
              <Search size={16} className="text-[#64748B] shrink-0" aria-hidden="true" />
              <input
                id="top-search"
                type="search"
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                aria-label="Pencarian tugas atau program"
                placeholder="Search tasks..."
              />
            </label>

            <div className="flex items-center gap-2 shrink-0">
              {/* Light / Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="icon-button"
                aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
                aria-pressed={isDarkMode}
              >
                {isDarkMode ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
              </button>

              {/* Bell Button with Coral Dot */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifPopover(!showNotifPopover);
                    markNotificationsAsRead();
                  }}
                  className="icon-button"
                  aria-label="Notifikasi"
                >
                  <Bell size={19} />
                  {unreadNotifsCount > 0 && <span className="dot" aria-hidden="true" />}
                </button>

                {showNotifPopover && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] rounded-3xl bg-white shadow-2xl border border-slate-100 py-3 z-50">
                    <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0F172A]">Notifications</span>
                      <span className="text-[10px] text-white font-bold bg-[#E85D75] px-2 py-0.5 rounded-full">
                        {notifications.length} New
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-5 text-xs text-[#64748B] text-center">Tidak ada notifikasi baru</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                            <p className="text-xs font-bold text-[#0F172A]">{n.title}</p>
                            <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-[#5C80B6] mt-1 block font-mono">{n.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Placeholder with Gradient */}
              <div className="avatar" role="img" aria-label={`${userName} avatar`}>
                {userInitial}
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleActionClick}
                className="navy-button"
              >
                {getActionLabel()}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="dashboard-main pt-2">
          {children}
        </main>
      </div>
    </div>
  );
};
