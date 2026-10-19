'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Trash2,
  FileCheck2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';
import { OrgType, OrgDocument } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const PartnerOrganizationForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { 
    partners, 
    updatePartnerOrg, 
    currentUser 
  } = useApp();

  const partnerOrg = partners.find(p => p.id === currentUser?.orgId);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saveToast, setSaveToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step A: Org Info
  const [name, setName] = useState(partnerOrg?.name || '');
  const [type, setType] = useState<OrgType>(partnerOrg?.type || 'corporate');
  const [sector, setSector] = useState(partnerOrg?.sector || '');
  const [description, setDescription] = useState(partnerOrg?.description || '');
  const [website, setWebsite] = useState(partnerOrg?.website || '');

  // Step B: Address & Contact
  const [address, setAddress] = useState(partnerOrg?.address || '');
  const [province, setProvince] = useState(partnerOrg?.province || 'DKI Jakarta');
  const [city, setCity] = useState(partnerOrg?.city || 'Jakarta Selatan');
  const [picName, setPicName] = useState(partnerOrg?.picName || currentUser?.name || '');
  const [picRole, setPicRole] = useState(partnerOrg?.picRole || 'Head of CSR');
  const [picPhone, setPicPhone] = useState(partnerOrg?.picPhone || currentUser?.phone || '');
  const [picEmail, setPicEmail] = useState(partnerOrg?.picEmail || currentUser?.email || '');

  // Step C: Partnership Goals & Docs
  const [collaborationReason, setCollaborationReason] = useState(partnerOrg?.collaborationReason || '');
  const [collaborationObjective, setCollaborationObjective] = useState(partnerOrg?.collaborationObjective || '');
  const [targetImpact, setTargetImpact] = useState(partnerOrg?.targetImpact || '');
  const [offeredContribution, setOfferedContribution] = useState(partnerOrg?.offeredContribution || '');
  const [collaborationPeriod, setCollaborationPeriod] = useState(partnerOrg?.collaborationPeriod || '12 Bulan');
  const [documents, setDocuments] = useState<OrgDocument[]>(partnerOrg?.documents || []);
  const [documentBusy,setDocumentBusy]=useState(false);
  const documentInputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{void fetch('/api/partner/organization/documents',{cache:'no-store'}).then(async response=>{const data=await response.json();if(response.ok)setDocuments((data.documents||[]).map((doc:any)=>({id:doc.id,name:doc.name,type:doc.type,size:doc.size,uploadedAt:doc.uploadedAt,verificationStatus:doc.verificationStatus,url:doc.url})))})},[]);

  const availableCities = INDONESIA_REGIONS.find(r => r.province === province)?.cities || [];

  const handleUploadDocument = async (file:File|null) => {
    if(!file)return;setErrorMsg('');setDocumentBusy(true);try{const form=new FormData();form.set('document',file);const response=await fetch('/api/partner/organization/documents',{method:'POST',body:form});const data=await response.json();if(!response.ok)throw new Error(data.error||'Dokumen gagal diunggah.');setDocuments(previous=>[data.document,...previous])}catch(error){setErrorMsg(error instanceof Error?error.message:'Dokumen gagal diunggah.')}finally{setDocumentBusy(false)}
  };

  const handleRemoveDocument = async (docId: string) => {
    const response=await fetch('/api/partner/organization/documents',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:docId})});const data=await response.json();if(!response.ok){setErrorMsg(data.error||'Dokumen gagal dihapus.');return}setDocuments(previous=>previous.filter(document=>document.id!==docId));
  };

  const handleSaveDraft = async () => {
    if (!partnerOrg) return false;
    const result=await updatePartnerOrg(partnerOrg.id, {
      name,
      type,
      sector,
      description,
      website,
      address,
      province,
      city,
      picName,
      picRole,
      picPhone,
      picEmail,
      collaborationReason,
      collaborationObjective,
      targetImpact,
      offeredContribution,
      collaborationPeriod,
      documents,
    });
    if(!result.success){setErrorMsg(result.message||'Profil gagal disimpan.');return false}
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
    return true;
  };

  const handleNext = async () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim() || !sector.trim() || !description.trim()) {
        setErrorMsg('Mohon lengkapi nama organisasi, sektor, dan deskripsi profil.');
        return;
      }
    } else if (step === 2) {
      if (!address.trim() || !picName.trim() || !picEmail.trim() || !picPhone.trim()) {
        setErrorMsg('Mohon lengkapi alamat dan identitas narahubung PIC.');
        return;
      }
    } else if (step === 3) {
      if (!collaborationReason.trim() || !collaborationObjective.trim()) {
        setErrorMsg('Mohon jelaskan alasan dan tujuan utama kemitraan.');
        return;
      }
    }
    const saved=await handleSaveDraft();
    if(!saved)return;
    setStep((step + 1) as any);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((step - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerOrg) return;

    const payload = {
      name,
      type,
      sector,
      description,
      website,
      address,
      province,
      city,
      picName,
      picRole,
      picPhone,
      picEmail,
      collaborationReason,
      collaborationObjective,
      targetImpact,
      offeredContribution,
      collaborationPeriod,
      documents,
    };

    const result=await updatePartnerOrg(partnerOrg.id,payload,partnerOrg.status==='revision_required');
    if(!result.success){setErrorMsg(result.message||'Profil gagal disimpan.');return}
    if (onComplete) onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Notice if Revision Required */}
      {partnerOrg?.status === 'revision_required' && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
            <RotateCcw size={16} className="text-orange-600" />
            <span>Permintaan Revisi dari Reviewer Admin PSA:</span>
          </div>
          <p className="text-xs text-orange-800 bg-white p-3 rounded-lg border border-orange-100">
            "{partnerOrg.reviewNotes || 'Mohon lengkapi dokumen legalitas resmi dan rincian kontak operasional.'}"
          </p>
          <p className="text-[11px] text-orange-700">
            Silakan perbaiki kolom yang diperlukan pada formulir di bawah ini, lalu klik tombol <strong>"Kirim Ulang Hasil Perbaikan"</strong>.
          </p>
        </div>
      )}

      {/* Stepper Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Profil &amp; Formulir Kemitraan Organisasi</h1>
              {partnerOrg && <StatusBadge status={partnerOrg.status} size="sm" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelengkapan legalitas dan identitas organisasi mitra untuk verifikasi kerja sama PSA.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto font-mono">
            Langkah {step} dari 4
          </span>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <div className="grid grid-cols-4 text-[11px] font-medium text-slate-500 text-center">
            <span className={step === 1 ? 'text-blue-600 font-bold' : ''}>1. Profil Lembaga</span>
            <span className={step === 2 ? 'text-blue-600 font-bold' : ''}>2. Alamat &amp; PIC</span>
            <span className={step === 3 ? 'text-blue-600 font-bold' : ''}>3. Dokumen &amp; Tujuan</span>
            <span className={step === 4 ? 'text-blue-600 font-bold' : ''}>4. Review &amp; Submit</span>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Draf profil organisasi berhasil disimpan!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Step Body */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: Org Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Langkah A — Identitas Organisasi</h3>
                <p className="text-xs text-slate-500">Nama resmi badan usaha atau lembaga kemasyarakatan</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Resmi Organisasi / Lembaga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PT Bumi Lestari Hijau atau Yayasan Lentera Bangsa"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bentuk / Tipe Organisasi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as OrgType)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="corporate">Perusahaan Swasta / BUMN (Program CSR)</option>
                    <option value="foundation">Yayasan Nirlaba (Non-Profit Foundation)</option>
                    <option value="community">Komunitas Sosial / Gerakan Pemuda</option>
                    <option value="university">Perguruan Tinggi / Universitas</option>
                    <option value="school">Sekolah / Lembaga Pendidikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bidang / Sektor Kegiatan Utama <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Contoh: Lingkungan Hidup, Pendidikan Anak, Kesehatan"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat &amp; Visi Organisasi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan fokus aktivitas lembaga, portofolio singkat, dan latar belakang berdiri..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Resmi / Kanal Media Sosial
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://lestarihijau.id atau https://instagram.com/akun"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Address & PIC */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Langkah B — Alamat Kantor &amp; Narahubung PIC</h3>
                <p className="text-xs text-slate-500">Kontak resmi perwakilan organisasi</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor / Sekretariat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. MT Haryono Kav. 33, Gedung Menara Hijau Lt. 14"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Provinsi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      const cities = INDONESIA_REGIONS.find(r => r.province === e.target.value)?.cities || [];
                      if (cities.length > 0) setCity(cities[0]);
                    }}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {INDONESIA_REGIONS.map(r => (
                      <option key={r.province} value={r.province}>{r.province}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {availableCities.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Informasi Person In Charge (PIC)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama PIC / Perwakilan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      placeholder="Nama lengkap narahubung"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jabatan di Organisasi
                    </label>
                    <input
                      type="text"
                      value={picRole}
                      onChange={(e) => setPicRole(e.target.value)}
                      placeholder="Contoh: Manajer CSR / Direktur Program"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Kerja PIC <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={picEmail}
                      onChange={(e) => setPicEmail(e.target.value)}
                      placeholder="pic@instansi.id"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. WhatsApp / Telepon PIC <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={picPhone}
                      onChange={(e) => setPicPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Goals & Supporting Documents */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Langkah C — Dokumen Legalitas &amp; Rencana Kerja Sama</h3>
                <p className="text-xs text-slate-500">Tujuan dan komitmen kolaborasi bersama PSA</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Ingin Bermitra dengan PSA <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={collaborationReason}
                  onChange={(e) => setCollaborationReason(e.target.value)}
                  placeholder="Mengapa organisasi Anda memilih platform PSA untuk program kerelawanan ini..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tujuan &amp; Target Dampak Kerja Sama <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={collaborationObjective}
                    onChange={(e) => setCollaborationObjective(e.target.value)}
                    placeholder="Contoh: Menanam 10.000 bibit mangrove dan melatih 200 pemuda pesisir..."
                    className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bentuk Kontribusi yang Ditawarkan
                  </label>
                  <textarea
                    rows={2}
                    value={offeredContribution}
                    onChange={(e) => setOfferedContribution(e.target.value)}
                    placeholder="Contoh: Fasilitasi logistik lapangan, modul pelatihan, pendanaan bibit..."
                    className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Upload Documents Simulator */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Dokumen Pendukung / Legalitas Lembaga
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Akta Pendirian, SK Kemenkumham, NIB, atau Surat Pengantar Kerja Sama (PDF/JPG/PNG, maks. 10 MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>{documentBusy?'Mengunggah…':'Unggah Berkas'}</span>
                  </button>
                </div>

                <input ref={documentInputRef} type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" onChange={event=>{void handleUploadDocument(event.target.files?.[0]||null);event.currentTarget.value=''}} />

                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <div 
                      onClick={() => documentInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <Upload size={24} className="mx-auto text-slate-400 mb-1.5" />
                      <p className="text-xs font-medium text-slate-700">Klik untuk menambahkan berkas legalitas</p>
                      <p className="text-[11px] text-slate-400">Berkas disimpan di bucket privat organisasi Anda.</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900 block truncate max-w-xs">{doc.url?<a href={doc.url} target="_blank" rel="noreferrer" className="underline">{doc.name}</a>:doc.name}</span>
                            <span className="text-[10px] text-slate-400">{doc.type} · {doc.size} · Diunggah {doc.uploadedAt}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Hapus dokumen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[11px] text-slate-400 uppercase font-mono block">Ringkasan Pengajuan Kemitraan</span>
                  <h3 className="text-base font-bold text-slate-900">{name}</h3>
                  <span className="text-blue-600 font-semibold">{sector} · {province}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block font-medium">Alamat:</span>
                    <span className="text-slate-800">{address}, {city}, {province}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Narahubung PIC:</span>
                    <span className="text-slate-800">{picName} ({picRole}) - {picPhone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-medium">Tujuan Kerja Sama:</span>
                    <span className="text-slate-800">{collaborationObjective || '-'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-medium">Dokumen yang Disertakan ({documents.length}):</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {documents.map(d => (
                        <span key={d.id} className="bg-white border border-slate-200 px-2.5 py-1 rounded text-[11px] text-slate-700">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
                Dengan menekan tombol kirim di bawah, perwakilan menyatakan seluruh data dan dokumen yang dilampirkan adalah benar dan sah. Admin PSA akan meninjau pengajuan dalam 1-3 hari kerja.
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Sebelumnya</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Simpan Draf</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {partnerOrg?.status === 'revision_required' ? 'Kirim Revisi ke Admin' : 'Simpan Profil Organisasi'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
