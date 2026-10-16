'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/src/context/AppContext';
import { PublicNavbar } from '@/src/components/layout/PublicNavbar';
import { PortalLayout } from '@/src/components/layout/PortalLayout';
import { Footer } from '@/src/components/common/Footer';
import { AuthModal } from '@/src/components/public/AuthModal';

// Public pages
import { PublicLanding } from '@/src/components/public/PublicLanding';
import { AboutPage } from '@/src/components/public/AboutPage';
import { ProgramsDirectory } from '@/src/components/public/ProgramsDirectory';
import { PartnersDirectory } from '@/src/components/public/PartnersDirectory';
import { BecomePartnerLanding } from '@/src/components/public/BecomePartnerLanding';
import { PartnerRegistrationPage, VolunteerRegistrationPage } from '@/src/components/public/PublicRegistrationPages';

// Volunteer pages
import { VolunteerDashboard } from '@/src/components/volunteer/VolunteerDashboard';
import { VolunteerProfileStepForm } from '@/src/components/volunteer/VolunteerProfileStepForm';
import { VolunteerApplicationsList } from '@/src/components/volunteer/VolunteerApplicationsList';
import { VolunteerApplyModal } from '@/src/components/volunteer/VolunteerApplyModal';

// Partner pages
import { PartnerDashboard } from '@/src/components/partner/PartnerDashboard';
import { PartnerOrganizationForm } from '@/src/components/partner/PartnerOrganizationForm';
import { PartnerProgramsList } from '@/src/components/partner/PartnerProgramsList';
import { PartnerParticipantsList } from '@/src/components/partner/PartnerParticipantsList';
import { PartnerAnalyticsView } from '@/src/components/partner/PartnerAnalyticsView';

// Admin pages
import { AdminDashboard } from '@/src/components/admin/AdminDashboard';
import { AdminOverview } from '@/src/components/admin/AdminOverview';
import { ProgramProposalReviewList } from '@/src/components/admin/ProgramProposalReviewList';
import { VolunteerApplicationsManagement } from '@/src/components/admin/VolunteerApplicationsManagement';
import { GeographicGenderAnalytics } from '@/src/components/admin/GeographicGenderAnalytics';
import { AdminUsersActivity } from '@/src/components/admin/AdminUsersActivity';
import { AdminEmailFollowups } from '@/src/components/admin/AdminEmailFollowups';
import { AdminIntakeReview } from '@/src/components/admin/AdminIntakeReview';
import { PartnerAccountSettings } from '@/src/components/partner/PartnerAccountSettings';

import { Program, User, PartnerOrganization } from '@/src/types';

function mapSessionProfile(profile: any): { user: User; organization?: PartnerOrganization } {
  const raw = profile.profile;
  const user: User = { id: raw.id, name: raw.name, email: raw.email, phone: raw.phone || '', role: profile.role, verified: Boolean(raw.verified), orgId: raw.orgId };
  const org = profile.organization;
  const organization: PartnerOrganization | undefined = org ? { id:org.id,userId:org.user_id,name:org.name,type:org.type,sector:org.sector,description:org.description||'',website:org.website||undefined,address:org.address||'',province:org.province,city:org.city,picName:org.pic_name,picRole:org.pic_role,picPhone:org.pic_phone,picEmail:org.pic_email,collaborationReason:org.collaboration_reason||'',collaborationFocus:org.collaboration_focus||[],collaborationObjective:org.collaboration_objective||'',targetImpact:org.target_impact||'',offeredContribution:org.offered_contribution||'',collaborationPeriod:org.collaboration_period||'',documents:[],status:org.status,reviewNotes:org.review_notes||undefined,history:[],createdAt:org.created_at } : undefined;
  return { user, organization };
}

export default function MainAppContent() {
  const { role, setRole, setAuthenticatedUser, currentUser } = useApp();
  const volunteerPortalEnabled = process.env.NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED === 'true';

  const portalPaths: Record<string, string> = {
    'vol-dashboard': '/relawan/dashboard', 'vol-applications': '/relawan/aplikasi',
    'vol-profile': '/relawan/profil', 'public-programs': '/relawan/program',
    'part-dashboard': '/mitra/dashboard', 'part-programs': '/mitra/program',
    'part-participants': '/mitra/relawan', 'part-analytics': '/mitra/analitik',
    'part-organization': '/mitra/organisasi', 'admin-overview': '/admin/overview',
    'part-settings': '/mitra/pengaturan-akun',
    'admin-dashboard': '/admin/dashboard',
    'admin-partnerships': '/admin/verifikasi-mitra', 'admin-proposals': '/admin/program',
    'admin-applications': '/admin/seleksi-relawan', 'admin-analytics': '/admin/analitik',
    'admin-users-activity': '/admin/users-activity',
    'admin-email-followups': '/admin/email-followups',
  };
  const tabFromPath = (path: string) => path === '/admin/proposal'
    ? 'admin-proposals'
    : path === '/admin/audit'
      ? 'admin-users-activity'
    : Object.entries(portalPaths).find(([, value]) => value === path)?.[0];

  // Navigation tabs state
  const [currentPublicTab, setCurrentPublicTab] = useState<string>('public-home');
  const [currentPortalTab, setCurrentPortalTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return tabFromPath(window.location.pathname) || 'vol-dashboard';
    }
    return 'vol-dashboard';
  });
  const navigatePortal = (tab: string) => {
    if (!volunteerPortalEnabled && tab.startsWith('vol-')) {
      setRole('public');
      setIsViewingPublicSite(true);
      window.history.replaceState({}, '', '/?portal=disabled');
      return;
    }
    setCurrentPortalTab(tab);
    const path = portalPaths[tab];
    if (path && typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({ portalTab: tab }, '', path);
    }
  };

  useEffect(() => {
    const recovering = new URLSearchParams(window.location.search).get('auth') === 'recovery';
    if (recovering) {
      setAuthInitialMode('recovery_password');
      setAuthModalOpen(true);
      window.history.replaceState({}, '', '/');
    }
    const syncFromHistory = async () => {
      const tab = tabFromPath(window.location.pathname);
      if (tab || window.location.pathname === '/') {
        if (tab && !volunteerPortalEnabled && tab.startsWith('vol-')) {
          window.history.replaceState({}, '', '/?portal=disabled');
          setRole('public');
          setIsViewingPublicSite(true);
          return;
        }
        const response = await fetch('/api/auth/profile', { cache: 'no-store' });
        const profile = await response.json();
        if (!response.ok || (tab && profile.role !== (tab.startsWith('admin-') ? 'admin' : tab.startsWith('part-') ? 'partner' : 'volunteer'))) {
          if (!tab) return;
          window.history.replaceState({}, '', '/');
          setRole('public');
          setIsViewingPublicSite(true);
          setAuthInitialMode('login');
          setAuthModalOpen(true);
          return;
        }
        if (profile.mustChangePassword) {
          setRole('public');
          setIsViewingPublicSite(true);
          setAuthInitialMode('force_password');
          setAuthModalOpen(true);
          return;
        }
        const sessionProfile = mapSessionProfile(profile);
        setAuthenticatedUser(sessionProfile.user, sessionProfile.organization);
        if (tab) {
          setCurrentPortalTab(tab);
          setIsViewingPublicSite(false);
        }
      }
    };
    if (!recovering) syncFromHistory();
    window.addEventListener('popstate', syncFromHistory);
    return () => window.removeEventListener('popstate', syncFromHistory);
  }, [volunteerPortalEnabled, setAuthenticatedUser]);
  
  // Flag to know whether an authenticated user is currently viewing the public website or inside their portal
  const [isViewingPublicSite, setIsViewingPublicSite] = useState<boolean>(role === 'public');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'recovery_password' | 'force_password'>('login');
  const [applyingProgram, setApplyingProgram] = useState<Program | null>(null);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<Program | null>(null);

  // Sync portal tab when role changes
  useEffect(() => {
    if (role === 'public') {
      setIsViewingPublicSite(true);
    } else {
      setIsViewingPublicSite(false);
      if (role === 'volunteer' && !currentPortalTab.startsWith('vol-') && currentPortalTab !== 'public-programs') {
        navigatePortal('vol-dashboard');
      } else if (role === 'partner' && !currentPortalTab.startsWith('part-')) {
        navigatePortal('part-dashboard');
      } else if (role === 'admin' && !currentPortalTab.startsWith('admin-')) {
        navigatePortal('admin-overview');
      }
    }
  }, [role]);

  useEffect(() => {
    const openAdminLogin = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setAuthInitialMode('login');
        setAuthModalOpen(true);
      }
    };
    window.addEventListener('keydown', openAdminLogin);
    return () => window.removeEventListener('keydown', openAdminLogin);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register_vol' | 'register_partner' = 'login') => {
    if (mode === 'register_vol') {
      setCurrentPublicTab('public-register-volunteer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (mode === 'register_partner') {
      setCurrentPublicTab('public-register-partner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAuthInitialMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenApply = (prog: Program) => {
    if (!currentUser) {
      handleOpenAuth('register_vol');
      return;
    }
    setApplyingProgram(prog);
  };

  // 1. PUBLIC WEBSITE EXPERIENCE
  if (role === 'public' || isViewingPublicSite) {
    return (
      <div className="public-site min-h-screen flex flex-col bg-[#F8FAFC]">
        {/* Dedicated Public Navigation Bar */}
        <PublicNavbar
          currentTab={currentPublicTab}
          onNavigate={(tab) => {
            setCurrentPublicTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={handleOpenAuth}
          onEnterPortal={() => {
            if (!volunteerPortalEnabled && role === 'volunteer') {
              window.alert('Portal Relawan sedang dinonaktifkan sementara.');
              return;
            }
            setIsViewingPublicSite(false);
          }}
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

          {currentPublicTab === 'public-register-volunteer' && (
            <VolunteerRegistrationPage onBack={() => setCurrentPublicTab('public-home')} />
          )}

          {currentPublicTab === 'public-register-partner' && (
            <PartnerRegistrationPage onBack={() => setCurrentPublicTab('public-home')} />
          )}

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
            if (!volunteerPortalEnabled && newUserRole === 'volunteer') {
              setRole('public');
              setIsViewingPublicSite(true);
              setCurrentPublicTab('public-home');
              window.history.replaceState({}, '', '/?portal=disabled');
              return;
            }
            setIsViewingPublicSite(false);
            if (newUserRole === 'volunteer') navigatePortal('vol-dashboard');
            else if (newUserRole === 'partner') navigatePortal('part-dashboard');
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
              setIsViewingPublicSite(false);
              navigatePortal('vol-applications');
            }}
          />
        )}

      </div>
    );
  }

  // 2. AUTHENTICATED PORTAL WORKSPACE (Volunteer, Partner, or Admin)
  // Has its own dedicated Left Sidebar + Breadcrumb Topbar + Workspace Canvas
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
    >
      {/* VOLUNTEER PORTAL VIEWS */}
      {role === 'volunteer' && (
        <>
          {currentPortalTab === 'vol-dashboard' && (
            <VolunteerDashboard
              onNavigate={navigatePortal}
              onOpenApply={handleOpenApply}
              onOpenDetail={(prog) => {
                setSelectedProgramForDetail(prog);
                navigatePortal('public-programs');
              }}
            />
          )}
          {currentPortalTab === 'vol-applications' && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <VolunteerApplicationsList onExplorePrograms={() => navigatePortal('public-programs')} />
            </div>
          )}
          {currentPortalTab === 'vol-profile' && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <VolunteerProfileStepForm onComplete={() => navigatePortal('vol-dashboard')} />
            </div>
          )}
          {currentPortalTab === 'public-programs' && (
            <div className="py-4">
              <ProgramsDirectory
                onOpenApply={handleOpenApply}
                selectedProgramForDetail={selectedProgramForDetail}
                onClearSelectedProgram={() => setSelectedProgramForDetail(null)}
              />
            </div>
          )}
        </>
      )}

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
          {currentPortalTab === 'part-settings' && <PartnerAccountSettings />}
        </>
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
            <AdminIntakeReview />
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
          {currentPortalTab === 'admin-email-followups' && <AdminEmailFollowups />}
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
            navigatePortal('vol-applications');
          }}
        />
      )}

      {/* Floating Role Switcher Dock for easy evaluation */}
    </PortalLayout>
  );
}
