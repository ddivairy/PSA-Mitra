import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  RotateCcw,
  Globe,
  Archive,
  Ban
} from 'lucide-react';
import { ApplicationStatus, PartnershipStatus, ProposalStatus, PublicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | PartnershipStatus | ProposalStatus | PublicationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 12 : 14;

  switch (s) {
    case 'approved':
    case 'accepted':
    case 'verified':
    case 'published':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 size={iconSize} className="shrink-0 text-emerald-600" />
          <span>{s === 'accepted' ? 'Diterima' : s === 'approved' ? 'Disetujui' : s === 'published' ? 'Dipublikasikan' : 'Terverifikasi'}</span>
        </span>
      );

    case 'under_review':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock size={iconSize} className="shrink-0 text-amber-600 animate-pulse" />
          <span>Sedang Ditinjau</span>
        </span>
      );

    case 'submitted':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <FileText size={iconSize} className="shrink-0 text-blue-600" />
          <span>Terkirim</span>
        </span>
      );

    case 'revision_required':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          <RotateCcw size={iconSize} className="shrink-0 text-orange-600" />
          <span>Perlu Revisi</span>
        </span>
      );

    case 'waitlisted':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <AlertCircle size={iconSize} className="shrink-0 text-purple-600" />
          <span>Daftar Tunggu</span>
        </span>
      );

    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle size={iconSize} className="shrink-0 text-rose-600" />
          <span>Ditolak</span>
        </span>
      );

    case 'withdrawn':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <Ban size={iconSize} className="shrink-0 text-slate-500" />
          <span>Dibatalkan</span>
        </span>
      );

    case 'closed':
    case 'archived':
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <Archive size={iconSize} className="shrink-0 text-slate-500" />
          <span>{s === 'closed' ? 'Pendaftaran Tutup' : 'Diarsipkan'}</span>
        </span>
      );

    case 'draft':
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <FileText size={iconSize} className="shrink-0 text-slate-500" />
          <span>Draf</span>
        </span>
      );
  }
};
