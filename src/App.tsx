import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PortalLayout } from './components/layout/PortalLayout';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/public/AuthModal';
import { RoleSwitcherDock } from './components/common/RoleSwitcherDock';
import { CreateProposalModal } from './components/partner/CreateProposalModal';

// Public pages
import { PublicLanding } from './components/public/PublicLanding';
import { AboutPage } from './components/public/AboutPage';
import { ProgramsDirectory } from './components/public/ProgramsDirectory';
import { PartnersDirectory } from './components/public/PartnersDirectory';
import { BecomePartnerLanding } from './components/public/BecomePartnerLanding';

// Volunteer pages
import { VolunteerApplyModal } from './components/volunteer/VolunteerApplyModal';

// Partner pages
import { PartnerDashboard } from './components/partner/PartnerDashboard';
import { PartnerOrganizationForm } from './components/partner/PartnerOrganizationForm';
import { PartnerProgramsList } from './components/partner/PartnerProgramsList';
import { PartnerParticipantsList } from './components/partner/PartnerParticipantsList';
import { PartnerAnalyticsView } from './components/partner/PartnerAnalyticsView';

// Admin pages
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOverview } from './components/admin/AdminOverview';
import { PartnershipReviewList } from './components/admin/PartnershipReviewList';
import { ProgramProposalReviewList } from './components/admin/ProgramProposalReviewList';
import { VolunteerApplicationsManagement } from './components/admin/VolunteerApplicationsManagement';
import { GeographicGenderAnalytics } from './components/admin/GeographicGenderAnalytics';
import { AdminUsersActivity } from './components/admin/AdminUsersActivity';

import { Program, UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { role, setRole, currentUser } = useApp();

  const portalPaths: Record<string, string> = {
    'public-programs': '/relawan/program',
    'part-dashboard': '/mitra/dashboard', 'part-programs': '/mitra/program',
    'part-participants': '/mitra/relawan', 'part-analytics': '/mitra/analitik',
    'part-organization': '/mitra/organisasi', 'admin-overview': '/admin/overview',
    'admin-dashboard': '/admin/dashboard',
    'admin-partnerships': '/admin/verifikasi-mitra', 'admin-proposals': '/admin/program',
    'admin-applications': '/admin/seleksi-relawan', 'admin-analytics': '/admin/analitik',
    'admin-users-activity': '/admin/users-activity',
  };
  const tabFromPath = (path: string) => path === '/admin/proposal'
    ? 'admin-proposals'
    : path === '/admin/audit'
      ? 'admin-users-activity'
    : Object.entries(portalPaths).find(([, value]) => value === path)?.[0];

  // Navigation tabs state
  const [currentPublicTab, setCurrentPublicTab] = useState<string>('public-home');
  const [currentPortalTab, setCurrentPortalTab] = useState<string>(() => tabFromPath(window.location.pathname) || 'public-programs');
  const navigatePortal = (tab: string) => {
    setCurrentPortalTab(tab);
    const path = portalPaths[tab];
    if (path && window.location.pathname !== path) window.history.pushState({ portalTab: tab }, '', path);
  };

  useEffect(() => {
    const syncFromHistory = () => {
      const tab = tabFromPath(window.location.pathname);
      if (tab) {
        setCurrentPortalTab(tab);
        if (tab.startsWith('admin-')) setRole('admin');
        else if (tab.startsWith('part-')) setRole('partner');
        else setRole('volunteer');
      }
    };
    syncFromHistory();
    window.addEventListener('popstate', syncFromHistory);
    return () => window.removeEventListener('popstate', syncFromHistory);
  }, []);
  
  // Flag to know whether an authenticated user is currently viewing the public website or inside their portal
  const [isViewingPublicSite, setIsViewingPublicSite] = useState<boolean>(role === 'public');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register_vol' | 'register_partner'>('login');
  const [applyingProgram, setApplyingProgram] = useState<Program | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<Program | null>(null);

  // Sync portal tab when role changes
  useEffect(() => {
    if (role === 'public' || role === 'volunteer') {
      setIsViewingPublicSite(true);
      if (role === 'volunteer') setCurrentPublicTab('public-programs');
    } else {
      setIsViewingPublicSite(false);
      if (role === 'partner' && !currentPortalTab.startsWith('part-')) {
        navigatePortal('part-dashboard');
      } else if (role === 'admin' && !currentPortalTab.startsWith('admin-')) {
        navigatePortal('admin-overview');
      }
    }
  }, [role]);

  const handleOpenAuth = (mode: 'login' | 'register_vol' | 'register_partner' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenApply = (prog: Program) => {
    if (!currentUser) {
      handleOpenAuth('register_vol');
      return;
    }
    setApplyingProgram(prog);
  };

  const handleRoleChangedFromDock = (newRole: UserRole) => {
    if (newRole === 'public' || newRole === 'volunteer') {
      setIsViewingPublicSite(true);
      setCurrentPublicTab(newRole === 'volunteer' ? 'public-programs' : 'public-home');
    } else {
      setIsViewingPublicSite(false);
      if (newRole === 'partner') navigatePortal('part-dashboard');
      else if (newRole === 'admin') navigatePortal('admin-overview');
    }
  };

  // 1. PUBLIC WEBSITE EXPERIENCE
  if (role === 'public' || isViewingPublicSite) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        {/* Dedicated Public Navigation Bar */}
        <PublicNavbar
          currentTab={currentPublicTab}
          onNavigate={(tab) => {
            setCurrentPublicTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={handleOpenAuth}
          onEnterPortal={() => setIsViewingPublicSite(false)}
        />

        {/* Public Main Content */}
        <main className="flex-1">
          {currentPublicTab === 'public-home' && (
            <PublicLanding
              onNavigate={(tab) => {
                setCurrentPublicTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAuth={handleOpenAuth}
              onSelectProgram={(prog) => {
                setSelectedProgramForDetail(prog);
                setCurrentPublicTab('public-programs');
              }}
            />
          )}

          {currentPublicTab === 'public-about' && <AboutPage />}

          {currentPublicTab === 'public-programs' && (
            <ProgramsDirectory
              onOpenApply={handleOpenApply}
              selectedProgramForDetail={selectedProgramForDetail}
              onClearSelectedProgram={() => setSelectedProgramForDetail(null)}
            />
          )}

          {currentPublicTab === 'public-partners' && <PartnersDirectory />}

          {currentPublicTab === 'public-become-partner' && (
            <BecomePartnerLanding
              onOpenAuth={handleOpenAuth}
              onNavigate={(tab) => {
                setCurrentPublicTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </main>

        {/* Dedicated Public Footer */}
        <Footer
          onNavigate={(tab) => {
            setCurrentPublicTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={handleOpenAuth}
        />

        {/* Modals */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authInitialMode}
          onSuccess={(newUserRole) => {
            if (newUserRole === 'volunteer') {
              setIsViewingPublicSite(true);
              setCurrentPublicTab('public-programs');
            } else {
              setIsViewingPublicSite(false);
            }
            if (newUserRole === 'partner') navigatePortal('part-dashboard');
            else if (newUserRole === 'admin') navigatePortal('admin-dashboard');
          }}
        />

        {applyingProgram && (
          <VolunteerApplyModal
            program={applyingProgram}
            isOpen={!!applyingProgram}
            onClose={() => setApplyingProgram(null)}
            onSuccess={() => {
              alert('Aplikasi pendaftaran berhasil dikirim!');
              setIsViewingPublicSite(true);
              setCurrentPublicTab('public-programs');
            }}
          />
        )}

        {/* Floating Role Switcher Dock for easy evaluation */}
        <RoleSwitcherDock onRoleChanged={handleRoleChangedFromDock} />
      </div>
    );
  }

  // 2. AUTHENTICATED PORTAL WORKSPACE (Partner or Admin)
  // Volunteers use the public site to browse and apply to programs.
  return (
    <PortalLayout
      currentTab={currentPortalTab}
      onNavigate={(tab) => {
        navigatePortal(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onGoToPublic={() => {
        setIsViewingPublicSite(true);
        setCurrentPublicTab('public-home');
      }}
      onOpenQuickAction={() => setIsProposalModalOpen(true)}
    >
      {/* PARTNER PORTAL VIEWS */}
      {role === 'partner' && (
        <>
          {currentPortalTab === 'part-dashboard' && (
            <PartnerDashboard onNavigate={navigatePortal} />
          )}
          {currentPortalTab === 'part-programs' && (
            <PartnerProgramsList />
          )}
          {currentPortalTab === 'part-participants' && (
            <PartnerParticipantsList />
          )}
          {currentPortalTab === 'part-analytics' && (
            <PartnerAnalyticsView />
          )}
          {currentPortalTab === 'part-organization' && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <PartnerOrganizationForm onComplete={() => navigatePortal('part-dashboard')} />
            </div>
          )}
        </>
      )}

      {role === 'partner' && currentPortalTab === 'part-programs' && (
        <CreateProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          onSuccess={() => setIsProposalModalOpen(false)}
        />
      )}

      {/* PSA ADMIN CONSOLE VIEWS */}
      {role === 'admin' && (
        <>
          {currentPortalTab === 'admin-overview' && (
            <AdminOverview />
          )}
          {currentPortalTab === 'admin-dashboard' && (
            <AdminDashboard onNavigate={navigatePortal} />
          )}
          {currentPortalTab === 'admin-partnerships' && (
            <PartnershipReviewList />
          )}
          {currentPortalTab === 'admin-proposals' && (
            <ProgramProposalReviewList />
          )}
          {currentPortalTab === 'admin-applications' && (
            <VolunteerApplicationsManagement />
          )}
          {currentPortalTab === 'admin-analytics' && (
            <GeographicGenderAnalytics />
          )}
          {currentPortalTab === 'admin-users-activity' && (
            <AdminUsersActivity />
          )}
        </>
      )}

      {/* Modals for Portal Workspace */}
      {applyingProgram && (
        <VolunteerApplyModal
          program={applyingProgram}
          isOpen={!!applyingProgram}
          onClose={() => setApplyingProgram(null)}
          onSuccess={() => {
            alert('Aplikasi pendaftaran berhasil dikirim!');
            setIsViewingPublicSite(true);
            setCurrentPublicTab('public-programs');
          }}
        />
      )}

      {/* Floating Role Switcher Dock for easy evaluation */}
      <RoleSwitcherDock onRoleChanged={handleRoleChangedFromDock} />
    </PortalLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
