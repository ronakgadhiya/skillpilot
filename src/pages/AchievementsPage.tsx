import React from 'react';
import { Award, CheckCircle2, Flame, Lock, Trophy } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import {
  ACHIEVEMENTS,
  calculateUserPoints,
  getLevelInfo,
} from '../data/achievements';
import { computeLearningStreak } from '../storage/storage';

export function AchievementsPage() {
  const { state } = useAppData();

  const totalPoints = calculateUserPoints(state);
  const levelInfo = getLevelInfo(totalPoints);
  const streak = computeLearningStreak(state.activityLog);
  const unlockedMap = new Map(
    state.unlockedAchievements.map((u) => [u.id, u.unlockedAt])
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Achievements & Progression
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Badges and levels unlock automatically as you complete real roadmaps, tests, skills, and tasks.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Level
            </span>
            <Trophy className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            Level {levelInfo.level} · {levelInfo.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Next level at {levelInfo.nextLevelPoints} pts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Points
            </span>
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {totalPoints} pts
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Earned from completed milestones
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Learning Streak
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {streak} days
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consecutive active learning days
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Badges Unlocked
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {state.unlockedAchievements.length} / {ACHIEVEMENTS.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Verified against local activity
          </p>
        </div>
      </div>

      {/* Progress Toward Next Level */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-slate-900 dark:text-white">
            Progress toward Level {levelInfo.level + 1}
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {totalPoints} / {levelInfo.nextLevelPoints} pts ({levelInfo.progressPercent}%)
          </span>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((ach) => {
          const unlockedAt = unlockedMap.get(ach.id);
          const { current, target } = ach.getProgress(state);
          const pct = Math.min(100, Math.round((current / target) * 100));
          const isUnlocked = Boolean(unlockedAt) || current >= target;

          return (
            <div
              key={ach.id}
              className={`rounded-xl border p-5 transition-colors ${
                isUnlocked
                  ? 'border-indigo-200 bg-white dark:border-indigo-900/60 dark:bg-slate-900'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isUnlocked
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {isUnlocked ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  +{ach.points} pts
                </span>
              </div>

              <h2 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
                {ach.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {ach.description}
              </p>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span
                    className={
                      isUnlocked
                        ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {isUnlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {current} / {target}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      isUnlocked ? 'bg-emerald-600' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {unlockedAt && (
                  <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    Unlocked {new Date(unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
