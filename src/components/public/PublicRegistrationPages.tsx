'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, FileText, Mail, Phone, UserRound } from 'lucide-react';

type RegistrationPageProps = { onBack: () => void };

function RegistrationFrame({ title, description, onBack, children }: RegistrationPageProps & { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="min-h-[65vh] bg-slate-50 px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700">
          <ArrowLeft size={16} /> Kembali ke beranda
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SubmissionNotice({ title, email, onBack }: { title: string; email: string; onBack: () => void }) {
  return (
    <div className="py-8 text-center">
      <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
      <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
        Data sudah tercatat untuk email <strong className="text-slate-900">{email}</strong>. Admin PSA akan meninjau pengajuan dan menghubungi Anda melalui kanal follow-up.
      </p>
      <button onClick={onBack} className="mt-6 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Kembali ke beranda</button>
    </div>
  );
}

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'block text-sm font-medium text-slate-700';

export function VolunteerRegistrationPage({ onBack }: RegistrationPageProps) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', province: '', city: '', motivation: '' });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!terms) { setError('Anda harus menyetujui Ketentuan Penggunaan dan Kebijakan Privasi.'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/public/volunteer-registrations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), province: form.province.trim(), city: form.city.trim(), motivation: form.motivation.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pendaftaran relawan gagal disimpan.');
      setSubmittedEmail(form.email.trim());
    } catch (err) { setError(err instanceof Error ? err.message : 'Pendaftaran relawan gagal disimpan.'); }
    finally { setBusy(false); }
  };

  return <RegistrationFrame title="Pendaftaran Relawan" description="Isi data diri dan motivasi Anda. Tim PSA akan meninjau pendaftaran dan menghubungi Anda." onBack={onBack}>
    {submittedEmail ? <SubmissionNotice title="Pendaftaran relawan diterima" email={submittedEmail} onBack={onBack} /> : <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <label className={labelClass}>Nama lengkap<input className={inputClass} required value={form.fullName} onChange={e => update('fullName', e.target.value)} autoComplete="name" /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Email<input className={inputClass} type="email" required value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" /></label>
        <label className={labelClass}>Nomor WhatsApp<input className={inputClass} type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" /></label>
        <label className={labelClass}>Provinsi<input className={inputClass} required value={form.province} onChange={e => update('province', e.target.value)} /></label>
        <label className={labelClass}>Kota/Kabupaten<input className={inputClass} required value={form.city} onChange={e => update('city', e.target.value)} /></label>
      </div>
      <label className={labelClass}>Motivasi menjadi relawan<textarea className={inputClass} required maxLength={4000} rows={5} value={form.motivation} onChange={e => update('motivation', e.target.value)} /></label>
      <label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1" /><span>Saya menyetujui Ketentuan Penggunaan dan Kebijakan Privasi data PSA.</span></label>
      <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto">{busy ? 'Mengirim...' : 'Kirim Pendaftaran'} <ArrowRight size={16} /></button>
    </form>}
  </RegistrationFrame>;
}

export function PartnerRegistrationPage({ onBack }: RegistrationPageProps) {
  const [form, setForm] = useState({ picName: '', organizationName: '', email: '', phone: '', type: 'corporate', sector: '', province: '', city: '', picRole: '', description: '', website: '', address: '' });
  const [document, setDocument] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!terms) { setError('Mohon setujui Ketentuan Layanan Kemitraan.'); return; }
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.set(key, value.trim()));
      if (document) data.set('document', document);
      const response = await fetch('/api/public/partnership-applications', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pengajuan mitra gagal disimpan.');
      setSubmittedEmail(form.email.trim());
    } catch (err) { setError(err instanceof Error ? err.message : 'Pengajuan mitra gagal disimpan.'); }
    finally { setBusy(false); }
  };

  return <RegistrationFrame title="Pengajuan Kemitraan" description="Lengkapi profil organisasi dan dokumen pendukung. Akun portal mitra dibuat setelah pengajuan disetujui admin PSA." onBack={onBack}>
    {submittedEmail ? <SubmissionNotice title="Pengajuan kemitraan diterima" email={submittedEmail} onBack={onBack} /> : <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}><span className="inline-flex items-center gap-2"><UserRound size={15} /> Nama PIC</span><input className={inputClass} required value={form.picName} onChange={e => update('picName', e.target.value)} autoComplete="name" /></label>
        <label className={labelClass}><span className="inline-flex items-center gap-2"><Building2 size={15} /> Nama organisasi</span><input className={inputClass} required value={form.organizationName} onChange={e => update('organizationName', e.target.value)} /></label>
        <label className={labelClass}>Jenis organisasi<select className={inputClass} value={form.type} onChange={e => update('type', e.target.value)}><option value="corporate">Perusahaan</option><option value="foundation">Yayasan</option><option value="community">Komunitas</option><option value="university">Perguruan tinggi</option><option value="school">Sekolah</option></select></label>
        <label className={labelClass}>Sektor organisasi<input className={inputClass} required value={form.sector} onChange={e => update('sector', e.target.value)} /></label>
        <label className={labelClass}>Provinsi<input className={inputClass} required value={form.province} onChange={e => update('province', e.target.value)} /></label>
        <label className={labelClass}>Kota/Kabupaten<input className={inputClass} required value={form.city} onChange={e => update('city', e.target.value)} /></label>
        <label className={labelClass}>Jabatan PIC<input className={inputClass} required value={form.picRole} onChange={e => update('picRole', e.target.value)} /></label>
        <label className={labelClass}><span className="inline-flex items-center gap-2"><Phone size={15} /> Nomor WhatsApp PIC</span><input className={inputClass} type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)} /></label>
        <label className={labelClass}><span className="inline-flex items-center gap-2"><Mail size={15} /> Email kerja PIC</span><input className={inputClass} type="email" required value={form.email} onChange={e => update('email', e.target.value)} /></label>
        <label className={labelClass}>Website<input className={inputClass} type="url" placeholder="https://" value={form.website} onChange={e => update('website', e.target.value)} /></label>
      </div>
      <label className={labelClass}>Alamat organisasi<input className={inputClass} value={form.address} onChange={e => update('address', e.target.value)} /></label>
      <label className={labelClass}>Profil singkat organisasi<textarea className={inputClass} rows={4} maxLength={4000} value={form.description} onChange={e => update('description', e.target.value)} /></label>
      <label className={labelClass}><span className="inline-flex items-center gap-2"><FileText size={15} /> Dokumen pendukung (PDF/JPG/PNG, maksimal 10 MB)</span><input className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700" type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setDocument(e.target.files?.[0] || null)} /></label>
      <label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1" /><span>Saya berwenang mewakili organisasi ini dan menyetujui Ketentuan Kemitraan PSA.</span></label>
      <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto">{busy ? 'Mengirim...' : 'Kirim Pengajuan Mitra'} <ArrowRight size={16} /></button>
    </form>}
  </RegistrationFrame>;
}
