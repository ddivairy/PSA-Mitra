'use client';

import React, { useState } from 'react';
import { Program } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

interface VolunteerApplyModalProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emailStatus: 'sent' | 'failed' | 'unknown') => void;
}

export const VolunteerApplyModal: React.FC<VolunteerApplyModalProps> = ({
  program,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [motivation, setMotivation] = useState('');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!program) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !province.trim()) {
      setErrorMsg('Lengkapi identitas dan domisili Anda.');
      return;
    }
    if (motivation.trim().length < 10) {
      setErrorMsg('Mohon jelaskan motivasi Anda mendaftar program ini.');
      return;
    }
    if (!agreed) {
      setErrorMsg('Anda wajib menyetujui komitmen kehadiran dan tata tertib kegiatan.');
      return;
    }

    setIsSubmitting(true);
    const answers: Record<string, string> = {};
    if (q1.trim()) answers['Pengalaman terkait'] = q1.trim();
    if (q2.trim()) answers['Ketersediaan waktu'] = q2.trim();
    try {
      const response = await fetch(`/api/public/programs/${encodeURIComponent(program.id)}/applications`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ fullName, email, phone, province, city, motivation, answers }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pendaftaran gagal dikirim.');
      onSuccess(result.emailStatus === 'sent' ? 'sent' : result.emailStatus === 'unknown' ? 'unknown' : 'failed');
      onClose();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Pendaftaran gagal dikirim.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formulir Pendaftaran Relawan"
      subtitle={`Program: ${program.title}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Public applicant details */}
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <UserCheck size={16} className="text-blue-600" />
            <span>Data pendaftar (akun tidak diperlukan)</span>
          </div>
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            <input aria-label="Nama lengkap" autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nama lengkap" required maxLength={160} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs" />
            <input aria-label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email aktif" required maxLength={254} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs" />
            <input aria-label="Nomor WhatsApp" type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Nomor telepon / WhatsApp" required maxLength={40} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs" />
            <input aria-label="Provinsi" value={province} onChange={e=>setProvince(e.target.value)} placeholder="Provinsi" required maxLength={120} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs" />
            <input aria-label="Kota atau kabupaten" value={city} onChange={e=>setCity(e.target.value)} placeholder="Kota / kabupaten" required maxLength={120} className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs sm:col-span-2" />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Motivation field */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Motivasi Mengikuti Program <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Jelaskan alasan Anda tertarik dan apa kontribusi terbaik yang ingin Anda berikan..."
            required
            className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimal 1-2 kalimat deskriptif.</p>
        </div>

        {/* Custom program questions */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pertanyaan Tambahan Penyelenggara ({program.partnerName})
          </h4>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pengalaman Terkait / Kesiapan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="Contoh: Terbiasa aktivitas outdoor, pernah mengajar anak SD, dll."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Catatan Ketersediaan Waktu (Opsional)
            </label>
            <input
              type="text"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="Konfirmasi bahwa Anda dapat hadir penuh sesuai jadwal..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Commitment Agreement */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              Saya menyatakan data yang diisi benar dan berkomitmen hadir mengikuti seluruh rangkaian program dengan penuh rasa tanggung jawab.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Mengirim Aplikasi...</span>
            ) : (
              <>
                <span>Kirim Pendaftaran</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
