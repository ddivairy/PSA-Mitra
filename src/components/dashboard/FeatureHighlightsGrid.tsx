'use client';

import React from 'react';

export interface FeatureHighlightItem {
  id: string;
  icon: string | React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onAction?: () => void;
}

interface FeatureHighlightsGridProps {
  items: FeatureHighlightItem[];
}

export const FeatureHighlightsGrid: React.FC<FeatureHighlightsGridProps> = ({ items }) => {
  return (
    <section className="features" aria-label="Sorotan ruang kerja">
      {items.map((item) => (
        <article key={item.id} className="card feature bg-white">
          <div className="feature-icon" aria-hidden="true">
            {item.icon}
          </div>
          <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">{item.title}</h2>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{item.description}</p>
          <button
            type="button"
            onClick={item.onAction}
            className="mt-3.5 border-0 bg-transparent text-[#5C80B6] hover:text-[#0B2238] font-extrabold text-xs p-0 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{item.actionText}</span>
            <span>&rarr;</span>
          </button>
        </article>
      ))}
    </section>
  );
};
