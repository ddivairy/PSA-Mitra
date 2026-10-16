'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { createClientSupabaseClient } from '../../../lib/supabase/client';
import type { PartnerOrganization, User } from '../../types';

export type AuthMode = 'login' | 'recovery_password' | 'force_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess: (role: 'volunteer' | 'partner' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const { setAuthenticatedUser } = useApp();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [isOpen, initialMode]);

  const activateProfile = (profile: Record<string, any>) => {
    const raw = profile.profile;
    const role = profile.role as 'admin' | 'partner' | 'volunteer';
    const user: User = { id: raw.id, name: raw.name, email: raw.email, phone: raw.phone || '', role, verified: Boolean(raw.verified), orgId: raw.orgId };
    const org = profile.organization;
    const organization: PartnerOrganization | undefined = org ? {
      id: org.id, userId: org.user_id, name: org.name, type: org.type, sector: org.sector,
      description: org.description || '', website: org.website || undefined, address: org.address || '',
      province: org.province, city: org.city, picName: org.pic_name, picRole: org.pic_role,
      picPhone: org.pic_phone, picEmail: org.pic_email, collaborationReason: org.collaboration_reason || '',
      collaborationFocus: org.collaboration_focus || [], collaborationObjective: org.collaboration_objective || '',
      targetImpact: org.target_impact || '', offeredContribution: org.offered_contribution || '',
      collaborationPeriod: org.collaboration_period || '', documents: [], status: org.status,
      reviewNotes: org.review_notes || undefined, history: [], createdAt: org.created_at,
    } : undefined;
    setAuthenticatedUser(user, organization);
    onSuccess(role);
    onClose();
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword) { setErrorMsg('Masukkan email dan kata sandi akun Supabase Anda.'); return; }
    const supabase = createClientSupabaseClient();
    if (!supabase) { setErrorMsg('Supabase belum dikonfigurasi. Login tidak tersedia.'); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
    if (error || !data.user) { setErrorMsg('Email atau kata sandi tidak valid.'); return; }
    const response = await fetch('/api/auth/profile', { cache: 'no-store' });
    const profile = await response.json();
    if (!response.ok || !['admin', 'partner', 'volunteer'].includes(profile.role)) {
      await supabase.auth.signOut();
      setErrorMsg(profile.error || 'Profil PSA akun ini belum tersedia.');
      return;
    }
    if (profile.role === 'volunteer' && process.env.NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED !== 'true') {
      await supabase.auth.signOut();
      setErrorMsg('Portal Relawan sedang dinonaktifkan sementara.');
      return;
    }
    if (profile.mustChangePassword) { setMode('force_password'); return; }
    activateProfile(profile);
  };

  const finishPasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    if (newPassword.length < 8) { setErrorMsg('Kata sandi baru minimal 8 karakter.'); return; }
    const supabase = createClientSupabaseClient();
    if (!supabase) { setErrorMsg('Supabase belum dikonfigurasi.'); return; }
    if (mode === 'force_password') {
      const response = await fetch('/api/auth/change-password-complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: loginPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) { setErrorMsg(result.error || 'Gagal menyimpan perubahan sandi.'); return; }
      await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: newPassword });
    } else {
      const result = await supabase.auth.updateUser({ password: newPassword });
      if (result.error) { setErrorMsg(result.error.message); return; }
    }
    const response = await fetch('/api/auth/profile', { cache: 'no-store' });
    const profile = await response.json();
    if (!response.ok) { setErrorMsg(profile.error || 'Profil akun tidak dapat dimuat.'); return; }
    activateProfile(profile);
  };

  const requestPasswordReset = async () => {
    const supabase = createClientSupabaseClient();
    if (!supabase || !loginEmail.trim()) { setErrorMsg('Masukkan email akun untuk menerima tautan reset.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/?auth=recovery`,
    });
    setSuccessMsg(error ? error.message : `Jika email terdaftar, tautan reset akan dikirim ke ${loginEmail.trim()}.`);
  };

  const title = mode === 'force_password' ? 'Ganti Kata Sandi Awal' : mode === 'recovery_password' ? 'Atur Ulang Kata Sandi' : 'Masuk ke Platform PSA';
  const subtitle = mode === 'login' ? 'Masuk menggunakan akun PSA Anda' : 'Lindungi akun dengan kata sandi baru';

  return <Modal isOpen={isOpen} onClose={() => { if (mode !== 'force_password') onClose(); }} title={title} subtitle={subtitle} maxWidth="md">
    {errorMsg && <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><ShieldAlert size={16} className="mt-0.5 shrink-0" /><span>{errorMsg}</span></div>}
    {successMsg && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{successMsg}</p>}

    {mode === 'login' && <form onSubmit={handleLoginSubmit} className="space-y-4">
      <label className="block text-xs font-medium text-slate-700">Alamat Email
        <span className="relative mt-1 block"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" autoComplete="username" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="nama@email.com" required className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></span>
      </label>
      <label className="block text-xs font-medium text-slate-700">Kata Sandi
        <span className="relative mt-1 block"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-20 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /><button type="button" onClick={requestPasswordReset} className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-blue-700 hover:underline">Lupa sandi?</button></span>
      </label>
      <button type="button" onClick={() => setShowPassword(value => !value)} className="text-xs text-slate-500 hover:text-slate-800">{showPassword ? <EyeOff size={14} className="inline" /> : <Eye size={14} className="inline" />} Tampilkan/sembunyikan kata sandi</button>
      <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-blue-800">Masuk <ArrowRight size={15} /></button>
    </form>}

    {(mode === 'force_password' || mode === 'recovery_password') && <form onSubmit={finishPasswordChange} className="space-y-4">
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{mode === 'force_password' ? 'Demi keamanan, ganti kata sandi sementara sebelum menggunakan portal mitra.' : 'Masukkan kata sandi baru untuk menyelesaikan reset akun.'}</p>
      {mode === 'force_password' && <label className="block text-xs font-medium text-slate-700">Kata sandi saat ini<input type="password" autoComplete="current-password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" /></label>}
      <label className="block text-xs font-medium text-slate-700">Kata sandi baru<input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm" /></label>
      <button className="w-full rounded-lg bg-blue-700 py-3 text-sm font-bold text-white">Simpan dan lanjutkan</button>
    </form>}
  </Modal>;
};
