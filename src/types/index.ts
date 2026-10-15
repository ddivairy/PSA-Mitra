export type UserRole = 'public' | 'volunteer' | 'partner' | 'admin';

export type GenderOption = 'male' | 'female' | 'prefer_not_to_say';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  verified: boolean;
  orgId?: string;
}

export interface VolunteerProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate?: string;
  gender?: GenderOption;
  province: string;
  city: string;
  interests: string[];
  education?: string;
  skills: string[];
  experience?: string;
  availability?: string;
  bio?: string;
}

export type OrgType = 'corporate' | 'foundation' | 'community' | 'university' | 'school';

export type PartnershipStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_required' 
  | 'approved' 
  | 'rejected' 
  | 'withdrawn';

export interface OrgDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  verificationStatus?: 'pending' | 'verified' | 'revision_required';
}

export interface StatusHistoryItem {
  status: string;
  date: string;
  actor: string;
  note?: string;
}

export interface PartnerOrganization {
  id: string;
  userId: string;
  name: string;
  type: OrgType;
  sector: string;
  description: string;
  website?: string;
  address: string;
  province: string;
  city: string;
  picName: string;
  picRole: string;
  picPhone: string;
  picEmail: string;
  collaborationReason: string;
  collaborationFocus: string[];
  collaborationObjective: string;
  targetImpact: string;
  offeredContribution: string;
  collaborationPeriod: string;
  documents: OrgDocument[];
  status: PartnershipStatus;
  reviewNotes?: string;
  history: StatusHistoryItem[];
  createdAt: string;
}

export type ProgramCategory = 
  | 'Pendidikan' 
  | 'Lingkungan' 
  | 'Kesehatan' 
  | 'Pemberdayaan Masyarakat' 
  | 'Teknologi & Digital';

export type ProgramFormat = 'offline' | 'online' | 'hybrid';

export type ProposalStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_required' 
  | 'approved' 
  | 'rejected';

export type PublicationStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface Program {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  category: ProgramCategory;
  summary: string;
  description: string;
  objectives: string[];
  format: ProgramFormat;
  province?: string;
  city?: string;
  address?: string;
  startDate: string;
  endDate: string;
  schedule: string;
  targetQuota: number;
  enrolledCount: number;
  requirements: string[];
  accessibilityInfo?: string;
  deadline: string;
  picName: string;
  picContact: string;
  proposalStatus: ProposalStatus;
  publishedStatus: PublicationStatus;
  image: string;
  createdAt: string;
  reviewNotes?: string;
}

export type ApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'accepted' 
  | 'waitlisted' 
  | 'rejected' 
  | 'withdrawn';

export interface VolunteerApplication {
  id: string;
  programId: string;
  programTitle: string;
  partnerName: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone: string;
  volunteerGender?: GenderOption;
  volunteerCity: string;
  volunteerProvince?: string;
  motivation: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  submittedAt: string;
  reviewNotes?: string;
  history: StatusHistoryItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'partnership' | 'proposal' | 'application' | 'program' | 'user';
  entityId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkType?: 'application' | 'partnership' | 'proposal';
}
