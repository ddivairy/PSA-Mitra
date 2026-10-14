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
      <div className="metric-list">
        {items.map((item) => (
          <div key={item.id} className="metric-row">
            <div className="metric-label"><span>{item.label}</span><span>{item.percentage}%</span></div>
            <div className="metric-track" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percentage}>
              <div className={`metric-fill ${item.isCoral ? 'coral' : ''}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
