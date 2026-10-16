import React, { useEffect, useRef, useState } from 'react';
import { Program, VolunteerApplication } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck, Upload, FileText, X } from 'lucide-react';

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setAttachment(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  }, [isOpen]);

  if (!program) return null;

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setAttachment(null);
      e.target.value = '';
      setErrorMsg('Lampiran harus berupa file PDF, JPG, atau PNG.');
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachment(null);
      e.target.value = '';
      setErrorMsg('Ukuran lampiran maksimal 2 MB.');
      return;
    }
    setAttachment(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const answers: Record<string, string> = {};
    if (q1.trim()) answers['Pertanyaan Khusus 1'] = q1.trim();
    if (q2.trim()) answers['Ketersediaan Waktu Khusus'] = q2.trim();

    let attachmentData: VolunteerApplication['attachment'];
    if (attachment) {
      try {
        attachmentData = await readAttachment(attachment);
      } catch (error) {
        console.error('Failed to read volunteer application attachment:', error);
        setErrorMsg('Lampiran gagal dibaca. Silakan pilih file lain dan coba kembali.');
        setIsSubmitting(false);
        return;
      }
    }

    const res = applyToProgram(program.id, motivation, answers, attachmentData);
    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
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

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-800">
            Lampiran Pendukung <span className="font-normal text-slate-400">(Opsional)</span>
          </label>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <Upload size={16} className="mt-0.5 shrink-0 text-[#5C80B6]" aria-hidden="true" />
                <span>Unggah sertifikat atau dokumen pendukung. Format PDF, JPG, PNG; maks. 2 MB.</span>
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                <Upload size={14} aria-hidden="true" />
                Pilih file
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleAttachmentChange}
                  className="sr-only"
                  aria-label="Pilih lampiran pendukung (opsional)"
                />
              </label>
            </div>
            {attachment && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-700">
                  <FileText size={16} className="shrink-0 text-[#5C80B6]" aria-hidden="true" />
                  <span className="truncate font-medium">{attachment.name}</span>
                  <span className="shrink-0 text-slate-400">{Math.ceil(attachment.size / 1024)} KB</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-rose-600"
                  aria-label="Hapus lampiran"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
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

const readAttachment = (file: File) => new Promise<NonNullable<VolunteerApplication['attachment']>>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      reject(new Error('File tidak menghasilkan data yang valid.'));
      return;
    }
    resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: reader.result,
    });
  };
  reader.onerror = () => reject(reader.error ?? new Error('File gagal dibaca.'));
  reader.readAsDataURL(file);
});
