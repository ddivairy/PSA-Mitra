import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PortalLayout } from './components/layout/PortalLayout';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/public/AuthModal';
import { RoleSwitcherDock } from './components/common/RoleSwitcherDock';

// Public pages
import { PublicLanding } from './components/public/PublicLanding';
import { AboutPage } from './components/public/AboutPage';
import { ProgramsDirectory } from './components/public/ProgramsDirectory';
import { PartnersDirectory } from './components/public/PartnersDirectory';
import { BecomePartnerLanding } from './components/public/BecomePartnerLanding';

// Volunteer pages
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { VolunteerProfileStepForm } from './components/volunteer/VolunteerProfileStepForm';
import { VolunteerApplicationsList } from './components/volunteer/VolunteerApplicationsList';
import { VolunteerApplyModal } from './components/volunteer/VolunteerApplyModal';

// Partner pages
import { PartnerDashboard } from './components/partner/PartnerDashboard';
import { PartnerOrganizationForm } from './components/partner/PartnerOrganizationForm';
import { PartnerProgramsList } from './components/partner/PartnerProgramsList';
import { PartnerParticipantsList } from './components/partner/PartnerParticipantsList';
import { PartnerAnalyticsView } from './components/partner/PartnerAnalyticsView';

// Admin pages
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PartnershipReviewList } from './components/admin/PartnershipReviewList';
import { ProgramProposalReviewList } from './components/admin/ProgramProposalReviewList';
import { VolunteerApplicationsManagement } from './components/admin/VolunteerApplicationsManagement';
import { GeographicGenderAnalytics } from './components/admin/GeographicGenderAnalytics';
import { AuditTrailView } from './components/admin/AuditTrailView';

import { Program, UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { role, setRole, currentUser } = useApp();

  // Navigation tabs state
  const [currentPublicTab, setCurrentPublicTab] = useState<string>('public-home');
  const [currentPortalTab, setCurrentPortalTab] = useState<string>('vol-dashboard');
  
  // Flag to know whether an authenticated user is currently viewing the public website or inside their portal
  const [isViewingPublicSite, setIsViewingPublicSite] = useState<boolean>(role === 'public');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register_vol' | 'register_partner'>('login');
  const [applyingProgram, setApplyingProgram] = useState<Program | null>(null);
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<Program | null>(null);

  // Sync portal tab when role changes
  useEffect(() => {
    if (role === 'public') {
      setIsViewingPublicSite(true);
    } else {
      setIsViewingPublicSite(false);
      if (role === 'volunteer') {
        setCurrentPortalTab('vol-dashboard');
      } else if (role === 'partner') {
        setCurrentPortalTab('part-dashboard');
      } else if (role === 'admin') {
        setCurrentPortalTab('admin-dashboard');
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
    if (newRole === 'public') {
      setIsViewingPublicSite(true);
      setCurrentPublicTab('public-home');
    } else {
      setIsViewingPublicSite(false);
      if (newRole === 'volunteer') setCurrentPortalTab('vol-dashboard');
      else if (newRole === 'partner') setCurrentPortalTab('part-dashboard');
      else if (newRole === 'admin') setCurrentPortalTab('admin-dashboard');
    }
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
            setIsViewingPublicSite(false);
            if (newUserRole === 'volunteer') setCurrentPortalTab('vol-dashboard');
            else if (newUserRole === 'partner') setCurrentPortalTab('part-dashboard');
            else if (newUserRole === 'admin') setCurrentPortalTab('admin-dashboard');
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
              setCurrentPortalTab('vol-applications');
            }}
          />
        )}

        {/* Floating Role Switcher Dock for easy evaluation */}
        <RoleSwitcherDock onRoleChanged={handleRoleChangedFromDock} />
      </div>
    );
  }

  // 2. AUTHENTICATED PORTAL WORKSPACE (Volunteer, Partner, or Admin)
  // Has its own dedicated Left Sidebar + Breadcrumb Topbar + Workspace Canvas
  return (
    <PortalLayout
      currentTab={currentPortalTab}
      onNavigate={(tab) => {
        setCurrentPortalTab(tab);
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
              onNavigate={(tab) => setCurrentPortalTab(tab)}
              onOpenApply={handleOpenApply}
              onOpenDetail={(prog) => {
                setSelectedProgramForDetail(prog);
                setCurrentPortalTab('public-programs');
              }}
            />
          )}
          {currentPortalTab === 'vol-applications' && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <VolunteerApplicationsList onExplorePrograms={() => setCurrentPortalTab('public-programs')} />
            </div>
          )}
          {currentPortalTab === 'vol-profile' && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <VolunteerProfileStepForm onComplete={() => setCurrentPortalTab('vol-dashboard')} />
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
            <PartnerDashboard onNavigate={(tab) => setCurrentPortalTab(tab)} />
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
              <PartnerOrganizationForm onComplete={() => setCurrentPortalTab('part-dashboard')} />
            </div>
          )}
        </>
      )}

      {/* PSA ADMIN CONSOLE VIEWS */}
      {role === 'admin' && (
        <>
          {currentPortalTab === 'admin-dashboard' && (
            <AdminDashboard onNavigate={(tab) => setCurrentPortalTab(tab)} />
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
          {currentPortalTab === 'admin-audit' && (
            <AuditTrailView />
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
            setCurrentPortalTab('vol-applications');
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
