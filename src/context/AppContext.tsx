import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  VolunteerProfile,
  PartnerOrganization,
  Program,
  VolunteerApplication,
  AuditLog,
  NotificationItem,
  ApplicationStatus,
  PartnershipStatus,
  ProposalStatus,
  PublicationStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_VOLUNTEER_PROFILE,
  INITIAL_PARTNERS,
  INITIAL_PROGRAMS,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  role: UserRole;
  currentUser: User | null;
  setRole: (role: UserRole) => void;
  users: User[];
  volunteerProfile: VolunteerProfile;
  partners: PartnerOrganization[];
  programs: Program[];
  applications: VolunteerApplication[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;

  // Auth actions
  loginAsUser: (userId: string) => void;
  logoutToPublic: () => void;
  registerVolunteerAccount: (data: { name: string; email: string; phone: string; password?: string }) => { success: boolean; user: User };
  registerPartnerAccount: (data: { picName: string; email: string; phone: string; orgName: string; password?: string }) => { success: boolean; user: User; org: PartnerOrganization };
  verifyCurrentUserEmail: () => void;

  // Volunteer actions
  updateVolunteerProfile: (profile: Partial<VolunteerProfile>) => void;
  applyToProgram: (
    programId: string,
    motivation: string,
    answers: Record<string, string>,
    attachment?: VolunteerApplication['attachment']
  ) => { success: boolean; message: string; applicationId?: string };
  withdrawApplication: (applicationId: string) => void;

  // Partner actions
  updatePartnerOrg: (orgId: string, data: Partial<PartnerOrganization>) => void;
  updatePartnerDocumentVerification: (orgId: string, documentId: string, status: NonNullable<PartnerOrganization['documents'][number]['verificationStatus']>) => boolean;
  submitPartnershipApplication: (orgId: string) => void;
  resubmitPartnershipApplication: (orgId: string, updatedFields?: Partial<PartnerOrganization>) => void;
  createProgramProposal: (proposalData: Omit<Program, 'id' | 'createdAt' | 'proposalStatus' | 'publishedStatus' | 'enrolledCount'>) => { success: boolean; programId: string };
  
  // Admin actions
  reviewPartnership: (orgId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => void;
  reviewProgramProposal: (programId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => void;
  toggleProgramPublication: (programId: string, status: PublicationStatus) => void;
  reviewVolunteerApplication: (appId: string, decision: ApplicationStatus, notes?: string) => void;

  // Notifications & Utilities
  markNotificationsAsRead: () => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'psa_platform_data_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('public');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_volProfile`);
    return saved ? JSON.parse(saved) : INITIAL_VOLUNTEER_PROFILE;
  });

  const [partners, setPartners] = useState<PartnerOrganization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_partners`);
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_programs`);
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });

  const [applications, setApplications] = useState<VolunteerApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_apps`);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_volProfile`, JSON.stringify(volunteerProfile));
  }, [volunteerProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_partners`, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_programs`, JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_apps`, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  // Derived current user
  const currentUser = users.find(u => u.id === currentUserId) || null;

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'public') {
      setCurrentUserId(null);
    } else if (newRole === 'volunteer') {
      const vol = users.find(u => u.role === 'volunteer');
      if (vol) setCurrentUserId(vol.id);
    } else if (newRole === 'partner') {
      const part = users.find(u => u.role === 'partner');
      if (part) setCurrentUserId(part.id);
    } else if (newRole === 'admin') {
      const adm = users.find(u => u.role === 'admin');
      if (adm) setCurrentUserId(adm.id);
    }
  };

  const loginAsUser = (userId: string) => {
    const u = users.find(user => user.id === userId);
    if (u) {
      setCurrentUserId(u.id);
      setRoleState(u.role);
    }
  };

  const logoutToPublic = () => {
    setCurrentUserId(null);
    setRoleState('public');
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      actorName: currentUser ? currentUser.name : 'Sistem / Tamu',
      actorRole: role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (recipientUserId: string, title: string, message: string, linkType?: NotificationItem['linkType']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientUserId,
      title,
      message,
      timestamp: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      read: false,
      linkType,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const registerVolunteerAccount = (data: { name: string; email: string; phone: string }) => {
    const newUserId = `user-vol-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'volunteer',
      verified: false,
    };
    setUsers(prev => [...prev, newUser]);
    
    // Create blank profile
    const newProfile: VolunteerProfile = {
      id: `vp-${Date.now()}`,
      userId: newUserId,
      fullName: data.name,
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      interests: [],
      skills: [],
    };
    setVolunteerProfile(newProfile);
    setCurrentUserId(newUserId);
    setRoleState('volunteer');

    addAuditLog('VOLUNTEER_REGISTER', 'user', newUserId, `Pendaftaran akun relawan baru: ${data.name}`);
    return { success: true, user: newUser };
  };

  const registerPartnerAccount = (data: { picName: string; email: string; phone: string; orgName: string }) => {
    const newUserId = `user-part-${Date.now()}`;
    const newOrgId = `org-${Date.now()}`;

    const newOrg: PartnerOrganization = {
      id: newOrgId,
      userId: newUserId,
      name: data.orgName,
      type: 'foundation',
      sector: 'Pendidikan & Sosial',
      description: '',
      address: '',
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      picName: data.picName,
      picRole: 'Perwakilan Organisasi',
      picPhone: data.phone,
      picEmail: data.email,
      collaborationReason: '',
      collaborationFocus: [],
      collaborationObjective: '',
      targetImpact: '',
      offeredContribution: '',
      collaborationPeriod: '6 Bulan',
      documents: [],
      status: 'draft',
      history: [
        {
          status: 'draft',
          date: new Date().toLocaleString('id-ID'),
          actor: data.picName,
          note: 'Akun organisasi dibuat',
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newUser: User = {
      id: newUserId,
      name: data.picName,
      email: data.email,
      phone: data.phone,
      role: 'partner',
      verified: false,
      orgId: newOrgId,
    };

    setUsers(prev => [...prev, newUser]);
    setPartners(prev => [newOrg, ...prev]);
    setCurrentUserId(newUserId);
    setRoleState('partner');

    addAuditLog('PARTNER_ACCOUNT_CREATED', 'user', newUserId, `Akun mitra dibuat untuk organisasi ${data.orgName}`);
    return { success: true, user: newUser, org: newOrg };
  };

  const verifyCurrentUserEmail = () => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, verified: true } : u));
    addAuditLog('EMAIL_VERIFIED', 'user', currentUser.id, `Email ${currentUser.email} berhasil diverifikasi`);
  };

  const updateVolunteerProfile = (updated: Partial<VolunteerProfile>) => {
    setVolunteerProfile(prev => ({ ...prev, ...updated }));
  };

  const applyToProgram = (
    programId: string,
    motivation: string,
    answers: Record<string, string>,
    attachment?: VolunteerApplication['attachment']
  ) => {
    const prog = programs.find(p => p.id === programId);
    if (!prog) return { success: false, message: 'Program tidak ditemukan.' };

    const activeUserId = currentUser?.id || 'user-vol-1';
    const activeUserName = currentUser?.name || volunteerProfile.fullName || 'Relawan PSA';
    const activeEmail = currentUser?.email || 'relawan@gmail.com';

    // Duplicate check
    const existing = applications.find(a => a.programId === programId && a.volunteerId === activeUserId && a.status !== 'withdrawn');
    if (existing) {
      return { success: false, message: 'Anda sudah pernah mendaftar untuk program ini sebelumnya.' };
    }

    if (prog.enrolledCount >= prog.targetQuota) {
      return { success: false, message: 'Kuota pendaftaran untuk program ini telah penuh.' };
    }

    const newApp: VolunteerApplication = {
      id: `app-${Date.now().toString().slice(-4)}`,
      programId: prog.id,
      programTitle: prog.title,
      partnerName: prog.partnerName,
      volunteerId: activeUserId,
      volunteerName: activeUserName,
      volunteerEmail: activeEmail,
      volunteerPhone: currentUser?.phone || '081234567890',
      volunteerGender: volunteerProfile.gender || 'male',
      volunteerCity: volunteerProfile.city || 'DKI Jakarta',
      volunteerProvince: volunteerProfile.province || 'DKI Jakarta',
      motivation,
      answers,
      attachment,
      status: 'submitted',
      submittedAt: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      history: [
        {
          status: 'submitted',
          date: new Date().toLocaleString('id-ID'),
          actor: activeUserName,
          note: 'Aplikasi pendaftaran dikirimkan oleh relawan',
        },
      ],
    };

    setApplications(prev => [newApp, ...prev]);

    // Update program enrolled counter
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, enrolledCount: p.enrolledCount + 1 } : p));

    addAuditLog('APPLICATION_SUBMITTED', 'application', newApp.id, `Pendaftaran relawan ${activeUserName} ke program ${prog.title}`);
    
    // Notify volunteer
    addNotification(activeUserId, 'Aplikasi Terkirim', `Aplikasi untuk "${prog.title}" berhasil dikirim. Anda dapat memantau status secara berkala di portal.`, 'application');

    return { success: true, message: 'Pendaftaran berhasil dikirim!', applicationId: newApp.id };
  };

  const withdrawApplication = (applicationId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        const updated: VolunteerApplication = {
          ...app,
          status: 'withdrawn',
          history: [
            ...app.history,
            {
              status: 'withdrawn',
              date: new Date().toLocaleString('id-ID'),
              actor: currentUser ? currentUser.name : 'Relawan',
              note: 'Pendaftaran dibatalkan oleh relawan',
            },
          ],
        };
        return updated;
      }
      return app;
    }));
    addAuditLog('APPLICATION_WITHDRAWN', 'application', applicationId, `Pendaftaran ${applicationId} ditarik oleh peserta`);
  };

  const updatePartnerOrg = (orgId: string, data: Partial<PartnerOrganization>) => {
    setPartners(prev => prev.map(org => org.id === orgId ? { ...org, ...data } : org));
  };

  const updatePartnerDocumentVerification = (
    orgId: string,
    documentId: string,
    status: NonNullable<PartnerOrganization['documents'][number]['verificationStatus']>
  ) => {
    const organization = partners.find(org => org.id === orgId);
    const document = organization?.documents.find(item => item.id === documentId);
    if (!organization || !document) return false;

    if (document.verificationStatus !== status) {
      setPartners(prev => prev.map(org => org.id === orgId
        ? {
            ...org,
            documents: org.documents.map(item => item.id === documentId
              ? { ...item, verificationStatus: status }
              : item),
          }
        : org
      ));
      addAuditLog(
        `PARTNER_DOCUMENT_${status.toUpperCase()}`,
        'partnership',
        orgId,
        `Status dokumen "${document.name}" diubah menjadi ${status}`
      );
    }
    return true;
  };

  const submitPartnershipApplication = (orgId: string) => {
    setPartners(prev => prev.map(org => {
      if (org.id === orgId) {
        const historyItem = {
          status: 'submitted',
          date: new Date().toLocaleString('id-ID'),
          actor: currentUser ? currentUser.name : 'Mitra',
          note: 'Pengajuan kemitraan resmi dikirimkan untuk peninjauan PSA',
        };
        return {
          ...org,
          status: 'submitted',
          history: [...org.history, historyItem],
        };
      }
      return org;
    }));
    addAuditLog('PARTNERSHIP_SUBMITTED', 'partnership', orgId, `Pengajuan kemitraan dikirimkan oleh organisasi ${orgId}`);
    
    // Admin notification
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      addNotification(adminUser.id, 'Pengajuan Kemitraan Baru', 'Ada organisasi baru yang mengirimkan permohonan kemitraan. Mohon ditinjau.', 'partnership');
    }
  };

  const resubmitPartnershipApplication = (orgId: string, updatedFields?: Partial<PartnerOrganization>) => {
    setPartners(prev => prev.map(org => {
      if (org.id === orgId) {
        const historyItem = {
          status: 'submitted',
          date: new Date().toLocaleString('id-ID'),
          actor: currentUser ? currentUser.name : 'Mitra',
          note: 'Mitra telah memperbarui data dan mengirimkan ulang untuk review PSA',
        };
        return {
          ...org,
          ...updatedFields,
          status: 'submitted',
          reviewNotes: undefined,
          history: [...org.history, historyItem],
        };
      }
      return org;
    }));
    addAuditLog('PARTNERSHIP_RESUBMITTED', 'partnership', orgId, `Mitra mengirimkan kembali perbaikan dokumen kemitraan`);
  };

  const createProgramProposal = (proposalData: Omit<Program, 'id' | 'createdAt' | 'proposalStatus' | 'publishedStatus' | 'enrolledCount'>) => {
    const newProgId = `prog-${Date.now().toString().slice(-4)}`;
    const newProg: Program = {
      ...proposalData,
      id: newProgId,
      enrolledCount: 0,
      proposalStatus: 'submitted',
      publishedStatus: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setPrograms(prev => [newProg, ...prev]);
    addAuditLog('PROGRAM_PROPOSAL_CREATED', 'proposal', newProgId, `Proposal program "${newProg.title}" diajukan oleh ${proposalData.partnerName}`);
    
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      addNotification(adminUser.id, 'Proposal Program Baru', `Proposal "${newProg.title}" diajukan oleh ${proposalData.partnerName}.`, 'proposal');
    }

    return { success: true, programId: newProgId };
  };

  const reviewPartnership = (orgId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => {
    setPartners(prev => prev.map(org => {
      if (org.id === orgId) {
        const historyItem = {
          status: decision,
          date: new Date().toLocaleString('id-ID'),
          actor: currentUser ? currentUser.name : 'Admin PSA',
          note: notes || `Keputusan peninjauan: ${decision}`,
        };
        return {
          ...org,
          status: decision,
          reviewNotes: notes,
          history: [...org.history, historyItem],
        };
      }
      return org;
    }));

    addAuditLog(
      `PARTNERSHIP_${decision.toUpperCase()}`,
      'partnership',
      orgId,
      `Admin menetapkan status ${decision}. Catatan: ${notes || '-'}`
    );

    // Notify partner user
    const targetOrg = partners.find(o => o.id === orgId);
    if (targetOrg) {
      const msg = decision === 'approved' 
        ? 'Selamat! Kemitraan Anda dengan PSA telah disetujui. Anda sekarang dapat mengajukan proposal program kolaborasi.' 
        : decision === 'revision_required'
        ? `Ada catatan revisi dari PSA: ${notes}. Silakan perbaiki dan kirim ulang.`
        : `Pengajuan kemitraan belum dapat disetujui saat ini. Alasan: ${notes || '-'}`;
      addNotification(targetOrg.userId, `Update Kemitraan: ${decision.replace('_', ' ').toUpperCase()}`, msg, 'partnership');
    }
  };

  const reviewProgramProposal = (programId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => {
    setPrograms(prev => prev.map(prog => {
      if (prog.id === programId) {
        return {
          ...prog,
          proposalStatus: decision,
          publishedStatus: decision === 'approved' ? 'published' : 'draft',
          reviewNotes: notes,
        };
      }
      return prog;
    }));

    addAuditLog(
      `PROPOSAL_${decision.toUpperCase()}`,
      'proposal',
      programId,
      `Admin menetapkan status proposal ${decision}. Catatan: ${notes || '-'}`
    );

    const prog = programs.find(p => p.id === programId);
    if (prog) {
      const partner = partners.find(o => o.id === prog.partnerId);
      if (partner) {
        addNotification(partner.userId, `Review Proposal: ${prog.title}`, `Keputusan PSA: ${decision}. ${notes ? `Catatan: ${notes}` : ''}`, 'proposal');
      }
    }
  };

  const toggleProgramPublication = (programId: string, status: PublicationStatus) => {
    setPrograms(prev => prev.map(prog => prog.id === programId ? { ...prog, publishedStatus: status } : prog));
    addAuditLog('PROGRAM_PUBLICATION_TOGGLE', 'program', programId, `Status publikasi diubah menjadi ${status}`);
  };

  const reviewVolunteerApplication = (appId: string, decision: ApplicationStatus, notes?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: decision,
          reviewNotes: notes,
          history: [
            ...app.history,
            {
              status: decision,
              date: new Date().toLocaleString('id-ID'),
              actor: currentUser ? currentUser.name : 'Penyelenggara',
              note: notes || `Status diubah menjadi ${decision}`,
            },
          ],
        };
      }
      return app;
    }));

    addAuditLog('APPLICATION_STATUS_UPDATED', 'application', appId, `Status aplikasi diubah menjadi ${decision}`);

    const app = applications.find(a => a.id === appId);
    if (app) {
      addNotification(
        app.volunteerId,
        `Status Pendaftaran: ${decision.toUpperCase()}`,
        `Pendaftaran Anda untuk program "${app.programTitle}" telah diperbarui menjadi ${decision}. ${notes ? `Catatan: ${notes}` : ''}`,
        'application'
      );
    }
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.recipientUserId === currentUser.id ? { ...n, read: true } : n));
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_users`);
    localStorage.removeItem(`${STORAGE_KEY}_volProfile`);
    localStorage.removeItem(`${STORAGE_KEY}_partners`);
    localStorage.removeItem(`${STORAGE_KEY}_programs`);
    localStorage.removeItem(`${STORAGE_KEY}_apps`);
    localStorage.removeItem(`${STORAGE_KEY}_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_notifs`);

    setUsers(INITIAL_USERS);
    setVolunteerProfile(INITIAL_VOLUNTEER_PROFILE);
    setPartners(INITIAL_PARTNERS);
    setPrograms(INITIAL_PROGRAMS);
    setApplications(INITIAL_APPLICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRole('public');
  };

  const unreadNotifsCount = currentUser
    ? notifications.filter(n => n.recipientUserId === currentUser.id && !n.read).length
    : 0;

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        setRole,
        users,
        volunteerProfile,
        partners,
        programs,
        applications,
        auditLogs,
        notifications,
        unreadNotifsCount,

        loginAsUser,
        logoutToPublic,
        registerVolunteerAccount,
        registerPartnerAccount,
        verifyCurrentUserEmail,

        updateVolunteerProfile,
        applyToProgram,
        withdrawApplication,

        updatePartnerOrg,
        updatePartnerDocumentVerification,
        submitPartnershipApplication,
        resubmitPartnershipApplication,
        createProgramProposal,

        reviewPartnership,
        reviewProgramProposal,
        toggleProgramPublication,
        reviewVolunteerApplication,

        markNotificationsAsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
