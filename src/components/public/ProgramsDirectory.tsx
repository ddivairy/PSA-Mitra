import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Building2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Program, ProgramCategory, ProgramFormat } from '../../types';
import { INDONESIA_REGIONS } from '../../data/indonesiaRegions';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

interface ProgramsDirectoryProps {
  onOpenApply: (program: Program) => void;
  selectedProgramForDetail?: Program | null;
  onClearSelectedProgram?: () => void;
}

export const ProgramsDirectory: React.FC<ProgramsDirectoryProps> = ({
  onOpenApply,
  selectedProgramForDetail,
  onClearSelectedProgram,
}) => {
  const { programs, applications, currentUser, role } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'newest'>('deadline');

  const [activeModalProgram, setActiveModalProgram] = useState<Program | null>(selectedProgramForDetail || null);

  // Update when prop changes
  React.useEffect(() => {
    if (selectedProgramForDetail) {
      setActiveModalProgram(selectedProgramForDetail);
    }
  }, [selectedProgramForDetail]);

  const categories = [
    'Pendidikan',
    'Lingkungan',
    'Kesehatan',
    'Pemberdayaan Masyarakat',
    'Teknologi & Digital',
  ];

  // Cities for the selected province
  const availableCities = useMemo(() => {
    if (selectedProvince === 'all') return [];
    const found = INDONESIA_REGIONS.find(r => r.province === selectedProvince);
    return found ? found.cities : [];
  }, [selectedProvince]);

  const filteredPrograms = useMemo(() => {
    return programs.filter(prog => {
      // Must be published for public/volunteer browsing
      if (prog.publishedStatus !== 'published') return false;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        prog.title.toLowerCase().includes(q) ||
        prog.partnerName.toLowerCase().includes(q) ||
        prog.summary.toLowerCase().includes(q) ||
        (prog.city && prog.city.toLowerCase().includes(q));

      // Category match
      const matchCat = selectedCategory === 'all' || prog.category === selectedCategory;

      // Format match
      const matchFormat = selectedFormat === 'all' || prog.format === selectedFormat;

      // Province match
      const matchProv = selectedProvince === 'all' || prog.province === selectedProvince;

      // City match
      const matchCity = selectedCity === 'all' || prog.city === selectedCity;

      return matchSearch && matchCat && matchFormat && matchProv && matchCity;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [programs, searchQuery, selectedCategory, selectedFormat, selectedProvince, selectedCity, sortBy]);

  // Check if current user has already applied to this program
  const hasUserApplied = (progId: string) => {
    if (!currentUser) return false;
    return applications.some(a => a.programId === progId && a.volunteerId === currentUser.id && a.status !== 'withdrawn');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          Eksplorasi Kerelawanan
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Katalog Program Kolaborasi PSA
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Temukan program kerelawanan terverifikasi yang diinisiasi oleh mitra resmi PSA di berbagai wilayah Indonesia.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama program, mitra pelaksana, atau kata kunci (contoh: mangrove, literasi, difabel)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Format Pelaksanaan
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Format</option>
              <option value="offline">Tatap Muka (Offline)</option>
              <option value="online">Daring (Online)</option>
              <option value="hybrid">Kombinasi (Hybrid)</option>
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Provinsi
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedCity('all');
              }}
              className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Provinsi</option>
              {INDONESIA_REGIONS.map(r => (
                <option key={r.province} value={r.province}>{r.province}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Kota / Kabupaten
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={selectedProvince === 'all'}
              className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="all">Semua Kota</option>
              {availableCities.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Urutkan Berdasarkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="deadline">Batas Pendaftaran Terdekat</option>
              <option value="newest">Program Terbaru</option>
            </select>
          </div>
        </div>

        {(selectedCategory !== 'all' || selectedFormat !== 'all' || selectedProvince !== 'all' || searchQuery) && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Ditemukan <strong className="font-mono text-slate-900">{filteredPrograms.length}</strong> program sesuai filter</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFormat('all');
                setSelectedProvince('all');
                setSelectedCity('all');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Program Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Info size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada program yang sesuai</h3>
          <p className="text-xs text-slate-500">
            Coba ubah kata kunci pencarian atau bersihkan filter provinsi dan kategori.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedProvince('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const isApplied = hasUserApplied(prog.id);
            const isFull = prog.enrolledCount >= prog.targetQuota;

            return (
              <div
                key={prog.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={prog.image}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs border border-slate-100">
                      {prog.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2 py-0.5 rounded">
                      {prog.format.toUpperCase()}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{prog.partnerName}</span>
                    </div>

                    <h3 
                      onClick={() => setActiveModalProgram(prog)}
                      className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {prog.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prog.summary}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{prog.city ? `${prog.city}, ${prog.province}` : 'Kegiatan Daring'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span>Mulai: {prog.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span className="text-rose-600 font-medium">Batas: {prog.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-mono tabular-nums">
                    Pendaftar: <span className="font-semibold text-slate-900">{prog.enrolledCount}</span> / {prog.targetQuota}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalProgram(prog)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Detail
                    </button>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                        <CheckCircle2 size={13} />
                        Sudah Mendaftar
                      </span>
                    ) : isFull ? (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                        Kuota Penuh
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenApply(prog)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                      >
                        Lamar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Detail Modal */}
      {activeModalProgram && (
        <Modal
          isOpen={!!activeModalProgram}
          onClose={() => {
            setActiveModalProgram(null);
            if (onClearSelectedProgram) onClearSelectedProgram();
          }}
          title={activeModalProgram.title}
          subtitle={`Diselenggarakan oleh ${activeModalProgram.partnerName}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Banner preview */}
            <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeModalProgram.image}
                alt={activeModalProgram.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-white/95 text-slate-800 text-xs font-bold px-2.5 py-1 rounded shadow-xs">
                  {activeModalProgram.category}
                </span>
                <span className="bg-slate-900/90 text-white text-xs font-medium px-2.5 py-1 rounded shadow-xs">
                  {activeModalProgram.format.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Batas Pendaftaran</span>
                <span className="font-semibold text-rose-600">{activeModalProgram.deadline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Periode Kegiatan</span>
                <span className="font-semibold text-slate-900">{activeModalProgram.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Target Kuota</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">
                  {activeModalProgram.enrolledCount} / {activeModalProgram.targetQuota} Relawan
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Lokasi</span>
                <span className="font-semibold text-slate-900 truncate block">
                  {activeModalProgram.city || 'Online'}
                </span>
              </div>
            </div>

            {/* Description & Objectives */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Deskripsi &amp; Latar Belakang
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeModalProgram.description}
              </p>
            </div>

            {/* Objectives */}
            {activeModalProgram.objectives && activeModalProgram.objectives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Tujuan &amp; Capaian Program
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeModalProgram.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Schedule & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Jadwal &amp; Lokasi Rinci
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Jadwal:</strong> {activeModalProgram.schedule}
                </p>
                {activeModalProgram.address && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Alamat:</strong> {activeModalProgram.address}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Kriteria &amp; Persyaratan Relawan
                </h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  {activeModalProgram.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Accessibility note if available */}
            {activeModalProgram.accessibilityInfo && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Catatan Aksesibilitas:</span>
                  <span>{activeModalProgram.accessibilityInfo}</span>
                </div>
              </div>
            )}

            {/* PIC contact */}
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Narahubung Penyelenggara: <strong className="text-slate-800">{activeModalProgram.picName}</strong> ({activeModalProgram.picContact})
            </div>

            {/* Action footer in modal */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalProgram(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg"
              >
                Tutup
              </button>

              {hasUserApplied(activeModalProgram.id) ? (
                <div className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Anda Sudah Terdaftar di Program Ini</span>
                </div>
              ) : activeModalProgram.enrolledCount >= activeModalProgram.targetQuota ? (
                <div className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
                  Pendaftaran Ditutup (Kuota Penuh)
                </div>
              ) : (
                <button
                  onClick={() => {
                    const prog = activeModalProgram;
                    setActiveModalProgram(null);
                    onOpenApply(prog);
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Daftar Sebagai Relawan</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
