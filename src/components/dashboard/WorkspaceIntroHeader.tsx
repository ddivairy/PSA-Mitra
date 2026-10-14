import React from 'react';

interface WorkspaceIntroHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const WorkspaceIntroHeader: React.FC<WorkspaceIntroHeaderProps> = ({
  eyebrow = 'YOUR WORKSPACE · OCTOBER 2026',
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <div className="text-[11px] font-extrabold tracking-widest uppercase text-[#5C80B6] mb-1">
          {eyebrow}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};
