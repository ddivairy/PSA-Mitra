'use client';

import React from 'react';
import { Building2, FolderGit2, Users, ArrowRight, CheckCircle2, Clock3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

interface AdminDashboardProps { onNavigate: (tab: string) => void }
const numberFormatter = new Intl.NumberFormat('id-ID');

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { partners, programs, applications, reviewProgramProposal } = useApp();
  const pendingPartners = partners.filter(partner => ['submitted', 'under_review', 'revision_required'].includes(partner.status));
  const pendingProposals = programs.filter(program => ['submitted', 'under_review', 'revision_required'].includes(program.proposalStatus));
  const pendingApplications = applications.filter(application => ['submitted', 'under_review'].includes(application.status));
  const approvedPartners = partners.filter(partner => partner.status === 'approved').length;
  const publishedPrograms = programs.filter(program => program.publishedStatus === 'published').length;
  const metrics = [
    { title: 'Mitra terdaftar', value: partners.length, detail: `${approvedPartners} disetujui`, icon: Building2 },
    { title: 'Program', value: programs.length, detail: `${publishedPrograms} dipublikasikan`, icon: FolderGit2 },
    { title: 'Pendaftar program', value: applications.length, detail: `${pendingApplications.length} menunggu review`, icon: Users },
  ];

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Administrasi PSA</p><h1 className="mt-1 text-2xl font-extrabold text-slate-900">Dashboard Admin</h1><p className="mt-1 text-sm text-slate-500">Ringkasan langsung dari data Supabase.</p></div>
      <button onClick={() => onNavigate('admin-users-activity')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Lihat audit & pengguna <ArrowRight size={15} className="ml-1 inline" /></button>
    </header>
    <section className="grid gap-4 sm:grid-cols-3">
      {metrics.map(({ title, value, detail, icon: Icon }) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{title}</span><Icon size={20} className="text-blue-700" /></div><p className="mt-3 text-3xl font-bold tabular-nums text-slate-900">{numberFormatter.format(value)}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></article>)}
    </section>
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Antrean mitra</h2><p className="mt-1 text-xs text-slate-500">{pendingPartners.length} organisasi menunggu keputusan</p></div><button onClick={() => onNavigate('admin-partnerships')} className="text-sm font-semibold text-blue-700">Buka antrean</button></div>
        <div className="mt-4 divide-y divide-slate-100">{pendingPartners.slice(0, 5).map(partner => <div key={partner.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-slate-800">{partner.name}</p><p className="text-xs text-slate-500">{partner.picName} · {partner.picEmail}</p></div><StatusBadge status={partner.status} size="sm" /></div>)}{!pendingPartners.length && <p className="py-6 text-center text-sm text-slate-500">Tidak ada antrean mitra.</p>}</div>
      </article>
      <article className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Antrean proposal program</h2><p className="mt-1 text-xs text-slate-500">{pendingProposals.length} proposal menunggu review</p></div><button onClick={() => onNavigate('admin-proposals')} className="text-sm font-semibold text-blue-700">Buka program</button></div>
        <div className="mt-4 divide-y divide-slate-100">{pendingProposals.slice(0, 5).map(program => <div key={program.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{program.title}</p><p className="text-xs text-slate-500">{program.partnerName} · {program.city || program.province || 'Lokasi belum dicantumkan'}</p></div><div className="flex items-center gap-2"><StatusBadge status={program.proposalStatus} size="sm" /><button title="Setujui proposal" onClick={() => void reviewProgramProposal(program.id, 'approved')} className="rounded-md bg-emerald-700 p-2 text-white hover:bg-emerald-800"><CheckCircle2 size={15} /></button></div></div>)}{!pendingProposals.length && <p className="py-6 text-center text-sm text-slate-500">Tidak ada proposal menunggu review.</p>}</div>
      </article>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Clock3 size={18} className="text-amber-700"/><h2 className="font-bold text-slate-900">Pendaftar program terbaru</h2></div><div className="mt-4 grid gap-3 md:grid-cols-2">{pendingApplications.slice(0, 6).map(application => <article key={application.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><div className="flex justify-between gap-2"><p className="font-semibold text-slate-800">{application.volunteerName}</p><StatusBadge status={application.status} size="sm" /></div><p className="mt-1 text-xs text-slate-500">{application.programTitle} · {application.partnerName}</p><p className="mt-1 text-xs text-slate-500">{application.volunteerEmail}</p></article>)}{!pendingApplications.length && <p className="py-5 text-sm text-slate-500">Tidak ada pendaftar menunggu review.</p>}</div><button onClick={() => onNavigate('admin-applications')} className="mt-4 text-sm font-semibold text-blue-700">Kelola seluruh pendaftar <ArrowRight size={15} className="ml-1 inline" /></button></section>
  </div>;
};
