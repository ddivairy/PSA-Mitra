import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  Share2, 
  FileCheck2,
  FolderGit2,
  Bell,
  MoreVertical,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModernDashboardWidgetsProps {
  onNavigate: (tab: string) => void;
}

export const ModernDashboardWidgets: React.FC<ModernDashboardWidgetsProps> = ({ onNavigate }) => {
  const { role, currentUser, programs, applications, partners } = useApp();

  // Current date info for the mini calendar
  const today = new Date();
  const currentMonthName = 'Oktober 2026';
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeHighlightedDays = [4, 12, 18, 19, 25];

  // Tasks tracker tailored to PSA operations
  const tasksTracker = [
    {
      id: 'task-1',
      title: 'Validasi Berkas Legalitas Mitra Baru',
      category: 'Kemitraan Organisasi',
      progress: 85,
      color: 'bg-[#5C80B6]',
      date: 'Batas: 18 Okt',
      team: ['D', 'S', 'H'],
    },
    {
      id: 'task-2',
      title: 'Briefing Relawan Lapangan Muara Gembong',
      category: 'Restorasi Mangrove',
      progress: 65,
      color: 'bg-[#E85D75]',
      date: 'Batas: 20 Okt',
      team: ['B', 'A'],
    },
    {
      id: 'task-3',
      title: 'Finalisasi Modul Kakak Asuh Literasi',
      category: 'Edukasi Anak',
      progress: 90,
      color: 'bg-[#5C80B6]',
      date: 'Batas: 25 Okt',
      team: ['H', 'C'],
    },
  ];

  // Today's schedule / tasks list
  const todayTasks = [
    {
      id: 'tt-1',
      title: 'Sesi Koordinasi Mitra PT Bumi Lestari Hijau',
      time: '09:00 - 10:30 WIB',
      duration: '1.5 Jam',
      status: 'In Progress',
      progress: 75,
      statusColor: 'text-[#5C80B6]',
      barColor: 'bg-[#5C80B6]',
      members: ['Siti', 'Budi'],
    },
    {
      id: 'tt-2',
      title: 'Verifikasi 15 Pendaftar Relawan Baru',
      time: '13:00 - 14:30 WIB',
      duration: '1.5 Jam',
      status: 'Pending',
      progress: 30,
      statusColor: 'text-[#E85D75]',
      barColor: 'bg-[#E85D75]',
      members: ['Dewi'],
    },
    {
      id: 'tt-3',
      title: 'Audit Kelengkapan Dokumen Surat Komitmen',
      time: '15:30 - 17:00 WIB',
      duration: '1.5 Jam',
      status: 'Scheduled',
      progress: 10,
      statusColor: 'text-slate-400',
      barColor: 'bg-slate-300',
      members: ['Admin', 'Hendra'],
    },
  ];

  return (
    <div className="space-y-8">
      {/* 
        ========================================================================
        1. QUICK FEATURE BANNER CARDS (3 Horizontal Cards)
        ========================================================================
        - Soft rounded illustrations/icons
        - "Stay organized", "Sync your notes & documents", "Collaborate and share"
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Stay Organized */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#0B2238]/5 text-[#0B2238] flex items-center justify-center shrink-0 group-hover:bg-[#0B2238] group-hover:text-white transition-colors">
            <CheckSquare size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">Stay Organized</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Pantau seluruh linimasa program sosial, jadwal relawan, dan berkas kemitraan dalam satu ruang terpusat.
            </p>
          </div>
        </div>

        {/* Card 2: Sync Notes & Docs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#5C80B6]/10 text-[#5C80B6] flex items-center justify-center shrink-0 group-hover:bg-[#5C80B6] group-hover:text-white transition-colors">
            <FolderGit2 size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">Sync Your Notes</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Sinkronisasi otomatis proposal kegiatan, instruksi revisi PSA, dan berita acara kegiatan kemitraan.
            </p>
          </div>
        </div>

        {/* Card 3: Collaborate & Share */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#E85D75]/10 text-[#E85D75] flex items-center justify-center shrink-0 group-hover:bg-[#E85D75] group-hover:text-white transition-colors">
            <Share2 size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">Collaborate &amp; Share</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Berdayakan ribuan relawan dengan pelaporan dampak terverifikasi yang siap dibagikan ke stakeholder.
            </p>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        MAIN GRID SECTION: Left (Tracker, Today Tasks, Analytics) + Right (Calendar, Notifs, Promo)
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Widgets 3, 5, 7 */}
        <div className="lg:col-span-8 space-y-8">
          {/* 
            3. Assignments/Tasks & Applications Tracker
            Progress bars using Steel Blue (#5C80B6) and Coral Pink (#E85D75)
          */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Assignments &amp; Programs Tracker</h3>
                <p className="text-xs text-[#64748B]">Pelacakan progres target pelaksanaan program dan seleksi berkas</p>
              </div>
              <span className="text-xs font-semibold text-[#5C80B6] bg-[#5C80B6]/10 px-3 py-1 rounded-full">
                3 Aktif
              </span>
            </div>

            <div className="space-y-4">
              {tasksTracker.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#5C80B6] uppercase tracking-wider">{task.category}</span>
                      <h4 className="font-bold text-[#0F172A] text-sm mt-0.5">{task.title}</h4>
                    </div>
                    <span className="font-mono font-bold text-[#0F172A]">{task.progress}%</span>
                  </div>

                  {/* Progress Bar with #5C80B6 or #E85D75 */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${task.color}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                    <span>{task.date}</span>
                    <div className="flex items-center -space-x-1.5">
                      {task.team.map((initial, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-[#0B2238] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                          {initial}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 
            5. Today's Tasks List
            Items with duration times, status progress bars, team member avatars
          */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Today's Schedule &amp; Inisiatif</h3>
                <p className="text-xs text-[#64748B]">Jadwal kegiatan kolaborasi hari ini</p>
              </div>
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <Clock size={14} />
                <span>Realtime</span>
              </span>
            </div>

            <div className="space-y-3">
              {todayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${t.statusColor}`}>{t.status}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-[#64748B] font-mono">{t.time}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F172A]">{t.title}</h4>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] text-[#64748B]">
                        <span>{t.duration}</span>
                        <span className="font-mono">{t.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${t.barColor}`} style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center -space-x-1.5">
                      {t.members.map((m, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-[#5C80B6] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                          title={m}
                        >
                          {m.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 
            7. Analytics Summary Cards (Circular Progress Metrics)
            E.g. "90% Data Research", "65% UI/UX Design", "85% Target Kuota"
          */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Analytics Summary Metrics</h3>
              <p className="text-xs text-[#64748B]">Indikator efektivitas eksekusi kegiatan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Metric 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#0B2238"
                      strokeWidth="6"
                      strokeDasharray={213}
                      strokeDashoffset={213 * (1 - 0.90)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute font-extrabold text-sm text-[#0B2238] font-mono">90%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Data Research</h4>
                  <p className="text-[11px] text-[#64748B]">Validasi wilayah pesisir &amp; 3T</p>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#5C80B6"
                      strokeWidth="6"
                      strokeDasharray={213}
                      strokeDashoffset={213 * (1 - 0.85)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute font-extrabold text-sm text-[#5C80B6] font-mono">85%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Target Kuota Relawan</h4>
                  <p className="text-[11px] text-[#64748B]">Tercapai dari kuota nasional</p>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#E85D75"
                      strokeWidth="6"
                      strokeDasharray={213}
                      strokeDashoffset={213 * (1 - 0.65)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute font-extrabold text-sm text-[#E85D75] font-mono">65%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Review Berkas Mitra</h4>
                  <p className="text-[11px] text-[#64748B]">SOP Kemitraan terverifikasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets 2, 4, 6 */}
        <div className="lg:col-span-4 space-y-8">
          {/* 
            4. Calendar Widget
            Mini monthly view with selected dates highlighted in Steel Blue (#5C80B6)
          */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#5C80B6]" />
                <h3 className="text-sm font-bold text-[#0F172A]">{currentMonthName}</h3>
              </div>
              <span className="text-[10px] font-bold text-[#5C80B6] bg-[#5C80B6]/10 px-2 py-0.5 rounded-full">
                5 Agenda
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-[#64748B] py-1">
                  {d}
                </div>
              ))}
              {daysInMonth.map((day) => {
                const isHighlighted = activeHighlightedDays.includes(day);
                const isCurrent = day === 13;
                return (
                  <button
                    key={day}
                    className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center text-[11px] font-mono transition-colors ${
                      isHighlighted
                        ? 'bg-[#5C80B6] text-white font-bold shadow-xs'
                        : isCurrent
                        ? 'border border-[#E85D75] text-[#E85D75] font-bold'
                        : 'text-[#0F172A] hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-[#64748B] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5C80B6]" />
                Agenda Program
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E85D75]" />
                Hari Ini
              </span>
            </div>
          </div>

          {/* 
            2. Notifications Widget
            List of recent alerts with rounded time badges in Coral Pink (#E85D75)
          */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">Recent Notifications</h3>
              <span className="w-2 h-2 rounded-full bg-[#E85D75]" />
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#E85D75] bg-[#E85D75]/10 px-2 py-0.5 rounded-full">
                    Aplikasi Baru
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">10m lalu</span>
                </div>
                <p className="text-xs font-bold text-[#0F172A]">Anisa mendaftar Restorasi Mangrove</p>
                <p className="text-[11px] text-[#64748B]">Berkas pendaftaran masuk dalam status verifikasi.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5C80B6] bg-[#5C80B6]/10 px-2 py-0.5 rounded-full">
                    Review PSA
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">1j lalu</span>
                </div>
                <p className="text-xs font-bold text-[#0F172A]">Proposal Digital Storytelling Disetujui</p>
                <p className="text-[11px] text-[#64748B]">Program telah resmi diterbitkan ke katalog publik.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    Sistem
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">3j lalu</span>
                </div>
                <p className="text-xs font-bold text-[#0F172A]">Audit Log Harian Berhasil Disimpan</p>
                <p className="text-[11px] text-[#64748B]">Seluruh mutasi status tercatat aman.</p>
              </div>
            </div>
          </div>

          {/* 
            6. "Go Premium" Promo Banner Card
            Prominent card with #0B2238 background, white text, CTA button
          */}
          <div className="bg-[#0B2238] rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-4 relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#5C80B6]/20 blur-xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-[#E85D75]/20 blur-xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C80B6]/30 border border-[#5C80B6]/40 text-[#E85D75] text-[10px] font-bold tracking-wider uppercase">
              <Sparkles size={12} />
              <span>Kemitraan Strategis</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold tracking-tight text-white leading-snug">
                Tingkatkan Dampak Organisasi Bersama PSA Premium
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dapatkan akses prioritas ke ribuan relawan terampil, dasbor analitik kustom, dan publikasi CSR berskala nasional.
              </p>
            </div>

            <button
              onClick={() => onNavigate('public-become-partner')}
              className="w-full py-2.5 text-xs font-bold text-[#0B2238] bg-white hover:bg-slate-100 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Find out more</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
