import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Edit3,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PlannerTask, TaskCategory, TaskPriority } from '../types';
import {
  computeLearningStreak,
  getOffsetDateISO,
  getTodayISO,
} from '../storage/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const TASK_CATEGORIES: TaskCategory[] = [
  'Learning',
  'Interview Prep',
  'Coding Practice',
  'Resume & Career',
  'Project',
];

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

function playCompletionBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio playback optional
  }
}

export function PlannerPage() {
  const {
    state,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    logStudySession,
    addHabit,
    toggleHabitDate,
    deleteHabit,
  } = useAppData();

  const today = getTodayISO();
  const streak = useMemo(() => computeLearningStreak(state.activityLog), [state.activityLog]);

  // Task views & modal
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'calendar'>('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Learning');
  const [taskDueDate, setTaskDueDate] = useState(today);
  const [taskError, setTaskError] = useState('');
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<PlannerTask | null>(null);

  // Pomodoro state
  const [pomoMode, setPomoMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [pomoTopic, setPomoTopic] = useState('Focused Study');
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);

  // Habit creation
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const modeDurationMinutes = pomoMode === 'focus' ? 25 : pomoMode === 'short' ? 5 : 15;

  useEffect(() => {
    if (!pomoRunning) return;
    if (pomoSeconds <= 0) {
      setPomoRunning(false);
      playCompletionBeep();
      if (pomoMode === 'focus') {
        logStudySession({
          topic: pomoTopic.trim() || 'Pomodoro Focus Session',
          durationMinutes: 25,
          mode: 'focus',
          date: getTodayISO(),
        });
      }
      setPomoSeconds(modeDurationMinutes * 60);
      return;
    }
    const id = window.setInterval(() => {
      setPomoSeconds((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [pomoRunning, pomoSeconds, pomoMode, pomoTopic, modeDurationMinutes, logStudySession]);

  const switchPomoMode = (next: 'focus' | 'short' | 'long') => {
    setPomoRunning(false);
    setPomoMode(next);
    setPomoSeconds((next === 'focus' ? 25 : next === 'short' ? 5 : 15) * 60);
  };

  const openAddTask = (prefillDate = selectedDate) => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskCategory('Learning');
    setTaskDueDate(prefillDate);
    setTaskError('');
    setTaskModalOpen(true);
  };

  const openEditTask = (task: PlannerTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description);
    setTaskPriority(task.priority);
    setTaskCategory(task.category);
    setTaskDueDate(task.dueDate);
    setTaskError('');
    setTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskError('Task title is required.');
      return;
    }
    if (editingTask) {
      updateTask({
        ...editingTask,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate,
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate,
      });
    }
    setTaskModalOpen(false);
  };

  // Weekly dates (today through +6 days)
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => getOffsetDateISO(i));
  }, []);

  // Calendar grid for calendarMonth
  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth.year, calendarMonth.month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(calendarMonth.month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      cells.push(`${calendarMonth.year}-${m}-${dayStr}`);
    }
    return cells;
  }, [calendarMonth]);

  const dailyTasks = state.tasks.filter((t) => t.dueDate === selectedDate);
  const mins = Math.floor(pomoSeconds / 60);
  const secs = pomoSeconds % 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Growth Planner
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Organize study tasks, Pomodoro sessions, daily habits, and learning streaks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 tabular-nums">
            <Flame className="h-4 w-4 text-amber-500" />
            {streak} Day Streak
          </div>
          <button
            type="button"
            onClick={() => openAddTask(selectedDate)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Task Views (Daily, Weekly, Calendar) */}
        <div className="space-y-5 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['daily', 'weekly', 'calendar'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode} View
                </button>
              ))}
            </div>

            {viewMode === 'daily' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Select date for daily view"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            )}
          </div>

          {/* Daily View */}
          {viewMode === 'daily' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Tasks for {selectedDate === today ? `Today (${today})` : selectedDate}
                </h2>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {dailyTasks.filter((t) => t.completed).length}/{dailyTasks.length} done
                </span>
              </div>

              {dailyTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No tasks scheduled for {selectedDate}.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAddTask(selectedDate)}
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    + Add a task for this day
                  </button>
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {dailyTasks.map((task) => (
                    <li key={task.id} className="flex items-start justify-between gap-3 py-3">
                      <button
                        type="button"
                        onClick={() => toggleTaskComplete(task.id)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 text-slate-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {task.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {task.priority} Priority · {task.category}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTaskTarget(task)}
                          aria-label={`Delete ${task.title}`}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Weekly View */}
          {viewMode === 'weekly' && (
            <div className="space-y-3">
              {weekDates.map((iso) => {
                const dayTasks = state.tasks.filter((t) => t.dueDate === iso);
                const label = new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div
                    key={iso}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {iso === today ? `${label} (Today)` : label}
                      </p>
                      <button
                        type="button"
                        onClick={() => openAddTask(iso)}
                        className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        + Add
                      </button>
                    </div>
                    {dayTasks.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-400">No tasks scheduled.</p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {dayTasks.map((t) => (
                          <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                            <button
                              type="button"
                              onClick={() => toggleTaskComplete(t.id)}
                              className="flex items-center gap-2 text-left min-w-0"
                            >
                              {t.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`truncate ${
                                  t.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {t.title}
                              </span>
                            </button>
                            <span className="text-xs text-slate-500 shrink-0">{t.priority}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() =>
                      setCalendarMonth((m) =>
                        m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }
                      )
                    }
                    className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() =>
                      setCalendarMonth((m) =>
                        m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }
                      )
                    }
                    className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((iso, idx) => {
                  if (!iso) return <div key={`empty-${idx}`} className="h-16" />;
                  const dayTasks = state.tasks.filter((t) => t.dueDate === iso);
                  const isSelected = iso === selectedDate;
                  const isToday = iso === today;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setSelectedDate(iso);
                        setViewMode('daily');
                      }}
                      className={`flex h-16 flex-col items-start justify-between rounded-lg border p-1.5 text-left transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                          : isToday
                          ? 'border-indigo-300 dark:border-indigo-800'
                          : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                        {Number(iso.slice(-2))}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pomodoro Timer & Habit Tracker */}
        <div className="space-y-6 lg:col-span-4">
          {/* Pomodoro Timer */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Pomodoro Study Timer
            </h2>

            <div className="mt-3 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  { id: 'focus', label: 'Focus 25m' },
                  { id: 'short', label: 'Break 5m' },
                  { id: 'long', label: 'Long 15m' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchPomoMode(m.id)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                    pomoMode === m.id
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="my-6 text-center">
              <p className="font-mono text-5xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </p>
            </div>

            <input
              type="text"
              value={pomoTopic}
              onChange={(e) => setPomoTopic(e.target.value)}
              placeholder="What are you studying?"
              aria-label="Study session topic"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPomoRunning((r) => !r)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {pomoRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {pomoRunning ? 'Pause' : 'Start'}
              </button>
              <button
                type="button"
                onClick={() => switchPomoMode(pomoMode)}
                aria-label="Reset timer"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                logStudySession({
                  topic: pomoTopic.trim() || 'Manual Study Block',
                  durationMinutes: 30,
                  mode: 'manual',
                  date: today,
                })
              }
              className="mt-3 w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              + Log 30 min completed study
            </button>
          </div>

          {/* Daily Habits */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Daily Habits
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Check off today’s recurring learning habits
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newHabitTitle.trim()) return;
                addHabit(newHabitTitle, 5);
                setNewHabitTitle('');
              }}
              className="mt-3 flex gap-2"
            >
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="New habit..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-indigo-600"
              >
                Add
              </button>
            </form>

            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {state.habits.map((h) => {
                const doneToday = h.completedDates.includes(today);
                const weekHits = weekDates.filter((d) => h.completedDates.includes(d)).length;
                return (
                  <li key={h.id} className="flex items-center justify-between gap-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleHabitDate(h.id, today)}
                      className="flex items-center gap-2.5 text-left min-w-0"
                    >
                      {doneToday ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {h.title}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {weekHits}/{h.targetPerWeek} this week
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHabit(h.id)}
                      aria-label={`Delete habit ${h.title}`}
                      className="rounded p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Task Add/Edit Modal */}
      {taskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
        >
          <form
            onSubmit={handleSaveTask}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'New Study Task'}
              </h2>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {taskError && <p className="mt-3 text-xs text-red-600">{taskError}</p>}

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Practice 5 SQL window function queries"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTaskTarget)}
        title="Delete this task?"
        description={
          deleteTaskTarget ? `Remove "${deleteTaskTarget.title}" from Growth Planner?` : ''
        }
        confirmLabel="Delete Task"
        destructive
        onConfirm={() => {
          if (deleteTaskTarget) deleteTask(deleteTaskTarget.id);
          setDeleteTaskTarget(null);
        }}
        onCancel={() => setDeleteTaskTarget(null)}
      />
    </div>
  );
}
