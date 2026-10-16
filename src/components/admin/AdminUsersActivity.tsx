import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck, History, Search, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

const numberFormatter = new Intl.NumberFormat('id-ID');

const roleLabels: Record<UserRole, string> = {
  public: 'Publik',
  volunteer: 'Relawan',
  partner: 'Mitra',
  admin: 'Admin PSA',
};

const rolePermissions: { role: Exclude<UserRole, 'public'>; access: string }[] = [
  { role: 'volunteer', access: 'Jelajahi program, kirim dan pantau pendaftaran, kelola profil relawan.' },
  { role: 'partner', access: 'Kelola profil organisasi dan proposal program, tinjau pendaftar pada program sendiri.' },
  { role: 'admin', access: 'Verifikasi mitra, review program dan peserta, akses analytics serta audit aktivitas.' },
];

export const AdminUsersActivity: React.FC = () => {
  const { users, notifications, auditLogs, currentUser, markNotificationsAsRead } = useApp();
  const [userSearch, setUserSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase('id-ID');
    return users.filter(user =>
      !query ||
      user.name.toLocaleLowerCase('id-ID').includes(query) ||
      user.email.toLocaleLowerCase('id-ID').includes(query) ||
      roleLabels[user.role].toLocaleLowerCase('id-ID').includes(query)
    );
  }, [users, userSearch]);

  const recipientNames = useMemo(() => new Map(users.map(user => [user.id, user.name])), [users]);
  const visibleNotifications = useMemo(() => {
    const filtered = notifications.filter(notification =>
      notificationFilter === 'all' || !notification.read
    );
    return [...filtered].sort((first, second) => second.timestamp.localeCompare(first.timestamp));
  }, [notifications, notificationFilter]);
  const ownUnreadCount = notifications.filter(notification =>
    notification.recipientUserId === currentUser?.id && !notification.read
  ).length;

  const visibleAuditLogs = useMemo(() => {
    const query = activitySearch.trim().toLocaleLowerCase('id-ID');
    return auditLogs.filter(log =>
      !query ||
      log.action.toLocaleLowerCase('id-ID').includes(query) ||
      log.actorName.toLocaleLowerCase('id-ID').includes(query) ||
      log.details.toLocaleLowerCase('id-ID').includes(query) ||
      log.entityType.toLocaleLowerCase('id-ID').includes(query)
    );
  }, [auditLogs, activitySearch]);

  const roleCounts = users.reduce<Record<UserRole, number>>((counts, user) => {
    counts[user.role] += 1;
    return counts;
  }, { public: 0, volunteer: 0, partner: 0, admin: 0 });

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">Administrasi platform</p>
        <h1 className="text-2xl font-bold text-slate-900">Users &amp; Activity</h1>
        <p className="mt-1 text-xs text-slate-500">Pantau akun dan role pengguna, cakupan hak akses, notifikasi, serta audit aktivitas.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan pengguna berdasarkan role">
        {(['volunteer', 'partner', 'admin', 'public'] as UserRole[]).map(role => (
          <article key={role} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">{roleLabels[role]}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{numberFormatter.format(roleCounts[role])}</p>
            <p className="text-[11px] text-slate-400">akun terdaftar</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 p-4">
            <Users size={17} className="text-blue-600" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pengguna &amp; role</h2>
              <p className="text-[11px] text-slate-500">{numberFormatter.format(users.length)} akun terdaftar</p>
            </div>
          </div>
          <div className="border-b border-slate-100 p-3">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={userSearch}
                onChange={event => setUserSearch(event.target.value)}
                placeholder="Cari nama, email, atau role..."
                aria-label="Cari pengguna"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Pengguna</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length ? filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">{roleLabels[user.role]}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.verified ? 'Terverifikasi' : 'Belum verifikasi'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Tidak ada pengguna yang cocok.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 p-4">
            <ShieldCheck size={17} className="text-emerald-600" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hak akses per role</h2>
              <p className="text-[11px] text-slate-500">Cakupan fitur yang tersedia untuk setiap role</p>
            </div>
          </div>
          <div className="space-y-3 p-4">
            {rolePermissions.map(({ role, access }) => (
              <div key={role} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-800">{roleLabels[role]}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{access}</p>
              </div>
            ))}
            <p className="text-[10px] leading-relaxed text-slate-400">
              Ringkasan ini mengikuti cakupan fitur aplikasi; pengelolaan role khusus per akun belum tersedia.
            </p>
          </div>
        </article>
      </section>

      <section aria-labelledby="notifications-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-amber-600" aria-hidden="true" />
            <div>
              <h2 id="notifications-heading" className="text-sm font-bold text-slate-900">Notifikasi</h2>
              <p className="text-[11px] text-slate-500">{numberFormatter.format(notifications.length)} notifikasi untuk seluruh akun</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={notificationFilter}
              onChange={event => setNotificationFilter(event.target.value as 'all' | 'unread')}
              aria-label="Filter notifikasi"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              <option value="all">Semua notifikasi</option>
              <option value="unread">Belum dibaca</option>
            </select>
            <button
              type="button"
              onClick={markNotificationsAsRead}
              disabled={ownUnreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={14} aria-hidden="true" />
              Tandai notifikasi admin dibaca{ownUnreadCount ? ` (${ownUnreadCount})` : ''}
            </button>
          </div>
        </div>
        <div className="max-h-96 divide-y divide-slate-100 overflow-auto">
          {visibleNotifications.length ? visibleNotifications.map(notification => (
            <article key={notification.id} className="flex gap-3 px-4 py-3">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-blue-500'}`} aria-label={notification.read ? 'Sudah dibaca' : 'Belum dibaca'} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-xs font-bold text-slate-800">{notification.title}</h3>
                  <time className="text-[10px] text-slate-400">{notification.timestamp}</time>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{notification.message}</p>
                <p className="mt-1 text-[10px] text-slate-400">Penerima: {recipientNames.get(notification.recipientUserId) || 'Akun tidak ditemukan'}</p>
              </div>
            </article>
          )) : (
            <p className="px-4 py-8 text-center text-xs text-slate-500">Tidak ada notifikasi untuk filter ini.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="audit-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <History size={17} className="text-violet-600" aria-hidden="true" />
            <div>
              <h2 id="audit-heading" className="text-sm font-bold text-slate-900">Audit log</h2>
              <p className="text-[11px] text-slate-500">{numberFormatter.format(auditLogs.length)} aktivitas tercatat</p>
            </div>
          </div>
          <label className="relative block sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={activitySearch}
              onChange={event => setActivitySearch(event.target.value)}
              placeholder="Cari aktor, aksi, atau detail..."
              aria-label="Cari audit log"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Waktu</th>
                <th className="px-4 py-2.5">Aktor / Role</th>
                <th className="px-4 py-2.5">Aksi</th>
                <th className="px-4 py-2.5">Entitas</th>
                <th className="px-4 py-2.5">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAuditLogs.length ? visibleAuditLogs.map(log => (
                <tr key={log.id} className="align-top hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-semibold text-slate-800">{log.actorName}</p>
                    <p className="text-[10px] uppercase text-slate-400">{roleLabels[log.actorRole]}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-semibold text-blue-700">{log.action}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{log.entityType} · {log.entityId}</td>
                  <td className="min-w-64 px-4 py-3 text-slate-600">{log.details}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada aktivitas yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
