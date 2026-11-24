import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Flame } from 'lucide-react';
import { DailyActivityEntry } from '../../types';
import { computeLearningStreak, getTodayISO } from '../../storage/storage';

interface LearningStreakCardProps {
  activityLog: Record<string, DailyActivityEntry>;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isDayActive(entry?: DailyActivityEntry): boolean {
  if (!entry) return false;
  return (
    entry.minutesStudied > 0 ||
    entry.tasksCompleted > 0 ||
    entry.topicsCompleted > 0 ||
    entry.interviewsTaken > 0
  );
}

function computeLongestStreak(activityLog: Record<string, DailyActivityEntry>): number {
  const activeDates = Object.keys(activityLog)
    .filter((key) => isDayActive(activityLog[key]))
    .sort();
  if (activeDates.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1] + 'T12:00:00');
    const curr = new Date(activeDates[i] + 'T12:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current += 1;
      if (current > longest) longest = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

export function LearningStreakCard({ activityLog }: LearningStreakCardProps) {
  const todayISO = getTodayISO();
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);

  const currentStreak = useMemo(() => computeLearningStreak(activityLog), [activityLog]);
  const longestStreak = useMemo(() => computeLongestStreak(activityLog), [activityLog]);

  // Build 5-week (35-day) weekday-aligned calendar ending on the Saturday of the current week
  const calendarCells = useMemo(() => {
    const todayDate = new Date(todayISO + 'T12:00:00');
    const dayOfWeek = todayDate.getDay(); // 0 = Sun .. 6 = Sat
    const endOfWeek = new Date(todayDate);
    endOfWeek.setDate(todayDate.getDate() + (6 - dayOfWeek));

    const cells: {
      iso: string;
      dayNum: number;
      monthShort: string;
      isFuture: boolean;
      isToday: boolean;
      entry?: DailyActivityEntry;
      intensity: 0 | 1 | 2 | 3;
    }[] = [];

    for (let offset = -34; offset <= 0; offset++) {
      const d = new Date(endOfWeek);
      d.setDate(endOfWeek.getDate() + offset);
      const iso = toISODate(d);
      const isFuture = iso > todayISO;
      const entry = activityLog[iso];
      const active = isDayActive(entry);

      let intensity: 0 | 1 | 2 | 3 = 0;
      if (active && entry) {
        const score =
          entry.minutesStudied +
          entry.tasksCompleted * 20 +
          entry.topicsCompleted * 25 +
          entry.interviewsTaken * 25;
        if (score >= 90) intensity = 3;
        else if (score >= 40) intensity = 2;
        else intensity = 1;
      }

      cells.push({
        iso,
        dayNum: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
        isFuture,
        isToday: iso === todayISO,
        entry,
        intensity,
      });
    }
    return cells;
  }, [activityLog, todayISO]);

  const activeInWindow = useMemo(
    () => calendarCells.filter((c) => !c.isFuture && c.intensity > 0).length,
    [calendarCells]
  );

  const activeToday = isDayActive(activityLog[todayISO]);
  const selectedEntry = activityLog[selectedDateISO];

  return (
    <section
      aria-label="Learning Streak Progress Calendar"
      className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Learning Streak Calendar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeToday
                ? 'Activity logged today — streak is active.'
                : 'Complete a task, roadmap topic, quiz, or study session today to extend your streak.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-left sm:text-right">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current Streak</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Best Streak</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active (5 Weeks)</p>
            <p className="font-display text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {activeInWindow}d
            </p>
          </div>
        </div>
      </div>

      {/* 7-Column Calendar Grid */}
      <div className="mt-5">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            const isSelected = cell.iso === selectedDateISO;
            const toneClass = cell.isFuture
              ? 'bg-slate-50 text-slate-300 border-slate-100 dark:bg-slate-900/40 dark:text-slate-700 dark:border-slate-800/60 cursor-default'
              : cell.intensity === 3
              ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
              : cell.intensity === 2
              ? 'bg-indigo-200 text-indigo-950 border-indigo-300 dark:bg-indigo-800/80 dark:text-indigo-100 dark:border-indigo-700'
              : cell.intensity === 1
              ? 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-900'
              : 'bg-slate-100/80 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800';

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={cell.isFuture}
                onClick={() => setSelectedDateISO(cell.iso)}
                title={
                  cell.isFuture
                    ? `${cell.iso} (Upcoming)`
                    : `${cell.iso}: ${cell.entry?.minutesStudied || 0}m studied`
                }
                className={`relative flex h-11 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-transform tabular-nums ${toneClass} ${
                  isSelected && !cell.isFuture
                    ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-indigo-400 dark:ring-offset-slate-900'
                    : ''
                } ${cell.isToday ? 'font-bold' : ''}`}
              >
                <span>
                  {cell.dayNum === 1 ? `${cell.monthShort} 1` : cell.dayNum}
                </span>
                {cell.isToday && (
                  <span className="text-[9px] leading-none opacity-80">Today</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail & Legend */}
      <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${
              isDayActive(selectedEntry)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          />
          <span>
            <strong className="font-semibold text-slate-900 dark:text-white">
              {selectedDateISO === todayISO ? `Today (${selectedDateISO})` : selectedDateISO}:
            </strong>{' '}
            {selectedEntry
              ? `${selectedEntry.minutesStudied}m studied · ${selectedEntry.tasksCompleted} tasks · ${selectedEntry.topicsCompleted} topics · ${selectedEntry.interviewsTaken} interviews`
              : 'No study activity logged on this date.'}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Less</span>
            <span className="h-3 w-3 rounded-xs bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700" />
            <span className="h-3 w-3 rounded-xs bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-900" />
            <span className="h-3 w-3 rounded-xs bg-indigo-200 border border-indigo-300 dark:bg-indigo-800 dark:border-indigo-700" />
            <span className="h-3 w-3 rounded-xs bg-indigo-600 dark:bg-indigo-500" />
            <span>More</span>
          </div>
          <Link
            to="/planner"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 whitespace-nowrap"
          >
            Log Activity
          </Link>
        </div>
      </div>
    </section>
  );
}
