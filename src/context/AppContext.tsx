'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { createClientSupabaseClient } from '../../lib/supabase/client';

interface AppContextType {
  role: UserRole;
  currentUser: User | null;
  setRole: (role: UserRole) => void;
  setAuthenticatedUser: (user: User, organization?: PartnerOrganization) => void;
  users: User[];
  volunteerProfile: VolunteerProfile;
  partners: PartnerOrganization[];
  programs: Program[];
  applications: VolunteerApplication[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  adminWorkspaceLoading: boolean;
  adminWorkspaceReady: boolean;
  adminWorkspaceError: string;
  refreshAdminWorkspace: () => Promise<void>;
  partnerWorkspaceLoading: boolean;
  partnerWorkspaceError: string;
  refreshPartnerWorkspace: () => Promise<void>;
  publicDirectoryLoading: boolean;
  publicDirectoryError: string;

  // Auth actions
  loginAsUser: (userId: string) => void;
  logoutToPublic: () => void;
  registerVolunteerAccount: (data: { name: string; email: string; phone: string; password?: string }) => { success: boolean; user: User };
  registerPartnerAccount: (data: { picName: string; email: string; phone: string; orgName: string; password?: string }) => { success: boolean; user: User; org: PartnerOrganization };
  verifyCurrentUserEmail: () => void;

  // Volunteer actions
  updateVolunteerProfile: (profile: Partial<VolunteerProfile>) => void;
  applyToProgram: (programId: string, motivation: string, answers: Record<string, string>) => { success: boolean; message: string; applicationId?: string };
  withdrawApplication: (applicationId: string) => void;

  // Partner actions
  updatePartnerOrg: (orgId: string, data: Partial<PartnerOrganization>, resubmit?: boolean) => Promise<{ success:boolean; message?:string }>;
  updatePartnerDocumentVerification: (orgId: string, documentId: string, status: NonNullable<PartnerOrganization['documents'][number]['verificationStatus']>) => boolean;
  submitPartnershipApplication: (orgId: string) => void;
  resubmitPartnershipApplication: (orgId: string, updatedFields?: Partial<PartnerOrganization>) => void;
  createProgramProposal: (proposalData: Omit<Program, 'id' | 'createdAt' | 'proposalStatus' | 'publishedStatus' | 'enrolledCount'>, options?: { id?: string; saveAs?: 'draft' | 'submitted' }) => Promise<{ success: boolean; programId?: string; message?: string }>;
  
  // Admin actions
  reviewPartnership: (orgId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => void;
  reviewProgramProposal: (programId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => void;
  toggleProgramPublication: (programId: string, status: PublicationStatus) => void;
  reviewVolunteerApplication: (appId: string, decision: ApplicationStatus, notes?: string) => Promise<boolean>;
  recommendVolunteerApplication: (appId: string, decision: 'accepted' | 'waitlisted' | 'rejected', notes?: string) => Promise<void>;

  // Notifications & Utilities
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('public');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile>({ id:'', userId:'', fullName:'', province:'', city:'', interests:[], skills:[] });
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [adminWorkspaceLoading, setAdminWorkspaceLoading] = useState(false);
  const [adminWorkspaceReady, setAdminWorkspaceReady] = useState(false);
  const [adminWorkspaceError, setAdminWorkspaceError] = useState('');
  const [partnerWorkspaceLoading, setPartnerWorkspaceLoading] = useState(false);
  const [partnerWorkspaceError, setPartnerWorkspaceError] = useState('');
  const [publicDirectoryLoading, setPublicDirectoryLoading] = useState(false);
  const [publicDirectoryError, setPublicDirectoryError] = useState('');

  const refreshAdminWorkspace = useCallback(async () => {
    setAdminWorkspaceLoading(true);
    setAdminWorkspaceReady(false);
    setAdminWorkspaceError('');
    try {
      const response = await fetch('/api/admin/workspace', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Data admin dari Supabase gagal dimuat.');
      setUsers(data.users || []);
      setPartners(data.partners || []);
      setPrograms(data.programs || []);
      setApplications(data.applications || []);
      setAuditLogs(data.auditLogs || []);
      setNotifications(data.notifications || []);
    } catch (error) {
      setUsers([]);
      setPartners([]);
      setPrograms([]);
      setApplications([]);
      setAuditLogs([]);
      setNotifications([]);
      setAdminWorkspaceError(error instanceof Error ? error.message : 'Data admin dari Supabase gagal dimuat.');
    } finally {
      setAdminWorkspaceLoading(false);
      setAdminWorkspaceReady(true);
    }
  }, []);

  const refreshPartnerWorkspace = useCallback(async () => {
    setPartnerWorkspaceLoading(true);
    setPartnerWorkspaceError('');
    try {
      const response = await fetch('/api/partner/programs', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Data mitra gagal dimuat.');
      setPrograms((data.programs || []).map((p: any) => ({
        id:p.id, partnerId:p.partner_id, partnerName:p.partner_name, title:p.title, category:p.category,
        summary:p.summary, description:p.description, objectives:p.objectives||[], format:p.format,
        province:p.province||undefined, city:p.city||undefined, address:p.address||undefined,
        startDate:p.start_date, endDate:p.end_date, schedule:p.schedule, targetQuota:p.target_quota,
        enrolledCount:p.enrolled_count, requirements:p.requirements||[], accessibilityInfo:p.accessibility_info||undefined,
        deadline:p.deadline, picName:p.pic_name, picContact:p.pic_contact, proposalStatus:p.proposal_status,
        publishedStatus:p.published_status, executionStatus:p.execution_status||'planned', publicAnnouncement:p.public_announcement||undefined,
        image:p.image, createdAt:p.created_at, reviewNotes:p.review_notes||undefined,
      })));
      setApplications((data.applications || []).map((a: any) => ({
        id:a.id, programId:a.program_id, programTitle:a.program_title, partnerName:a.partner_name,
        volunteerId:a.volunteer_id||'', volunteerName:a.volunteer_name, volunteerEmail:a.volunteer_email,
        volunteerPhone:a.volunteer_phone, volunteerGender:a.volunteer_gender||undefined,
        volunteerCity:a.volunteer_city, volunteerProvince:a.volunteer_province||undefined,
        motivation:a.motivation, answers:a.answers||{}, status:a.status, submittedAt:a.submitted_at,
        reviewNotes:a.review_notes||undefined, history:a.history||[],
        partnerRecommendation:a.partner_recommendation||undefined, partnerReviewNotes:a.partner_review_notes||undefined,
      })));
    } catch (error) {
      setPrograms([]);
      setApplications([]);
      setPartnerWorkspaceError(error instanceof Error ? error.message : 'Data mitra gagal dimuat.');
    } finally { setPartnerWorkspaceLoading(false); }
  }, []);

  // Admin and partner workspaces are populated by role-checked server APIs.
  useEffect(() => {
    if (role === 'admin') void refreshAdminWorkspace();
  }, [role, refreshAdminWorkspace]);

  useEffect(() => {
    if (role === 'partner') void refreshPartnerWorkspace();
    else if (role === 'public') {
      setUsers([]); setAuditLogs([]); setNotifications([]); setPublicDirectoryError('');
      setPrograms([]); setApplications([]); setPartners([]); setPublicDirectoryLoading(true);
      void fetch('/api/public/directory', { cache: 'no-store' }).then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Katalog publik gagal dimuat.');
        setPrograms((data.programs || []).map((p: any) => ({
          id:p.id, partnerId:p.partner_id, partnerName:p.partner_name, title:p.title, category:p.category,
          summary:p.summary, description:p.description, objectives:p.objectives||[], format:p.format,
          province:p.province||undefined, city:p.city||undefined, address:p.address||undefined,
          startDate:p.start_date, endDate:p.end_date, schedule:p.schedule, targetQuota:p.target_quota,
          enrolledCount:p.enrolled_count, requirements:p.requirements||[], accessibilityInfo:p.accessibility_info||undefined,
          deadline:p.deadline, picName:'', picContact:'', proposalStatus:p.proposal_status,
          publishedStatus:p.published_status, executionStatus:p.execution_status||'planned', publicAnnouncement:p.public_announcement||undefined,
          publicTimeline:(data.timeline||[]).filter((item:any)=>item.program_id===p.id).map((item:any)=>({status:item.status,announcement:item.announcement||undefined,createdAt:item.created_at})),
          image:p.image, createdAt:p.created_at,
        })));
        setPartners((data.partners || []).map((p: any) => ({
          id:p.id, userId:'', name:p.name, type:p.type, sector:p.sector, description:p.description||'',
          website:p.website||undefined, address:'', province:p.province, city:p.city, picName:'', picRole:'',
          picPhone:'', picEmail:'', collaborationReason:'', collaborationFocus:[], collaborationObjective:'',
          targetImpact:'', offeredContribution:'', collaborationPeriod:'', documents:[], status:'approved', history:[], createdAt:'',
        })));
      }).catch(error => {
        setPrograms([]); setPartners([]);
        setPublicDirectoryError(error instanceof Error ? error.message : 'Katalog publik gagal dimuat.');
        console.error('Public PSA directory load failed:', error);
      }).finally(() => setPublicDirectoryLoading(false));
    }
  }, [role, refreshPartnerWorkspace]);

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

  const setAuthenticatedUser = useCallback((user: User, organization?: PartnerOrganization) => {
    setUsers(previous => user.role === 'partner' ? [user] : [user, ...previous.filter(existing => existing.id !== user.id)]);
    if (user.role === 'partner') setPartners(organization ? [organization] : []);
    else if (organization) setPartners(previous => [organization, ...previous.filter(existing => existing.id !== organization.id)]);
    setCurrentUserId(user.id);
    setRoleState(user.role);
  }, []);

  const loginAsUser = (userId: string) => {
    const u = users.find(user => user.id === userId);
    if (u) {
      setCurrentUserId(u.id);
      setRoleState(u.role);
    }
  };

  const logoutToPublic = () => {
    const supabase = createClientSupabaseClient();
    if (supabase) void supabase.auth.signOut();
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

  const applyToProgram = (programId: string, motivation: string, answers: Record<string, string>) => {
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

  const updatePartnerOrg = async (orgId: string, data: Partial<PartnerOrganization>, resubmit = false) => {
    const payload = {
      name:data.name, type:data.type, sector:data.sector, description:data.description, website:data.website,
      address:data.address, province:data.province, city:data.city, picName:data.picName, picRole:data.picRole,
      picPhone:data.picPhone, picEmail:data.picEmail, collaborationReason:data.collaborationReason,
      collaborationObjective:data.collaborationObjective, targetImpact:data.targetImpact,
      offeredContribution:data.offeredContribution, collaborationPeriod:data.collaborationPeriod, resubmit,
    };
    const response = await fetch('/api/partner/organization',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result = await response.json();
    if (!response.ok) return {success:false,message:result.error||'Profil organisasi gagal disimpan.'};
    setPartners(prev=>prev.map(org=>org.id===orgId?{...org,...data,...(resubmit?{status:'submitted' as const,reviewNotes:undefined}: {})}:org));
    return {success:true};
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

  const createProgramProposal = async (proposalData: Omit<Program, 'id' | 'createdAt' | 'proposalStatus' | 'publishedStatus' | 'enrolledCount'>, options: { id?: string; saveAs?: 'draft' | 'submitted' } = {}) => {
    const response = await fetch('/api/partner/programs', {
      method: options.id ? 'PATCH' : 'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id:options.id, saveAs:options.saveAs || 'submitted', title:proposalData.title, category:proposalData.category, summary:proposalData.summary,
        description:proposalData.description, objectives:proposalData.objectives, format:proposalData.format,
        province:proposalData.province, city:proposalData.city, address:proposalData.address,
        startDate:proposalData.startDate, endDate:proposalData.endDate, schedule:proposalData.schedule,
        targetQuota:proposalData.targetQuota, requirements:proposalData.requirements,
        accessibilityInfo:proposalData.accessibilityInfo, deadline:proposalData.deadline,
        picName:proposalData.picName, picContact:proposalData.picContact, image:proposalData.image }),
    });
    const result = await response.json();
    if (!response.ok) return { success:false, message:result.error || 'Proposal gagal disimpan.' };
    await refreshPartnerWorkspace();
    return { success:true, programId:result.program.id };
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

  const reviewProgramProposal = async (programId: string, decision: 'approved' | 'revision_required' | 'rejected', notes?: string) => {
    const response = await fetch(`/api/admin/programs/${encodeURIComponent(programId)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalStatus: decision, notes: notes || '' }),
    });
    const result = await response.json();
    if (!response.ok) { window.alert(result.error || 'Gagal menyimpan keputusan proposal.'); return; }
    await refreshAdminWorkspace();
  };

  const toggleProgramPublication = async (programId: string, status: PublicationStatus) => {
    const response = await fetch(`/api/admin/programs/${encodeURIComponent(programId)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicationStatus: status }),
    });
    const result = await response.json();
    if (!response.ok) { window.alert(result.error || 'Gagal memperbarui publikasi program.'); return; }
    await refreshAdminWorkspace();
  };

  const reviewVolunteerApplication = async (appId: string, decision: ApplicationStatus, notes?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/volunteer-applications/${encodeURIComponent(appId)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision, notes: notes || '' }),
      });
      const result = await response.json();
      if (!response.ok) { window.alert(result.error || 'Gagal menyimpan hasil review relawan.'); return false; }
      await refreshAdminWorkspace();
      if (result.emailDelivery?.status === 'failed') {
        window.alert(`Keputusan tersimpan, tetapi email hasil seleksi gagal dikirim. Status kegagalan sudah dicatat; admin dapat mengirim ulang melalui menu Follow-up Email. Detail: ${result.emailDelivery.error || 'lihat riwayat follow-up.'}`);
      } else if (result.emailDelivery?.status === 'sent') {
        window.alert('Keputusan dan email hasil seleksi berhasil diproses.');
      } else if (result.emailDelivery?.status === 'unknown') {
        window.alert(`Keputusan tersimpan, tetapi status pengiriman email belum dapat dipastikan. Periksa riwayat follow-up sebelum mencoba kembali. ${result.emailDelivery.error || ''}`);
      }
      return true;
    } catch (error) {
      window.alert(error instanceof Error ? `Keputusan tidak dapat diverifikasi: ${error.message}` : 'Keputusan tidak dapat diverifikasi. Periksa status pendaftaran sebelum mencoba kembali.');
      return false;
    }
  };

  const recommendVolunteerApplication = async (appId: string, decision: 'accepted' | 'waitlisted' | 'rejected', notes?: string) => {
    const response = await fetch(`/api/partner/applications/${encodeURIComponent(appId)}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ recommendation:decision, notes:notes||'' }),
    });
    const result = await response.json();
    if (!response.ok) { window.alert(result.error || 'Rekomendasi gagal disimpan.'); return; }
    await refreshPartnerWorkspace();
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;
    const unread = notifications.filter(notification => notification.recipientUserId === currentUser.id && !notification.read);
    if (!unread.length) return;
    const response = await fetch('/api/admin/notifications', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unread.map(notification => notification.id) }),
    });
    if (!response.ok) return;
    await refreshAdminWorkspace();
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
      setAuthenticatedUser,
        users,
        volunteerProfile,
        partners,
        programs,
        applications,
        auditLogs,
        notifications,
        unreadNotifsCount,
        adminWorkspaceLoading,
        adminWorkspaceReady,
        adminWorkspaceError,
        refreshAdminWorkspace,
        partnerWorkspaceLoading,
        partnerWorkspaceError,
        refreshPartnerWorkspace,
        publicDirectoryLoading,
        publicDirectoryError,

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
        recommendVolunteerApplication,

        markNotificationsAsRead,
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
