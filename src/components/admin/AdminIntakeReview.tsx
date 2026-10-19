'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Application = {
  id: string;
  partner_id?: string | null;
  organization_name: string;
  organization_type: string;
  sector: string;
  description: string;
  website: string | null;
  province: string;
  city: string;
  address: string;
  pic_name: string;
  pic_role: string;
  pic_email: string;
  pic_phone: string;
  status: string;
  review_notes: string | null;
  account_status: string;
  is_offline: boolean;
  created_at: string;
};

type Document = { id: string; application_id: string | null; organization_id?:string|null; file_name: string; url: string | null };
type Volunteer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  motivation: string;
  status: string;
  review_notes: string | null;
  created_at: string;
};
type ApprovedPartner = {
  id: string;
  user_id: string;
  name: string;
  pic_name: string;
  pic_email: string;
  pic_phone: string;
  status: string;
  created_at: string;
};
type Section = 'partnerships' | 'volunteers' | 'accounts';
type PartnerGroup = 'pending' | 'approved' | 'rejected';

const fieldClass = 'rounded-lg border border-slate-300 bg-white p-2.5 text-sm';
const emptyForm = {
  organization_name: '',
  organization_type: 'foundation',
  sector: '',
  province: '',
  city: '',
  address: '',
  description: '',
  website: '',
  pic_name: '',
  pic_role: '',
  pic_email: '',
  pic_phone: '',
};

const formFields: { key: keyof typeof emptyForm; label: string; required?: boolean; type?: string }[] = [
  { key: 'organization_name', label: 'Nama organisasi', required: true },
  { key: 'sector', label: 'Sektor', required: true },
  { key: 'province', label: 'Provinsi', required: true },
  { key: 'city', label: 'Kota/Kabupaten', required: true },
  { key: 'address', label: 'Alamat' },
  { key: 'description', label: 'Profil singkat' },
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'pic_name', label: 'Nama PIC', required: true },
  { key: 'pic_role', label: 'Jabatan PIC', required: true },
  { key: 'pic_email', label: 'Email PIC', required: true, type: 'email' },
  { key: 'pic_phone', label: 'WhatsApp PIC', required: true },
];

const numberFormatter = new Intl.NumberFormat('id-ID');

export function AdminIntakeReview() {
  const { refreshAdminWorkspace } = useApp();
  const [apps, setApps] = useState<Application[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [approvedPartners, setApprovedPartners] = useState<ApprovedPartner[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [manual, setManual] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState('');
  const [manualDocument, setManualDocument] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [section, setSection] = useState<Section>('partnerships');
  const [partnerGroup, setPartnerGroup] = useState<PartnerGroup>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingApplications = apps.filter(application =>
    application.status !== 'approved' && application.status !== 'rejected'
  );
  const approvedApplications = apps.filter(application => application.status === 'approved');
  const rejectedApplications = apps.filter(application => application.status === 'rejected');
  const visibleApplications = useMemo(() => {
    const group = {
      pending: pendingApplications,
      approved: approvedApplications,
      rejected: rejectedApplications,
    }[partnerGroup];
    const query = searchQuery.trim().toLocaleLowerCase('id-ID');
    if (!query) return group;
    return group.filter(application => [
      application.organization_name,
      application.sector,
      application.pic_name,
      application.pic_email,
      application.city,
    ].some(value => value.toLocaleLowerCase('id-ID').includes(query)));
  }, [apps, partnerGroup, searchQuery]);

  async function load() {
    setLoading(true);
    try {
      const [applicationResponse, volunteerResponse] = await Promise.all([
        fetch('/api/admin/partnership-applications', { cache: 'no-store' }),
        fetch('/api/admin/volunteer-registrations', { cache: 'no-store' }),
      ]);
      const [applicationData, volunteerData] = await Promise.all([
        applicationResponse.json(),
        volunteerResponse.json(),
      ]);
      if (!applicationResponse.ok || !volunteerResponse.ok) {
        throw new Error(applicationData.error || volunteerData.error || 'Gagal memuat data.');
      }
      setApps(applicationData.applications || []);
      setDocs(applicationData.documents || []);
      setApprovedPartners(applicationData.approvedPartners || []);
      setVolunteers(volunteerData.registrations || []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function decide(id: string, status: string, notesValue: string) {
    setError('');
    setNotice('');
    setPasswordNotice('');
    try {
      const response = await fetch(`/api/admin/partnership-applications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notesValue }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Keputusan gagal.');
      if (data.temporaryPassword) {
        setPasswordNotice(`Akun dibuat. Kata sandi sementara (tampilkan dan salin sekarang): ${data.temporaryPassword}`);
      } else if (status === 'approved') {
        setNotice(data.accountAlreadyCreated ? 'Akun mitra sudah tertaut; tidak dibuat ulang.' : 'Pengajuan disetujui.');
      }
      await Promise.all([load(), refreshAdminWorkspace()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Keputusan gagal.');
    }
  }

  async function saveManual(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.set(key, value));
    if (manualDocument) data.set('document', manualDocument);
    try {
      const response = await fetch('/api/admin/partnership-applications', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan pengajuan.');
      setManual(false);
      setManualDocument(null);
      setForm(emptyForm);
      setNotice('Pengajuan offline dicatat dan siap direview.');
      await Promise.all([load(), refreshAdminWorkspace()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Gagal menyimpan pengajuan.');
    }
  }

  async function decideVolunteer(id: string, status: string) {
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/volunteer-registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes: notes[`v-${id}`] || '' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan seleksi.');
      setNotice('Hasil seleksi relawan tersimpan.');
      await Promise.all([load(), refreshAdminWorkspace()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Gagal menyimpan seleksi.');
    }
  }

  async function createPartnerAccount(partner: ApprovedPartner) {
    setError('');
    setNotice('');
    setPasswordNotice('');
    try {
      const response = await fetch(`/api/admin/partners/${encodeURIComponent(partner.id)}/account`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Akun mitra gagal dibuat.');
      setPasswordNotice(result.temporaryPassword
        ? `Akun ${partner.name} siap. Kata sandi sementara (salin sekarang): ${result.temporaryPassword}`
        : result.accountAlreadyExisted ? 'Akun mitra sudah ada dan tetap tertaut.' : 'Akun mitra tertaut.');
      await Promise.all([load(), refreshAdminWorkspace()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Akun mitra gagal dibuat.');
    }
  }

  const statusCards = [
    {
      label: 'Menunggu verifikasi',
      count: pendingApplications.length,
      borderClass: 'border-amber-200 bg-amber-50',
      labelClass: 'text-amber-800',
      countClass: 'text-amber-900',
    },
    {
      label: 'Mitra disetujui',
      count: approvedApplications.length,
      borderClass: 'border-emerald-200 bg-emerald-50',
      labelClass: 'text-emerald-800',
      countClass: 'text-emerald-900',
    },
    {
      label: 'Pengajuan ditolak',
      count: rejectedApplications.length,
      borderClass: 'border-orange-200 bg-orange-50',
      labelClass: 'text-orange-800',
      countClass: 'text-orange-900',
    },
  ];
  const partnerGroups: { id: PartnerGroup; label: string; count: number }[] = [
    { id: 'pending', label: 'Pending / Belum disetujui', count: pendingApplications.length },
    { id: 'approved', label: 'Sudah disetujui', count: approvedApplications.length },
    { id: 'rejected', label: 'Ditolak', count: rejectedApplications.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 lg:px-8">
      {(error || notice || passwordNotice) && (
        <div
          role={error ? 'alert' : 'status'}
          className={`rounded-xl border p-3 text-sm ${
            error ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {error || passwordNotice || notice}
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Jenis pengelolaan admin">
        {[
          { id: 'partnerships' as const, label: 'Pengajuan Mitra' },
          { id: 'volunteers' as const, label: 'Seleksi Relawan' },
          { id: 'accounts' as const, label: 'Akun Mitra Disetujui' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            onClick={() => setSection(item.id)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
              section === item.id ? 'bg-[#0B2238] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'partnerships' && (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Ringkasan status mitra">
            {statusCards.map(card => (
              <article
                key={card.label}
                className={`rounded-xl border p-4 ${card.borderClass}`}
              >
                <p className={`text-xs font-medium ${card.labelClass}`}>{card.label}</p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${card.countClass}`}>
                  {numberFormatter.format(card.count)}
                </p>
              </article>
            ))}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Cari organisasi, sektor, atau PIC..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setManual(open => !open)}
                className="navy-button"
              >
                {manual ? 'Tutup formulir' : 'Tambah mitra offline'}
              </button>
            </div>

            {manual && (
              <form onSubmit={saveManual} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2">
                <label className="text-xs font-semibold">
                  Jenis organisasi
                  <select
                    className={`${fieldClass} mt-1 w-full`}
                    value={form.organization_type}
                    onChange={event => setForm(current => ({ ...current, organization_type: event.target.value }))}
                  >
                    {[
                      ['corporate', 'Perusahaan'],
                      ['foundation', 'Yayasan'],
                      ['community', 'Komunitas'],
                      ['university', 'Perguruan tinggi'],
                      ['school', 'Sekolah'],
                    ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                {formFields.map(field => (
                  <label key={field.key} className="text-xs font-semibold">
                    {field.label}
                    <input
                      required={field.required}
                      type={field.type || 'text'}
                      className={`${fieldClass} mt-1 w-full`}
                      value={form[field.key]}
                      onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}
                    />
                  </label>
                ))}
                <label className="text-xs font-semibold">
                  Dokumen pendukung
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={event => setManualDocument(event.target.files?.[0] || null)}
                    className="mt-1 block w-full text-xs"
                  />
                </label>
                <button type="submit" className="navy-button md:col-span-2">
                  Simpan pengajuan offline
                </button>
              </form>
            )}
          </section>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:grid-cols-3" role="tablist" aria-label="Kelompok status mitra">
            {partnerGroups.map(group => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={partnerGroup === group.id}
                onClick={() => setPartnerGroup(group.id)}
                className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  partnerGroup === group.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {group.label} <span className="ml-1 tabular-nums">({group.count})</span>
              </button>
            ))}
          </div>

          <section className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            {loading ? (
              <p role="status" className="px-5 py-10 text-center text-xs text-slate-500">Memuat pengajuan mitra...</p>
            ) : visibleApplications.length === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-slate-500">Tidak ada pengajuan mitra yang sesuai.</p>
            ) : visibleApplications.map(application => (
              <article key={application.id} className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-bold text-slate-900">{application.organization_name}</h3>
                      {application.is_offline && <span className="text-[11px] font-semibold text-violet-700">Offline</span>}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                        {application.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.sector} · {application.city}, {application.province}
                    </p>
                    <p className="mt-1 break-words text-xs text-slate-600">
                      PIC: {application.pic_name} ({application.pic_role}) · {application.pic_email} · {application.pic_phone}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {new Date(application.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {application.description && (
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{application.description}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Alamat: {application.address || '—'} · Website: {application.website || '—'} · Akun: {application.account_status}
                </p>

                {docs.filter(document => document.application_id === application.id || (application.partner_id && document.organization_id === application.partner_id)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {docs.filter(document => document.application_id === application.id || (application.partner_id && document.organization_id === application.partner_id)).map(document => (
                      document.url ? (
                        <a
                          key={document.id}
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-slate-50"
                        >
                          Dokumen: {document.file_name}
                        </a>
                      ) : (
                        <span key={document.id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                          Dokumen: {document.file_name}
                        </span>
                      )
                    ))}
                  </div>
                )}

                {application.review_notes && (
                  <p className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900">
                    Catatan sebelumnya: {application.review_notes}
                  </p>
                )}

                {application.status !== 'approved' && application.status !== 'rejected' && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <textarea
                      className={`${fieldClass} w-full`}
                      placeholder="Catatan review, wajib untuk revisi atau penolakan"
                      value={notes[application.id] ?? application.review_notes ?? ''}
                      onChange={event => setNotes(current => ({ ...current, [application.id]: event.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void decide(application.id, 'under_review', notes[application.id] ?? '')}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Tandai ditinjau
                      </button>
                      <button
                        type="button"
                        onClick={() => void decide(application.id, 'revision_required', notes[application.id] ?? '')}
                        className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50"
                      >
                        Minta revisi
                      </button>
                      <button
                        type="button"
                        onClick={() => void decide(application.id, 'rejected', notes[application.id] ?? '')}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => void decide(application.id, 'approved', notes[application.id] ?? '')}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                      >
                        Setujui &amp; buat akun
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        </>
      )}

      {section === 'volunteers' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Seleksi Relawan</h2>
            <p className="mt-1 text-xs text-slate-500">
              Relawan tidak mendapat akun portal saat ini; admin dapat mengirim follow-up melalui menu follow-up.
            </p>
          </div>
          {loading ? (
            <p role="status" className="p-5 text-center text-xs text-slate-500">Memuat pendaftaran relawan...</p>
          ) : volunteers.length === 0 ? (
            <p className="p-5 text-center text-xs text-slate-500">Belum ada pendaftar relawan.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {volunteers.map(volunteer => (
                <article key={volunteer.id} className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{volunteer.full_name}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {volunteer.email} · {volunteer.phone} · {volunteer.city}, {volunteer.province}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                      {volunteer.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{volunteer.motivation}</p>
                  <textarea
                    className={`${fieldClass} w-full`}
                    placeholder="Catatan seleksi"
                    value={notes[`v-${volunteer.id}`] ?? volunteer.review_notes ?? ''}
                    onChange={event => setNotes(current => ({ ...current, [`v-${volunteer.id}`]: event.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['under_review', 'Tinjau'],
                      ['revision_required', 'Minta informasi'],
                      ['selected', 'Pilih'],
                      ['rejected', 'Tolak'],
                    ].map(([status, label]) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void decideVolunteer(volunteer.id, status)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {section === 'accounts' && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900">Akun Mitra Disetujui</h2>
            <p className="mt-1 text-xs text-slate-500">Buat atau tautkan akun portal untuk organisasi yang telah disetujui.</p>
          </div>
          {approvedPartners.length === 0 ? (
            <p className="p-5 text-center text-xs text-slate-500">Belum ada mitra disetujui.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {approvedPartners.map(partner => (
                <article key={partner.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{partner.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{partner.pic_name} · {partner.pic_email} · {partner.pic_phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void createPartnerAccount(partner)}
                    className="rounded-lg border border-[#5C80B6]/30 px-3 py-2 text-xs font-bold text-[#42699e] transition-colors hover:bg-[#5C80B6]/10"
                  >
                    Buat / tautkan akun
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
