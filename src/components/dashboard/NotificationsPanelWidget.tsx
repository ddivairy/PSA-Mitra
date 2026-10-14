import React, { useState } from 'react';

export interface NoticeItem {
  id: string;
  title: string;
  description: string;
  timeBadge: string;
}

interface NotificationsPanelWidgetProps {
  initialNotices?: NoticeItem[];
  onNoticeClick?: (notice: NoticeItem) => void;
}

export const NotificationsPanelWidget: React.FC<NotificationsPanelWidgetProps> = ({
  initialNotices = [
    {
      id: 'n-1',
      title: 'Rencana program kolaborasi mingguan siap',
      description: 'Ikhtisar prioritas dan jadwal koordinasi mitra terbaru telah diperbarui.',
      timeBadge: '2 mnt',
    },
    {
      id: 'n-2',
      title: 'Mitra PT Bumi Lestari mengirim dokumen MoA',
      description: 'Berkas perjanjian kerja sama program Muara Gembong menunggu persetujuan.',
      timeBadge: '1 jam',
    },
    {
      id: 'n-3',
      title: 'Evaluasi berkas 18 relawan baru',
      description: 'Pemeriksaan berkas pendaftaran program literasi anak dijadwalkan besok.',
      timeBadge: '4 jam',
    },
  ],
  onNoticeClick,
}) => {
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);

  const handleClearOne = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotices([]);
  };

  return (
    <section className="card panel" aria-labelledby="notifications-heading">
      <div className="panel-head">
        <h2 id="notifications-heading" className="text-base font-extrabold text-[#0F172A]">
          Notifications
        </h2>
        {notices.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-button"
          >
            Clear all
          </button>
        )}
      </div>

      <div id="notification-list">
        {notices.map((notice) => (
          <div key={notice.id} className="notice-row group">
            <span className="notice-bullet" aria-hidden="true" />
            <div
              className="notice-copy cursor-pointer flex-1 min-w-0"
              onClick={() => onNoticeClick && onNoticeClick(notice)}
            >
              <strong className="text-xs text-[#0F172A] group-hover:text-[#5C80B6] transition-colors line-clamp-1">
                {notice.title}
              </strong>
              <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">
                {notice.description}
              </p>
            </div>
            <span className="time-badge">{notice.timeBadge}</span>
            <button
              type="button"
              onClick={() => handleClearOne(notice.id)}
              className="text-[#64748B] hover:text-[#E85D75] p-1 text-base leading-none border-0 bg-transparent cursor-pointer"
              aria-label="Hapus notifikasi"
            >
              &times;
            </button>
          </div>
        ))}

        {notices.length === 0 && (
          <p className="text-xs text-[#64748B] py-4 text-center">
            Semua notifikasi telah ditandai selesai.
          </p>
        )}
      </div>
    </section>
  );
};
