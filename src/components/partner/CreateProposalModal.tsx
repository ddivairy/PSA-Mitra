'use client';

import React, { useEffect, useState } from 'react';
import { Program, ProgramCategory, ProgramFormat } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProgram?: Program;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProgram,
}) => {
  const { createProgramProposal, currentUser, partners } = useApp();

  const partnerOrg = partners.find(p => p.id === currentUser?.orgId);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Basic info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProgramCategory>('Pendidikan');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [objectivesText, setObjectivesText] = useState('');

  // Step 2: Delivery plan
  const [format, setFormat] = useState<ProgramFormat>('offline');
  const [province, setProvince] = useState('DKI Jakarta');
  const [city, setCity] = useState('Jakarta Selatan');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schedule, setSchedule] = useState('');
  const [targetQuota, setTargetQuota] = useState(25);
  const [deadline, setDeadline] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState('');

  // Step 3: PIC & Resources
  const [picName, setPicName] = useState(partnerOrg ? partnerOrg.picName : '');
  const [picContact, setPicContact] = useState(partnerOrg ? `${partnerOrg.picPhone} / ${partnerOrg.picEmail}` : '');
  const [selectedImage, setSelectedImage] = useState('/images/program_youth_mentoring_1791874040738.jpg');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!existingProgram) {
      setStep(1); setErrorMsg(''); setTitle(''); setCategory('Pendidikan'); setSummary(''); setDescription(''); setObjectivesText('');
      setFormat('offline'); setProvince('DKI Jakarta'); setCity('Jakarta Selatan'); setAddress(''); setStartDate(''); setEndDate(''); setSchedule('');
      setTargetQuota(25); setDeadline(''); setRequirementsText(''); setAccessibilityInfo('');
      setPicName(partnerOrg?.picName || currentUser?.name || ''); setPicContact(partnerOrg ? `${partnerOrg.picPhone} / ${partnerOrg.picEmail}` : currentUser?.email || '');
      setSelectedImage('/images/program_youth_mentoring_1791874040738.jpg');
      return;
    }
    setTitle(existingProgram.title); setCategory(existingProgram.category); setSummary(existingProgram.summary);
    setDescription(existingProgram.description); setObjectivesText(existingProgram.objectives.join('\n'));
    setFormat(existingProgram.format); setProvince(existingProgram.province || 'DKI Jakarta');
    setCity(existingProgram.city || 'Jakarta Selatan'); setAddress(existingProgram.address || '');
    setStartDate(existingProgram.startDate); setEndDate(existingProgram.endDate); setSchedule(existingProgram.schedule);
    setTargetQuota(existingProgram.targetQuota); setDeadline(existingProgram.deadline);
    setRequirementsText(existingProgram.requirements.join('\n')); setAccessibilityInfo(existingProgram.accessibilityInfo || '');
    setPicName(existingProgram.picName); setPicContact(existingProgram.picContact); setSelectedImage(existingProgram.image);
  }, [existingProgram, isOpen, partnerOrg, currentUser]);

  const availableCities = INDONESIA_REGIONS.find(r => r.province === province)?.cities || [];

  const uploadCoverImage = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrorMsg('Gunakan gambar JPEG, PNG, atau WebP maksimal 5 MB.');
      return;
    }
    setUploadingImage(true);
    setErrorMsg('');
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/partner/program-media', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unggah gambar gagal.');
      setSelectedImage(result.imageUrl);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unggah gambar gagal.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!title.trim() || !summary.trim() || !description.trim()) {
        setErrorMsg('Mohon lengkapi judul, ringkasan, dan deskripsi program.');
        return;
      }
    } else if (step === 2) {
      if (!startDate || !deadline || !schedule.trim()) {
        setErrorMsg('Mohon lengkapi tanggal mulai, batas pendaftaran, dan jadwal pelaksanaan.');
        return;
      }
    } else if (step === 3) {
      if (!picName.trim() || !picContact.trim()) {
        setErrorMsg('Mohon lengkapi data narahubung PIC pelaksanaan program.');
        return;
      }
    }
    setStep((step + 1) as any);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((step - 1) as any);
  };

  const persistProposal = async (saveAs: 'draft' | 'submitted') => {
    setErrorMsg('');
    if (!partnerOrg || partnerOrg.status !== 'approved') {
      setErrorMsg('Organisasi mitra belum aktif atau belum tertaut ke akun ini.');
      return;
    }
    const objectives = objectivesText.split('\n').map(s => s.trim()).filter(Boolean);
    const requirements = requirementsText.split('\n').map(s => s.trim()).filter(Boolean);

    const res = await createProgramProposal({
      partnerId: partnerOrg.id,
      partnerName: partnerOrg.name,
      title,
      category,
      summary,
      description,
      objectives: objectives.length > 0 ? objectives : ['Meningkatkan dampak sosial di komunitas target'],
      format,
      province: format !== 'online' ? province : undefined,
      city: format !== 'online' ? city : undefined,
      address: format !== 'offline' ? undefined : address,
      startDate,
      endDate: endDate || startDate,
      schedule,
      targetQuota,
      requirements: requirements.length > 0 ? requirements : ['Berkomitmen dan bertanggung jawab'],
      accessibilityInfo: accessibilityInfo || undefined,
      deadline,
      picName,
      picContact,
      image: selectedImage,
    }, { id:existingProgram?.id, saveAs });

    if (res.success) {
      onSuccess();
      onClose();
    } else setErrorMsg(res.message || 'Proposal gagal disimpan.');
  };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await persistProposal('submitted'); };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingProgram ? 'Edit Proposal Program Kolaborasi' : 'Pengajuan Proposal Program Kolaborasi Baru'}
      subtitle="Proposal akan ditinjau oleh Admin PSA sebelum dibuka untuk pendaftaran relawan"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Stepper */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <div className="grid grid-cols-4 text-[11px] font-medium text-slate-500 text-center">
            <span className={step === 1 ? 'text-blue-600 font-bold' : ''}>1. Informasi Dasar</span>
            <span className={step === 2 ? 'text-blue-600 font-bold' : ''}>2. Rencana Eksekusi</span>
            <span className={step === 3 ? 'text-blue-600 font-bold' : ''}>3. PIC &amp; Media</span>
            <span className={step === 4 ? 'text-blue-600 font-bold' : ''}>4. Review &amp; Kirim</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Program Kolaborasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Lokakarya Literasi Digital & Pemrograman Dasar Anak Desa"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProgramCategory)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Lingkungan">Lingkungan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
                  <option value="Teknologi & Digital">Teknologi &amp; Digital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ringkasan Singkat (1-2 kalimat untuk kartu program) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ringkasan aksi yang mudah dipahami calon relawan..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Lengkap &amp; Latar Belakang Masalah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan urgensi program, kondisi penerima manfaat, dan bagaimana peran relawan akan membantu..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan &amp; Capaian Output (Pisahkan dengan baris baru / enter)
                </label>
                <textarea
                  rows={3}
                  value={objectivesText}
                  onChange={(e) => setObjectivesText(e.target.value)}
                  placeholder="Contoh:&#10;- Melatih 100 siswa dasar logika komputasi&#10;- Membagikan 50 paket buku bacaan&#10;- Membentuk 1 taman bacaan desa"
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Plan */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format Pelaksanaan
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ProgramFormat)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="offline">Tatap Muka (Offline)</option>
                    <option value="online">Daring (Online)</option>
                    <option value="hybrid">Kombinasi (Hybrid)</option>
                  </select>
                </div>

                {format !== 'online' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Provinsi
                      </label>
                      <select
                        value={province}
                        onChange={(e) => {
                          setProvince(e.target.value);
                          const cities = INDONESIA_REGIONS.find(r => r.province === e.target.value)?.cities || [];
                          if (cities.length > 0) setCity(cities[0]);
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {INDONESIA_REGIONS.map(r => (
                          <option key={r.province} value={r.province}>{r.province}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kota / Kabupaten
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {availableCities.map(ct => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {format === 'offline' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap Lokasi Kegiatan
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama gedung, jalan, nomor, patokan lokasi..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Akhir Pendaftaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jadwal Rinci / Jam Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="Contoh: Setiap Sabtu & Minggu, 08:00 - 15:00 WIB"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Kuota Relawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={targetQuota}
                    onChange={(e) => setTargetQuota(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persyaratan Relawan (Pisahkan dengan baris baru / enter)
                </label>
                <textarea
                  rows={3}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="Contoh:&#10;- Minimal usia 18 tahun&#10;- Tertarik pada isu lingkungan&#10;- Bersedia hadir penuh 2 hari kegiatan"
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Aksesibilitas (Opsional)
                </label>
                <input
                  type="text"
                  value={accessibilityInfo}
                  onChange={(e) => setAccessibilityInfo(e.target.value)}
                  placeholder="Contoh: Gedung ramah kursi roda / Kegiatan daring ramah difabel"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Resources & PIC */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Narahubung / PIC Pelaksana <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Nama PIC penanggung jawab"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kontak PIC (No. Telp &amp; Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={picContact}
                    onChange={(e) => setPicContact(e.target.value)}
                    placeholder="08123456789 / pic@organisasi.id"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Visual Sampul Program:
                </label>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100">
                    {uploadingImage ? 'Mengunggah gambar…' : 'Unggah gambar sendiri'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage} onChange={event => { void uploadCoverImage(event.target.files?.[0]); event.currentTarget.value = ''; }} className="sr-only" />
                  </label>
                  <span className="text-[11px] text-slate-500">JPEG, PNG, WebP · maksimal 5 MB · file tersimpan di bucket media publik.</span>
                </div>
                {selectedImage.startsWith('http') && <img src={selectedImage} alt="Pratinjau sampul program" className="mb-3 h-36 w-full rounded-lg border object-cover" />}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => setSelectedImage('/images/program_youth_mentoring_1791874040738.jpg')}
                    className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage.includes('youth') ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                  >
                    <img src="/images/program_youth_mentoring_1791874040738.jpg" alt="Edukasi" className="w-full h-24 object-cover" />
                    <p className="p-1.5 text-[11px] font-medium text-slate-700 text-center">Edukasi &amp; Anak</p>
                  </div>
                  <div 
                    onClick={() => setSelectedImage('/images/program_mangrove_restoration_1791874041219.jpg')}
                    className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage.includes('mangrove') ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                  >
                    <img src="/images/program_mangrove_restoration_1791874041219.jpg" alt="Lingkungan" className="w-full h-24 object-cover" />
                    <p className="p-1.5 text-[11px] font-medium text-slate-700 text-center">Lingkungan Alam</p>
                  </div>
                  <div 
                    onClick={() => setSelectedImage('/images/hero_volunteer_community_1791874040463.jpg')}
                    className={`rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage.includes('community') ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200'
                    }`}
                  >
                    <img src="/images/hero_volunteer_community_1791874040463.jpg" alt="Sosial" className="w-full h-24 object-cover" />
                    <p className="p-1.5 text-[11px] font-medium text-slate-700 text-center">Pemberdayaan Warga</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-[11px] text-slate-400 block uppercase font-mono">Pratinjau Proposal</span>
                  <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                  <span className="text-blue-600 font-semibold">{category} · {format.toUpperCase()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Jadwal:</span>
                    <span>{schedule} (Mulai: {startDate})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Relawan:</span>
                    <span className="font-mono font-bold text-slate-900">{targetQuota} Orang</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lokasi:</span>
                    <span>{format === 'online' ? 'Online' : `${city}, ${province}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Batas Pendaftaran:</span>
                    <span className="text-rose-600 font-semibold">{deadline}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block">Ringkasan:</span>
                  <p className="text-slate-700 italic">"{summary}"</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
                Setelah tombol kirim ditekan, proposal akan masuk antrean review Admin PSA. Status proposal dapat Anda pantau di tab "Program Saya".
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Batal
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
                <div className="flex gap-2">
                  <button type="button" onClick={() => void persistProposal('draft')} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg">Simpan Draf</button>
                  <button type="submit" className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{existingProgram?.proposalStatus === 'revision_required' ? 'Kirim Ulang Proposal' : 'Kirim Proposal ke PSA'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
