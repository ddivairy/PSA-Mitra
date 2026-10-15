'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building2, 
  Phone, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register_vol' | 'register_partner';
  onSuccess: (role: 'volunteer' | 'partner' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { 
    users, 
    loginAsUser, 
    registerVolunteerAccount, 
    registerPartnerAccount, 
    verifyCurrentUserEmail,
    currentUser 
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register_vol' | 'register_partner' | 'verify'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Volunteer register form
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volPassword, setVolPassword] = useState('');
  const [volTerms, setVolTerms] = useState(false);

  // Partner register form
  const [partPicName, setPartPicName] = useState('');
  const [partOrgName, setPartOrgName] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partPassword, setPartPassword] = useState('');
  const [partTerms, setPartTerms] = useState(false);

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Silakan masukkan alamat email terdaftar.');
      return;
    }

    const targetUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (targetUser) {
      loginAsUser(targetUser.id);
      onSuccess(targetUser.role as any);
      onClose();
    } else {
      setErrorMsg('Email tidak ditemukan. Periksa kembali atau buat akun baru.');
    }
  };

  const handleVolRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!volName.trim() || !volEmail.trim() || !volPhone.trim() || !volPassword) {
      setErrorMsg('Mohon lengkapi semua kolom wajib pendaftaran.');
      return;
    }
    if (volPassword.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter demi keamanan akun.');
      return;
    }
    if (!volTerms) {
      setErrorMsg('Anda harus menyetujui Ketentuan Penggunaan dan Kebijakan Privasi.');
      return;
    }

    const res = registerVolunteerAccount({
      name: volName,
      email: volEmail,
      phone: volPhone,
      password: volPassword,
    });

    if (res.success) {
      setMode('verify');
    }
  };

  const handlePartnerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!partPicName.trim() || !partOrgName.trim() || !partEmail.trim() || !partPhone.trim() || !partPassword) {
      setErrorMsg('Mohon lengkapi seluruh field perwakilan & nama organisasi.');
      return;
    }
    if (partPassword.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }
    if (!partTerms) {
      setErrorMsg('Mohon setujui Ketentuan Layanan Kemitraan.');
      return;
    }

    const res = registerPartnerAccount({
      picName: partPicName,
      orgName: partOrgName,
      email: partEmail,
      phone: partPhone,
      password: partPassword,
    });

    if (res.success) {
      setMode('verify');
    }
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login' ? 'Masuk ke Platform PSA' :
        mode === 'register_vol' ? 'Pendaftaran Akun Relawan Baru' :
        mode === 'register_partner' ? 'Registrasi Akun Perwakilan Mitra' :
        'Konfirmasi Akun Anda'
      }
      subtitle={
        mode === 'verify'
          ? 'Langkah penting sebelum melengkapi profil dan mengajukan aplikasi'
          : 'Satu akun terpadu untuk mengakses program dan kolaborasi PSA'
      }
      maxWidth="md"
    >
      {/* Tab Switcher */}
      {mode !== 'verify' && (
        <div className="flex rounded-lg bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); resetForm(); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setMode('register_vol'); resetForm(); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'register_vol' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Relawan
          </button>
          <button
            type="button"
            onClick={() => { setMode('register_partner'); resetForm(); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'register_partner' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Mitra
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode 1: LOGIN */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Kata Sandi
              </label>
              <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                Lupa sandi?
              </span>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Buttons */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 mb-2">Masuk cepat dengan akun demo:</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  loginAsUser('user-vol-1');
                  onSuccess('volunteer');
                  onClose();
                }}
                className="px-2 py-1.5 text-[11px] font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 text-center"
              >
                Relawan Budi
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsUser('user-partner-1');
                  onSuccess('partner');
                  onClose();
                }}
                className="px-2 py-1.5 text-[11px] font-medium border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 text-center"
              >
                Mitra PT Bumi
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsUser('user-admin-1');
                  onSuccess('admin');
                  onClose();
                }}
                className="px-2 py-1.5 text-[11px] font-medium border border-blue-200 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-center"
              >
                Admin PSA
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            <span>Masuk ke Akun</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* Mode 2: REGISTER VOLUNTEER */}
      {mode === 'register_vol' && (
        <form onSubmit={handleVolRegisterSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={volName}
                onChange={(e) => setVolName(e.target.value)}
                placeholder="Contoh: Rian Pratama"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Pribadi
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={volEmail}
                onChange={(e) => setVolEmail(e.target.value)}
                placeholder="rian@email.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nomor WhatsApp / Telepon
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={volPhone}
                onChange={(e) => setVolPhone(e.target.value)}
                placeholder="081234567890"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={volPassword}
                onChange={(e) => setVolPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Gunakan kombinasi huruf dan angka.</p>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={volTerms}
                onChange={(e) => setVolTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Saya menyetujui Ketentuan Penggunaan dan Kebijakan Privasi data PSA.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Daftar Akun Relawan</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* Mode 3: REGISTER PARTNER */}
      {mode === 'register_partner' && (
        <form onSubmit={handlePartnerRegisterSubmit} className="space-y-3.5">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
            Pendaftaran ini membuat akun untuk <strong>perwakilan resmi organisasi</strong>. Persetujuan kemitraan resmi akan diverifikasi oleh Admin PSA setelah profil organisasi dilengkapi.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Lengkap PIC / Perwakilan
            </label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partPicName}
                onChange={(e) => setPartPicName(e.target.value)}
                placeholder="Nama penanggung jawab"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Resmi Organisasi / Lembaga / Perusahaan
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partOrgName}
                onChange={(e) => setPartOrgName(e.target.value)}
                placeholder="Contoh: PT Harapan Jaya atau Yayasan Bina Mandiri"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Kerja
              </label>
              <input
                type="email"
                value={partEmail}
                onChange={(e) => setPartEmail(e.target.value)}
                placeholder="pic@instansi.org"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={partPhone}
                onChange={(e) => setPartPhone(e.target.value)}
                placeholder="08123456789"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={partPassword}
                onChange={(e) => setPartPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={partTerms}
                onChange={(e) => setPartTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                Saya menyatakan berwenang mewakili organisasi ini dan menyetujui Ketentuan Kemitraan PSA.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Daftar Akun Mitra</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* Mode 4: EMAIL VERIFICATION */}
      {mode === 'verify' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Mail size={28} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              Verifikasi Akun
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Konfirmasikan akun untuk melanjutkan. Alamat email yang terdaftar:{' '}
              <span className="font-semibold text-slate-900">
                {currentUser?.email ? maskEmail(currentUser.email) : 'email Anda'}
              </span>
              . Silakan periksa kotak masuk atau folder spam Anda.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                verifyCurrentUserEmail();
                onSuccess(currentUser?.role as any || 'volunteer');
                onClose();
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Konfirmasi & Lanjutkan ke Profil
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
