'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProgramsDirectory } from '@/src/components/public/ProgramsDirectory';
import { VolunteerApplyModal } from '@/src/components/volunteer/VolunteerApplyModal';
import { useApp } from '@/src/context/AppContext';
import type { Program } from '@/src/types';

export default function PublicProgramsPage() {
  const { publicDirectoryLoading, publicDirectoryError } = useApp();
  const [applying, setApplying] = useState<Program | null>(null);
  return <main className="min-h-screen bg-slate-50 py-4">
    <div className="mx-auto max-w-7xl px-4"><Link href="/" className="text-sm font-semibold text-blue-800">← Kembali ke beranda PSA</Link></div>
    {publicDirectoryLoading && <p role="status" className="mx-auto max-w-7xl px-4 pt-5 text-sm text-slate-600">Memuat program dari PSA…</p>}
    {publicDirectoryError && <p role="alert" className="mx-auto max-w-7xl px-4 pt-5 text-sm text-rose-700">{publicDirectoryError}</p>}
    <ProgramsDirectory onOpenApply={setApplying} />
    <VolunteerApplyModal program={applying} isOpen={!!applying} onClose={() => setApplying(null)} onSuccess={status => {
      alert(status === 'sent' ? 'Pendaftaran tersimpan dan Gmail menerima email konfirmasi.' : status === 'unknown' ? 'Pendaftaran tersimpan, tetapi status email belum dapat dipastikan. Admin dapat memeriksa riwayat follow-up.' : 'Pendaftaran tersimpan, tetapi email konfirmasi gagal dikirim. Admin dapat menindaklanjuti melalui Follow-up Email.');
      setApplying(null);
    }} />
  </main>;
}
