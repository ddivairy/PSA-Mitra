import React, { useState } from 'react';
import { Program } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

interface VolunteerApplyModalProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VolunteerApplyModal: React.FC<VolunteerApplyModalProps> = ({
  program,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { applyToProgram, volunteerProfile, currentUser, role } = useApp();

  const [motivation, setMotivation] = useState('');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!program) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!motivation.trim()) {
      setErrorMsg('Mohon jelaskan motivasi Anda mendaftar program ini.');
      return;
    }
    if (!agreed) {
      setErrorMsg('Anda wajib menyetujui komitmen kehadiran dan tata tertib kegiatan.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const answers: Record<string, string> = {};
      if (q1.trim()) answers['Pertanyaan Khusus 1'] = q1.trim();
      if (q2.trim()) answers['Ketersediaan Waktu Khusus'] = q2.trim();

      const res = applyToProgram(program.id, motivation, answers);
      setIsSubmitting(false);

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
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
        {/* Profile Confirmation Strip */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <UserCheck size={16} className="text-blue-600" />
            <span>Data Pendaftar (Sesuai Profil Relawan Anda):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
              <span className="font-semibold text-slate-900">{volunteerProfile.fullName || currentUser?.name || 'Relawan PSA'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email</span>
              <span className="font-semibold text-slate-900">{currentUser?.email || 'relawan@gmail.com'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Domisili</span>
              <span className="font-semibold text-slate-900">{volunteerProfile.city}, {volunteerProfile.province}</span>
            </div>
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
