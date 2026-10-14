import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { CreateProposalModal } from './CreateProposalModal';
import { PublicationStatus } from '../../types';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';

export const PartnerProgramsList: React.FC = () => {
  const { programs, partners, currentUser, toggleProgramPublication } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentOrg = partners.find(p => p.id === currentUser?.orgId) || partners[0];
  const orgPrograms = programs.filter(p => p.partnerId === currentOrg?.id);

  const isApprovedPartner = currentOrg?.status === 'approved';

  return (
    <div className="space-y-6">
      <WorkspaceIntroHeader
        eyebrow="PROGRAM DIRECTORY · ORGANISASI MITRA"
        title="Program & Kolaborasi Organisasi"
        description={`Daftar inisiatif sosial dan proyek kemitraan yang diajukan oleh ${currentOrg?.name}.`}
        actions={
          isApprovedPartner ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="navy-button flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>+ Buat Proposal Program Baru</span>
            </button>
          ) : undefined
        }
      />

      {orgPrograms.length === 0 ? (
        <div className="card panel text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <h3 className="text-base font-extrabold text-[#0F172A]">Belum Ada Program</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Ajukan proposal program kolaborasi pertama organisasi Anda untuk menjaring relawan berdampak.
          </p>
          {isApprovedPartner && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="navy-button"
            >
              Mulai Ajukan Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgPrograms.map(prog => (
            <div
              key={prog.id}
              className="card overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] bg-slate-100">
                  <img src={prog.image} alt={prog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 text-[#0F172A] text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
                      {prog.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={prog.proposalStatus} size="sm" />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-extrabold text-[#0F172A] line-clamp-2">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {prog.summary}
                  </p>

                  <div className="space-y-1.5 text-xs text-[#64748B] pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#5C80B6]" />
                      <span>{prog.city || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#5C80B6]" />
                      <span>Mulai: {prog.startDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono tabular-nums text-[#0F172A] font-bold">
                  Peserta: <strong>{prog.enrolledCount}</strong> / {prog.targetQuota}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={prog.publishedStatus}
                    onChange={(e) => toggleProgramPublication(prog.id, e.target.value as PublicationStatus)}
                    className="text-[11px] py-1 px-2.5 border border-slate-200 rounded-xl bg-white text-[#0F172A] font-semibold"
                  >
                    <option value="published">Tayang (Buka)</option>
                    <option value="closed">Tutup Pendaftaran</option>
                    <option value="draft">Draf (Sembunyikan)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
};
