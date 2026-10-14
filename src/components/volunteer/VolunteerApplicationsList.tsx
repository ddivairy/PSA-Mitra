import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  ChevronDown, 
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { WorkspaceIntroHeader } from '../dashboard/WorkspaceIntroHeader';

export const VolunteerApplicationsList: React.FC<{ onExplorePrograms: () => void }> = ({ onExplorePrograms }) => {
  const { applications, currentUser, withdrawApplication } = useApp();

  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const userApps = applications.filter(a => {
    if (!currentUser) return true;
    return a.volunteerId === currentUser.id || a.volunteerEmail === currentUser.email;
  });

  const handleWithdraw = (appId: string, progTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan aplikasi untuk "${progTitle}"?`)) {
      withdrawApplication(appId);
    }
  };

  return (
    <div className="space-y-6">
      <WorkspaceIntroHeader
        eyebrow="PORTAL RELAWAN · APPLICATION TRACKER"
        title="Aplikasi & Riwayat Pendaftaran"
        description="Pantau tahapan evaluasi berkas, pengumuman kelolosan, dan linimasa kerelawanan Anda secara terpadu."
        actions={
          <button
            type="button"
            onClick={onExplorePrograms}
            className="navy-button"
          >
            + Cari Program Baru
          </button>
        }
      />

      {userApps.length === 0 ? (
        <div className="card panel text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5C80B6]/15 text-[#5C80B6] flex items-center justify-center mx-auto">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Belum Ada Aplikasi Program</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
              Anda belum mendaftar ke program kerelawanan manapun. Temukan inisiatif sosial yang sesuai minat Anda dan kirimkan lamaran pertama Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onExplorePrograms}
            className="navy-button"
          >
            Jelajahi Program Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            const canWithdraw = app.status === 'submitted' || app.status === 'under_review';

            return (
              <div
                key={app.id}
                className="card overflow-hidden"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top line: Reference & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#5C80B6] bg-[#5C80B6]/10 px-2.5 py-0.5 rounded-lg">
                        REF: #{app.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        Diajukan: {app.submittedAt}
                      </span>
                    </div>

                    <StatusBadge status={app.status} />
                  </div>

                  {/* Main Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                      <Building2 size={14} className="text-[#5C80B6] shrink-0" />
                      <span>{app.partnerName}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      {app.programTitle}
                    </h3>
                  </div>

                  {/* Reviewer Note if available */}
                  {app.reviewNotes && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      app.status === 'accepted' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                        : app.status === 'rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-bold block">Catatan dari Penyelenggara:</span>
                      <p>{app.reviewNotes}</p>
                    </div>
                  )}

                  {/* Action row & expand toggle */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="text-[#5C80B6] hover:text-[#0B2238] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Sembunyikan Riwayat' : 'Lihat Detail & Riwayat Status'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(app.id, app.programTitle)}
                        className="text-[#E85D75] hover:text-[#E85D75]/80 font-bold transition-colors cursor-pointer"
                      >
                        Tarik Lamaran
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Timeline & Motivation */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-[#0F172A] mb-1">Motivasi yang Anda Kirim:</h4>
                      <p className="text-[#64748B] italic bg-white p-3 rounded-xl border border-slate-100">
                        "{app.motivation}"
                      </p>
                    </div>

                    {app.answers && Object.keys(app.answers).length > 0 && (
                      <div>
                        <h4 className="font-bold text-[#0F172A] mb-1">Jawaban Tambahan:</h4>
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5">
                          {Object.entries(app.answers).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-[#64748B] font-medium">{k}: </span>
                              <span className="text-[#0F172A] font-semibold">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-[#0F172A] mb-2">Riwayat Perubahan Status (Audit Trail):</h4>
                      <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1">
                        {app.history.map((hist, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#5C80B6]" />
                            <div className="text-[#0F172A] font-medium">
                              Status diubah menjadi <strong className="text-[#0B2238] uppercase">{hist.status}</strong>
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              Oleh {hist.actor} · {hist.date}
                            </div>
                            {hist.note && (
                              <div className="text-[11px] text-[#64748B] mt-0.5">
                                "{hist.note}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
