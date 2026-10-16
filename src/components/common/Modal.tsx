import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  variant?: 'default' | 'pastel';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  variant = 'default',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];
  const isPastel = variant === 'pastel';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose} 
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div 
          className={`relative transform overflow-hidden text-left align-middle shadow-xl transition-all w-full ${widthClasses} ${
            isPastel
              ? 'rounded-3xl border border-slate-200/60 bg-slate-50'
              : 'rounded-xl border border-slate-200 bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className={`flex items-start justify-between border-b px-6 py-5 ${
            isPastel ? 'border-slate-200/80 bg-slate-50' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <div>
              <h3 className={`text-lg font-semibold ${isPastel ? 'text-[#0B2238]' : 'text-slate-900'}`}>{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className={`rounded-xl p-2 text-slate-400 transition-colors focus:outline-hidden focus:ring-2 ${
                isPastel
                  ? 'hover:text-slate-600 focus:ring-[#5C80B6]'
                  : 'hover:bg-slate-200 hover:text-slate-700 focus:ring-blue-500'
              }`}
              aria-label="Tutup dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className={`max-h-[75vh] overflow-y-auto ${isPastel ? 'px-5 py-5 sm:px-6 sm:py-6' : 'px-6 py-5'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
