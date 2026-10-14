import React, { useState } from 'react';

export interface TodayTaskItem {
  id: string;
  title: string;
  meta: string;
  assigneeInitial: string;
  isUrgent?: boolean;
  isCompleted?: boolean;
}

interface TodayTasksWidgetProps {
  title?: string;
  initialTasks: TodayTaskItem[];
  timeframeBadge?: string;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

export const TodayTasksWidget: React.FC<TodayTasksWidgetProps> = ({
  title = "Today's Tasks",
  initialTasks,
  timeframeBadge = 'Today',
  onTaskToggle,
}) => {
  const [tasks, setTasks] = useState<TodayTaskItem[]>(initialTasks);
  const [searchFilter, setSearchFilter] = useState('');

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = !t.isCompleted;
          if (onTaskToggle) onTaskToggle(id, updated);
          return { ...t, isCompleted: updated };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.meta.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <section className="card panel" aria-labelledby="tasks-heading">
      <div className="panel-head">
        <div>
          <h2 id="tasks-heading" className="text-base font-extrabold text-[#0F172A]">
            {title}
          </h2>
          <p id="task-summary" className="text-xs text-[#64748B] mt-0.5">
            {completedCount} dari {tasks.length} terselesaikan
          </p>
        </div>
        <span className="time-badge">{timeframeBadge}</span>
      </div>

      <div id="task-list" className="space-y-0.5">
        {filteredTasks.map((task) => (
          <label
            key={task.id}
            className={`task-row cursor-pointer ${task.isCompleted ? 'done opacity-60' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!task.isCompleted}
              onChange={() => handleToggle(task.id)}
              aria-label={`Tandai selesai: ${task.title}`}
            />
            <span className={`status-bar ${task.isUrgent ? 'urgent' : ''}`} />
            <span className="task-info">
              <strong>{task.title}</strong>
              <small>{task.meta}</small>
            </span>
            <span className="task-avatar" aria-label={`Ditugaskan ke: ${task.assigneeInitial}`}>
              {task.assigneeInitial}
            </span>
          </label>
        ))}

        {filteredTasks.length === 0 && (
          <p className="text-xs text-[#64748B] py-4 text-center">
            Tidak ada tugas yang sesuai kriteria.
          </p>
        )}
      </div>
    </section>
  );
};
