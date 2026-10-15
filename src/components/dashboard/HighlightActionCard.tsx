'use client';

import React from 'react';

interface HighlightActionCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export const HighlightActionCard: React.FC<HighlightActionCardProps> = ({
  eyebrow = 'MORE ROOM TO CREATE',
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <section className="card premium" aria-labelledby="premium-heading">
      <div className="eyebrow text-[10px] font-semibold tracking-wide text-[#64748B] uppercase">
        {eyebrow}
      </div>
      <h2
        id="premium-heading"
        className="text-base font-semibold text-[#0F172A] mt-2 mb-2 tracking-tight"
      >
        {title}
      </h2>
      <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mb-3">
        {description}
      </p>
      <button
        type="button"
        onClick={onButtonClick}
        className="font-extrabold text-xs"
      >
        {buttonText} &rarr;
      </button>
    </section>
  );
};
