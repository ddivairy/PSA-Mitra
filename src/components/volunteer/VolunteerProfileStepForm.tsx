'use client';

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Award, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';
import { GenderOption } from '../../types';

export const VolunteerProfileStepForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { volunteerProfile, updateVolunteerProfile, currentUser } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [saveToast, setSaveToast] = useState(false);

  // Form local states initialized from profile
  const [fullName, setFullName] = useState(volunteerProfile.fullName || currentUser?.name || '');
  const [birthDate, setBirthDate] = useState(volunteerProfile.birthDate || '');
  const [gender, setGender] = useState<GenderOption>(volunteerProfile.gender || 'male');
  const [bio, setBio] = useState(volunteerProfile.bio || '');

  const [province, setProvince] = useState(volunteerProfile.province || 'DKI Jakarta');
  const [city, setCity] = useState(volunteerProfile.city || 'Jakarta Selatan');
  const [interests, setInterests] = useState<string[]>(volunteerProfile.interests || ['Pendidikan', 'Lingkungan']);

  const [education, setEducation] = useState(volunteerProfile.education || '');
  const [skillsText, setSkillsText] = useState((volunteerProfile.skills || []).join(', '));
  const [experience, setExperience] = useState(volunteerProfile.experience || '');
  const [availability, setAvailability] = useState(volunteerProfile.availability || 'Akhir pekan (Sabtu-Minggu)');

  const availableCities = INDONESIA_REGIONS.find(r => r.province === province)?.cities || [];

  const interestOptions = [
    'Pendidikan',
    'Lingkungan',
    'Kesehatan',
    'Pemberdayaan Masyarakat',
    'Teknologi & Digital',
    'Kesenian & Budaya',
    'Bantuan Bencana & Kemanusiaan',
  ];

  const handleToggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter(i => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleSaveDraft = () => {
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    updateVolunteerProfile({
      fullName,
      birthDate,
      gender,
      bio,
      province,
      city,
      interests,
      education,
      skills: skillsArray,
      experience,
      availability,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleNext = () => {
    handleSaveDraft();
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as any);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as any);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Progress Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelengkapan Profil Relawan</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini digunakan untuk rekomendasi program yang relevan dan pertimbangan mitra saat meninjau aplikasi Anda.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto font-mono">
            Langkah {currentStep} dari 3
          </span>
        </div>

        {/* Stepper Progress bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          </div>
          <div className="grid grid-cols-3 text-[11px] font-medium text-slate-500 text-center">
            <span className={currentStep === 1 ? 'text-blue-600 font-bold' : ''}>1. Data Pribadi</span>
            <span className={currentStep === 2 ? 'text-blue-600 font-bold' : ''}>2. Lokasi &amp; Minat</span>
            <span className={currentStep === 3 ? 'text-blue-600 font-bold' : ''}>3. Keterampilan &amp; Jam</span>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Draf data profil berhasil disimpan otomatis!</span>
          </div>
        </div>
      )}

      {/* Main Step Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah A — Informasi Pribadi</h3>
              <p className="text-xs text-slate-500">Nama lengkap dan data dasar relawan</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Sesuai KTP / Identitas Resmi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">Digunakan untuk validasi batasan usia program tertentu.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender / Jenis Kelamin (Opsional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GenderOption)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="prefer_not_to_say">Memilih tidak menjawab</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Hanya dilaporkan secara agregat statistik untuk evaluasi gender inklusif.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Singkat / Bio Relawan
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan sedikit tentang latar belakang, motivasi sosial, atau hal yang paling Anda sukai..."
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Location & Interests */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah B — Domisili &amp; Minat Kegiatan</h3>
              <p className="text-xs text-slate-500">Membantu kami mencocokkan program di daerah terdekat Anda</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Provinsi Domisili <span className="text-rose-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    const newCities = INDONESIA_REGIONS.find(r => r.province === e.target.value)?.cities || [];
                    if (newCities.length > 0) setCity(newCities[0]);
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Kategori Minat Kerelawanan (Boleh lebih dari satu):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {interestOptions.map(opt => {
                  const isChecked = interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleInterest(opt)}
                      className={`text-left p-3 rounded-lg border text-xs font-medium transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <CheckCircle2 size={12} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Experience & Skills */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah C — Keterampilan &amp; Ketersediaan Waktu</h3>
              <p className="text-xs text-slate-500">Informasi pendukung agar mitra memahami kontribusi Anda</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pendidikan Terakhir / Pekerjaan
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Contoh: S1 Teknik Informatika UI / Mahasiswa Aktif / Karyawan Swasta"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterampilan &amp; Keahlian (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Contoh: Mengajar Anak, Desain Canva, Fotografi, Pertolongan Pertama, Public Speaking"
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengalaman Volunteer Sebelumnya (Bila ada)
              </label>
              <textarea
                rows={3}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Sebutkan kegiatan sosial atau komunitas yang pernah Anda ikuti..."
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ketersediaan Waktu Utama
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Akhir pekan (Sabtu-Minggu)">Akhir pekan saja (Sabtu - Minggu)</option>
                <option value="Hari kerja (Senin-Jumat)">Hari kerja (Senin - Jumat)</option>
                <option value="Fleksibel / Sesuai jadwal program">Fleksibel (Sesuai kebutuhan program)</option>
              </select>
            </div>
          </div>
        )}

        {/* Form Nav Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg flex items-center gap-1.5"
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
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Simpan Draf</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{currentStep === 3 ? 'Selesai & Simpan Profil' : 'Lanjutkan'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
