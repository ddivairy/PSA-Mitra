import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Search, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';

export const PartnersDirectory: React.FC = () => {
  const { partners, programs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      // Must be approved for public partner directory
      if (p.status !== 'approved') return false;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);

      const matchType = selectedType === 'all' || p.type === selectedType;

      return matchSearch && matchType;
    });
  }, [partners, searchQuery, selectedType]);

  const getOrgTypeLabel = (t: string) => {
    switch (t) {
      case 'corporate': return 'Perusahaan / CSR';
      case 'foundation': return 'Yayasan Nirlaba';
      case 'community': return 'Komunitas Sosial';
      case 'university': return 'Universitas / Kampus';
      default: return 'Institusi / Lembaga';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          Jejaring Mitra Terverifikasi
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Direktori Mitra Kemitraan PSA
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Daftar organisasi, yayasan nirlaba, dan korporasi yang telah lolos verifikasi legalitas resmi PSA untuk menyelenggarakan program kerelawanan.
        </p>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama organisasi, bidang kegiatan, atau kota..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs sm:text-sm py-2 px-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Bentuk Organisasi</option>
          <option value="corporate">Perusahaan (CSR)</option>
          <option value="foundation">Yayasan Nirlaba</option>
          <option value="community">Komunitas Sosial</option>
        </select>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((part) => {
          const partnerPrograms = programs.filter(p => p.partnerId === part.id && p.publishedStatus === 'published');

          return (
            <div
              key={part.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B2238] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {part.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{part.name}</h3>
                      <span className="text-xs text-[#5C80B6] font-medium">{getOrgTypeLabel(part.type)}</span>
                    </div>
                  </div>
                  <StatusBadge status="approved" size="sm" />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{part.sector}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {part.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{part.city}, {part.province}</span>
                  </div>
                  {part.website && (
                    <div className="flex items-center gap-2 text-blue-600 truncate">
                      <Globe size={14} className="text-slate-400 shrink-0" />
                      <a href={part.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {part.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Program Aktif: <strong className="text-slate-900 font-mono">{partnerPrograms.length}</strong>
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Terverifikasi PSA
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
