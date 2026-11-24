import React, { useRef } from 'react';
import { CheckCircle2, Circle, ListChecks, RotateCcw, X } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getTodayISO } from '../../storage/storage';
import { DailyMicroGoal } from '../../types';

export function DailyGoalsCard() {
  const { state, updateDailyMicroGoal, resetDailyMicroGoals } = useAppData();
  const todayISO = getTodayISO();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const existing = state.dailyMicroGoals[todayISO] || [];
  const slots: DailyMicroGoal[] = [0, 1, 2].map((i) => {
    const found = existing[i];
    return (
      found || {
        id: `goal-${i + 1}`,
        title: '',
        completed: false,
        updatedAt: '',
      }
    );
  });

  const filledCount = slots.filter((g) => g.title.trim().length > 0).length;
  const completedCount = slots.filter((g) => g.title.trim().length > 0 && g.completed).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  const placeholders = [
    'Micro-task #1 (e.g., Solve 1 array problem)',
    'Micro-task #2 (e.g., Review 10 flashcards)',
    'Micro-task #3 (e.g., Polish 1 resume bullet)',
  ];

  const handleToggle = (idx: number, goal: DailyMicroGoal) => {
    if (!goal.title.trim()) {
      inputRefs.current[idx]?.focus();
      return;
    }
    updateDailyMicroGoal(todayISO, idx, { completed: !goal.completed });
  };

  return (
    <section
      aria-label="Daily Goals"
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Daily Goals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              3 micro-tasks for {todayISO}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
            {completedCount}/3
          </span>
          {filledCount > 0 && (
            <button
              type="button"
              onClick={() => resetDailyMicroGoals(todayISO)}
              title="Clear today's 3 daily goals"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span>
            {completedCount === 3
              ? 'All 3 micro-tasks completed today'
              : filledCount === 0
              ? 'Set up to 3 focused micro-tasks for today'
              : `${3 - completedCount} remaining to hit daily target`}
          </span>
          <span className="font-mono tabular-nums">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completedCount === 3 ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Three Micro-task Slots */}
      <div className="mt-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
        {slots.map((goal, idx) => {
          const hasText = goal.title.trim().length > 0;
          const isDone = hasText && goal.completed;

          return (
            <div key={goal.id} className="flex items-center gap-3 py-3 first:pt-2 last:pb-1">
              <button
                type="button"
                onClick={() => handleToggle(idx, goal)}
                aria-label={`Toggle daily goal ${idx + 1}`}
                className="shrink-0 rounded-md p-0.5 text-slate-400 hover:text-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              <span className="font-mono text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                0{idx + 1}
              </span>

              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={120}
                value={goal.title}
                onChange={(e) =>
                  updateDailyMicroGoal(todayISO, idx, { title: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                placeholder={placeholders[idx]}
                aria-label={`Daily micro-task ${idx + 1}`}
                className={`min-w-0 flex-1 bg-transparent text-sm focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                  isDone
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              />

              {hasText && (
                <button
                  type="button"
                  onClick={() =>
                    updateDailyMicroGoal(todayISO, idx, { title: '', completed: false })
                  }
                  aria-label={`Clear daily goal ${idx + 1}`}
                  className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
