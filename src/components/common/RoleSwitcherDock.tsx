import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Globe, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleSwitcherDockProps {
  onRoleChanged: (newRole: UserRole) => void;
}

export const RoleSwitcherDock: React.FC<RoleSwitcherDockProps> = ({ onRoleChanged }) => {
  const { role, setRole, resetAllData } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelectRole = (targetRole: UserRole) => {
    setRole(targetRole);
    onRoleChanged(targetRole);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-4 w-72 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Layers size={14} className="text-blue-600" />
              <span>Simulasi Peran Pengguna</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Pilih peran di bawah ini untuk melihat antarmuka dan navigasi spesifik:
          </p>

          <div className="space-y-1.5">
            <button
              onClick={() => handleSelectRole('public')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                role === 'public'
                  ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-slate-500" />
                <span>Pengunjung Publik</span>
              </div>
              {role === 'public' && <span className="text-[10px] text-blue-600 font-bold">Aktif</span>}
            </button>

            <button
              onClick={() => handleSelectRole('partner')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                role === 'partner'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-emerald-600" />
                <span>Portal Mitra (PT Bumi)</span>
              </div>
              {role === 'partner' && <span className="text-[10px] text-emerald-700 font-bold">Aktif</span>}
            </button>

            <button
              onClick={() => handleSelectRole('admin')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                role === 'admin'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-amber-400" />
                <span>Admin PSA (Dewi Anjani)</span>
              </div>
              {role === 'admin' && <span className="text-[10px] text-amber-300 font-bold">Aktif</span>}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Database Lokal</span>
            <button
              onClick={() => {
                if (confirm('Reset seluruh data ke kondisi awal?')) {
                  resetAllData();
                  handleSelectRole('public');
                }
              }}
              className="text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-[#0B2238] text-white px-3.5 py-2 rounded-full shadow-lg border border-[#5C80B6]/40 hover:bg-[#0B2238]/90 transition-colors flex items-center gap-2 text-xs font-semibold group"
        >
          <span className="w-2 h-2 rounded-full bg-[#E85D75]" />
          <span className="text-slate-300">Peran:</span>
          <span className="text-white">{role === 'public' ? 'Publik' : role === 'volunteer' ? 'Relawan' : role === 'partner' ? 'Mitra' : 'Admin'}</span>
          <ChevronUp size={14} className="text-[#5C80B6] group-hover:text-white" />
        </button>
      )}
    </div>
  );
};
