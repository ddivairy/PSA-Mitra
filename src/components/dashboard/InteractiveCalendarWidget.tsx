import React, { useState } from 'react';

interface InteractiveCalendarWidgetProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: number;
}

export const InteractiveCalendarWidget: React.FC<InteractiveCalendarWidgetProps> = ({
  onSelectDate,
  selectedDate: initialSelected = 14,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)); // October 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(initialSelected);

  const monthYearLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth);

  const firstDayIndex = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const daysBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isCurrentMonthOct2026 = currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 9;

  return (
    <section className="card panel" aria-label="Kalender Bulanan">
      <div className="panel-head">
        <h2 className="text-base font-extrabold text-[#0F172A] capitalize">{monthYearLabel}</h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="icon-button"
            style={{ width: 32, height: 32 }}
            aria-label="Bulan sebelumnya"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="icon-button"
            style={{ width: 32, height: 32 }}
            aria-label="Bulan berikutnya"
          >
            &rsaquo;
          </button>
        </div>
      </div>

      <div className="calendar-week" aria-hidden="true">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-days">
        {daysBlanks.map((_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}

        {monthDays.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = isCurrentMonthOct2026 && day === 14;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day);
                if (onSelectDate) {
                  onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                }
              }}
              className={`${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
};
