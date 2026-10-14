import React from 'react';

export interface AnalyticsGaugeItem {
  id: string;
  label: string;
  percentage: number;
  isCoral?: boolean;
}

interface AnalyticsOverviewWidgetProps {
  title?: string;
  items: AnalyticsGaugeItem[];
}

export const AnalyticsOverviewWidget: React.FC<AnalyticsOverviewWidgetProps> = ({
  title = 'Analytics overview',
  items,
}) => {
  return (
    <section className="card panel" aria-labelledby="analytics-heading">
      <div className="panel-head">
        <h2 id="analytics-heading" className="text-base font-extrabold text-[#0F172A]">
          {title}
        </h2>
      </div>
      <div className="circle-grid">
        {items.map((item) => (
          <div key={item.id} className="circle-item">
            <div
              className={`circle ${item.isCoral ? 'coral-ring' : ''}`}
              style={{ '--progress': `${item.percentage}%` } as React.CSSProperties}
            >
              <span>{item.percentage}%</span>
            </div>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
