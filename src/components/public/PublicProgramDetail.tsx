'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react';
import type { Program } from '@/src/types';
import { VolunteerApplyModal } from '@/src/components/volunteer/VolunteerApplyModal';
import { useApp } from '@/src/context/AppContext';

const executionLabels: Record<string, string> = {
  planned: 'Segera dibuka', registration_open: 'Pendaftaran dibuka', registration_closed: 'Pendaftaran ditutup',
  selection: 'Seleksi peserta', participants_announced: 'Pengumuman peserta', preparing: 'Persiapan kegiatan',
  ongoing: 'Sedang berlangsung', pending_completion: 'Menunggu verifikasi selesai', completed: 'Selesai', canceled: 'Dibatalkan',
};

export function PublicProgramDetail({ program }: { program: Program }) {
  const { role } = useApp();
  const [applying, setApplying] = useState(false);
  const workspacePath = role === 'admin' ? '/admin/program' : role === 'partner' ? '/mitra/program' : null;
  const closed = program.publishedStatus !== 'published'
    || ['registration_closed', 'selection', 'participants_announced', 'preparing', 'ongoing', 'pending_completion', 'completed', 'canceled'].includes(program.executionStatus || '')
    || program.deadline < new Date().toISOString().slice(0, 10)
    || (program.targetQuota > 0 && program.enrolledCount >= program.targetQuota);

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
    <article className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href="/program" className="m-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800"><ArrowLeft size={16}/>Kembali ke katalog program</Link>
      <img src={program.image} alt={program.title} className="max-h-[440px] w-full bg-slate-100 object-cover" />
      <div className="space-y-7 p-5 sm:p-8">
        <header className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-800">{program.category}</span><span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{program.format.toUpperCase()}</span></div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{program.title}</h1>
          <p className="text-slate-600">Diselenggarakan oleh <strong className="text-slate-900">{program.partnerName}</strong></p>
          <p className="leading-relaxed text-slate-700">{program.summary}</p>
        </header>

        <section className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2" aria-label="Informasi program">
          <p className="flex items-start gap-2 text-sm text-slate-700"><CalendarDays size={17} className="mt-0.5 shrink-0 text-blue-700"/><span><strong>Jadwal:</strong> {program.schedule}<br/>{program.startDate} – {program.endDate}</span></p>
          <p className="flex items-start gap-2 text-sm text-slate-700"><MapPin size={17} className="mt-0.5 shrink-0 text-blue-700"/><span><strong>Lokasi:</strong> {program.city ? `${program.city}, ${program.province || ''}` : 'Daring'}{program.address ? ` · ${program.address}` : ''}</span></p>
          <p className="flex items-start gap-2 text-sm text-slate-700"><Users size={17} className="mt-0.5 shrink-0 text-blue-700"/><span><strong>Pendaftar:</strong> {program.enrolledCount} / {program.targetQuota > 0 ? program.targetQuota : 'Tidak dibatasi'}</span></p>
          <p className="text-sm text-slate-700"><strong>Batas pendaftaran:</strong> {program.deadline}</p>
        </section>

        <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="font-bold text-blue-950">Status program: {program.publishedStatus === 'closed' ? 'Pendaftaran ditutup oleh Admin' : executionLabels[program.executionStatus || 'planned']}</h2>
          {program.publicAnnouncement && <p className="mt-1 text-sm text-slate-700">{program.publicAnnouncement}</p>}
          {program.publicTimeline?.length ? <ol className="mt-4 space-y-3 border-l border-blue-200 pl-4">{program.publicTimeline.map((item, index) => <li key={`${item.createdAt}-${index}`} className="text-sm text-slate-700"><time className="mr-2 text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</time>{item.announcement || executionLabels[item.status] || item.status}</li>)}</ol> : <p className="mt-2 text-sm text-slate-600">Belum ada pembaruan status publik.</p>}
        </section>

        <section><h2 className="text-lg font-bold text-slate-900">Deskripsi program</h2><p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{program.description}</p></section>
        {program.objectives.length > 0 && <section><h2 className="text-lg font-bold text-slate-900">Tujuan dan capaian</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">{program.objectives.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
        <section className="grid gap-5 sm:grid-cols-2"><div><h2 className="font-bold text-slate-900">Persyaratan relawan</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{program.requirements.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h2 className="font-bold text-slate-900">Aksesibilitas</h2><p className="mt-2 text-sm text-slate-700">{program.accessibilityInfo || 'Hubungi penyelenggara untuk informasi aksesibilitas.'}</p></div></section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">{workspacePath ? <><p className="text-sm text-slate-600">Anda melihat detail publik program ini. Pengelolaan program tersedia di workspace Anda.</p><Link href={workspacePath} className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white">Buka pengelolaan program</Link></> : <><p className="text-sm text-slate-600">Pendaftaran tidak memerlukan akun. Konfirmasi dikirim ke email yang Anda cantumkan.</p><button type="button" disabled={closed} onClick={() => setApplying(true)} className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400">{closed ? 'Pendaftaran ditutup' : 'Daftar sebagai relawan'}</button></>}</footer>
      </div>
    </article>
    {!workspacePath && <VolunteerApplyModal program={program} isOpen={applying} onClose={() => setApplying(false)} onSuccess={status => { alert(status === 'sent' ? 'Pendaftaran tersimpan dan Gmail menerima email konfirmasi.' : status === 'unknown' ? 'Pendaftaran tersimpan, tetapi status email belum dapat dipastikan. Admin dapat memeriksa riwayat follow-up.' : 'Pendaftaran tersimpan, tetapi email konfirmasi gagal dikirim. Admin dapat menindaklanjuti melalui Follow-up Email.'); setApplying(false); }} />}
  </main>;
}
