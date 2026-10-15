'use client';

import React from 'react';

export interface AssignmentProgressItem {
  id: string;
  title: string;
  progress: number;
  badgeText?: string;
  isCoral?: boolean;
}

interface AssignmentsTrackerWidgetProps {
  title?: string;
  subtitle?: string;
  timeframeBadge?: string;
  items: AssignmentProgressItem[];
}

export const AssignmentsTrackerWidget: React.FC<AssignmentsTrackerWidgetProps> = ({
  title = 'Assignments / Tasks',
  timeframeBadge = 'This week',
  items,
}) => {
  return (
    <section className="card panel" aria-labelledby="assignments-heading">
      <div className="panel-head">
        <div>
          <h2 id="assignments-heading" className="text-base font-extrabold text-[#0F172A]">
            {title}
          </h2>
        </div>
        <span className="time-badge">{timeframeBadge}</span>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="assignment">
            <div className="row-top flex justify-between items-center text-xs font-bold text-[#0F172A]">
              <span>{item.title}</span>
              <span className="font-mono">{item.progress}%</span>
            </div>
            <div
              className="track"
              role="progressbar"
              aria-label={`${item.title} progres`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.progress}
            >
              <div
                className={`fill ${item.isCoral ? 'coral' : ''}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
