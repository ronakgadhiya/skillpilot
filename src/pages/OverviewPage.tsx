import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  Compass,
  FileText,
  Flame,
  GraduationCap,
  Map,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { CAREER_ROADMAPS } from '../data/roadmaps';
import { INTERVIEW_CATEGORIES } from '../data/questions';
import { getTodayISO } from '../storage/storage';
import {
  buildInterviewPerformanceSeries,
  buildReadinessTrendSeries,
  buildSkillProgressSeries,
  buildWeeklyActivitySeries,
  computeDashboardMetrics,
} from '../utils/metrics';
import { LearningStreakCard } from '../components/dashboard/LearningStreakCard';
import { DailyGoalsCard } from '../components/dashboard/DailyGoalsCard';

function OnboardingView() {
  const { completeOnboarding } = useAppData();
  const [displayName, setDisplayName] = useState('');
  const [careerGoal, setCareerGoal] = useState('Full Stack Developer');
  const [preferredCategory, setPreferredCategory] = useState('JavaScript');
  const [dailyGoalHours, setDailyGoalHours] = useState(2);
  const [nameError, setNameError] = useState('');

  const handleStart = (useSampleData: boolean) => {
    if (!displayName.trim() && !useSampleData) {
      setNameError('Please enter your name or choose Sample Workspace to explore.');
      return;
    }
    setNameError('');
    completeOnboarding({
      displayName: displayName.trim() || 'Alex Rivera',
      careerGoal,
      preferredCategory,
      dailyGoalHours,
      useSampleData,
    });
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Set up your SkillPilot workspace
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Everything is saved locally in your browser. No account needed.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="onboard-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Your Display Name
            </label>
            <input
              id="onboard-name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g., Priya Nair"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {nameError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{nameError}</p>}
          </div>

          <div>
            <label
              htmlFor="onboard-goal"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Target Career Path
            </label>
            <select
              id="onboard-goal"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {CAREER_ROADMAPS.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="onboard-category"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Preferred Interview Subject
            </label>
            <select
              id="onboard-category"
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {INTERVIEW_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="onboard-hours"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Daily Study Target: <span className="font-mono tabular-nums">{dailyGoalHours}h / day</span>
            </label>
            <input
              id="onboard-hours"
              type="range"
              min={0.5}
              max={6}
              step={0.5}
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleStart(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Explore with Sample Data
          </button>

          <button
            type="button"
            onClick={() => handleStart(false)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Start Clean Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { state, toggleTaskComplete } = useAppData();

  const metrics = useMemo(() => computeDashboardMetrics(state), [state]);
  const weeklyData = useMemo(() => buildWeeklyActivitySeries(state), [state]);
  const skillData = useMemo(() => buildSkillProgressSeries(state), [state]);
  const interviewData = useMemo(() => buildInterviewPerformanceSeries(state), [state]);
  const readinessData = useMemo(() => buildReadinessTrendSeries(state), [state]);

  if (!state.profile.onboarded) {
    return <OnboardingView />;
  }

  const today = getTodayISO();
  const pendingTasks = state.tasks.filter((t) => !t.completed);
  const completedTodayTasks = state.tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(today)
  );
  const upcomingDeadlines = pendingTasks
    .filter((t) => t.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const dailyGoalMinutes = Math.max(30, state.profile.dailyGoalHours * 60);
  const dailyGoalPercent = Math.min(100, Math.round((metrics.todayMinutes / dailyGoalMinutes) * 100));

  const kpiCards = [
    {
      label: 'Career Readiness',
      value: `${metrics.careerReadinessScore}%`,
      sub: state.profile.careerGoal,
      icon: Target,
    },
    {
      label: 'Total Learning Hours',
      value: `${metrics.totalLearningHours}h`,
      sub: `${state.studySessions.length} logged sessions`,
      icon: Clock,
    },
    {
      label: 'Skills & Topics Done',
      value: `${metrics.skillsCompletedCount}`,
      sub: `${metrics.totalSkillsCount} tracked skills`,
      icon: TrendingUp,
    },
    {
      label: 'Interview Avg Score',
      value: metrics.interviewAverageScore !== null ? `${metrics.interviewAverageScore}%` : '—',
      sub:
        state.interviewHistory.length > 0
          ? `${state.interviewHistory.length} tests completed`
          : 'No tests taken yet',
      icon: GraduationCap,
    },
    {
      label: 'Learning Streak',
      value: `${metrics.currentStreak}d`,
      sub: metrics.currentStreak > 0 ? 'Consecutive active days' : 'Log activity today',
      icon: Flame,
    },
    {
      label: 'Weekly Productivity',
      value: `${metrics.weeklyProductivityPercent}%`,
      sub: `Goal: ${state.profile.dailyGoalHours}h/day`,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {state.profile.displayName ? `Hi, ${state.profile.displayName}` : 'SkillPilot Overview'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back! Ready to grow your career today?
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/interview"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <GraduationCap className="h-4 w-4" />
            Start Interview Practice
          </Link>
          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Map className="h-4 w-4" />
            Continue Roadmap
          </Link>
        </div>
      </div>

      {/* 6 Dynamic KPI Cards */}
      <section aria-label="Key Career Metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{card.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Quick Actions Strip */}
      <section aria-label="Quick Actions" className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
          Quick Actions:
        </span>
        {[
          { label: 'Create Resume', to: '/resume', icon: FileText },
          { label: 'Add a Skill', to: '/skills', icon: Plus },
          { label: 'Start Coding Practice', to: '/playground', icon: Code2 },
          { label: 'Open Growth Planner', to: '/planner', icon: Target },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-500/60 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </Link>
          );
        })}
      </section>

      {/* 4 Interactive Charts */}
      <section aria-label="Career Analytics" className="grid gap-6 lg:grid-cols-2">
        {/* 1. Weekly Learning Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Weekly Learning Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hours studied across the past 7 days
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {weeklyData.reduce((s, d) => s + d.hours, 0).toFixed(1)}h total
            </span>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" name="Study Hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Skill Development Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Skill Development Progress
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completion percentage across tracked skills
              </p>
            </div>
            <Link
              to="/skills"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Manage Skills
            </Link>
          </div>
          <div className="mt-4 h-56 w-full">
            {skillData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No skills tracked yet.
                </p>
                <Link
                  to="/skills"
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Add your first skill
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={92} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="progress" name="Progress %" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Interview Performance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Interview Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Score trend across recent practice tests
              </p>
            </div>
            <Link
              to="/interview"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Take Quiz
            </Link>
          </div>
          <div className="mt-4 h-56 w-full">
            {interviewData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Complete an interview quiz to chart your accuracy.
                </p>
                <Link
                  to="/interview"
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Open Interview Arena
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="attempt" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Score %"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Career Readiness Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Career Readiness Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                7-day progression based on topics, skills, quizzes, and tasks
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {metrics.careerReadinessScore}/100
            </span>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="readiness"
                  name="Readiness %"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Daily Goals & Learning Streak Progress Calendar */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DailyGoalsCard />
        </div>
        <div className="lg:col-span-7">
          <LearningStreakCard activityLog={state.activityLog} />
        </div>
      </div>

      {/* Today's Focus */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Today’s Focus
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily goals, pending tasks, upcoming deadlines, and completed work
            </p>
          </div>
          <Link
            to="/planner"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Open Full Planner
          </Link>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-3">
          {/* Daily Goal & Completed Today */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Daily Learning Goal
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {metrics.todayMinutes} / {dailyGoalMinutes} min ({dailyGoalPercent}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Completed Today ({completedTodayTasks.length})
              </p>
              {completedTodayTasks.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  No tasks checked off today yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {completedTodayTasks.slice(0, 4).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 text-sm text-slate-500 line-through dark:text-slate-400"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{t.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Pending Tasks */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Tasks ({pendingTasks.length})
            </p>
            {pendingTasks.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All caught up! Add tasks in Growth Planner.
                </p>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {pendingTasks.slice(0, 5).map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className="flex w-full items-start gap-2.5 rounded-lg border border-slate-200 p-2.5 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <Circle className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.priority} · Due {task.dueDate}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Upcoming Deadlines
            </p>
            {upcomingDeadlines.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No upcoming task deadlines scheduled.
                </p>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingDeadlines.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.category}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums shrink-0">
                      {task.dueDate}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
