import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Code2,
  Compass,
  Database,
  FileText,
  GraduationCap,
  HardDrive,
  Lock,
  Map,
  Moon,
  ShieldCheck,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppDataContext';
import { CAREER_ROADMAPS } from '../data/roadmaps';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { state } = useAppData();

  const ctaLabel = state.profile.onboarded ? 'Continue to Dashboard' : 'Open Workspace';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar: Strict 3-zone contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            SkillPilot
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#features"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#roadmaps"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Roadmaps
            </a>
            <a
              href="#privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Local Privacy
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/overview"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="grid items-stretch gap-12 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Your Personal Career Growth OS
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-balance leading-[1.12]">
              Build Skills. Master Interviews. Accelerate Your Career.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              A complete, browser-native workspace for structured career roadmaps, timed technical
              interview practice, clean PDF resume authoring, skill tracking, coding practice, and
              daily study planning—without accounts or subscriptions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/overview"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Explore Capabilities
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span>No account required</span>
              <span aria-hidden="true">·</span>
              <span>100% browser LocalStorage</span>
              <span aria-hidden="true">·</span>
              <span>Offline-ready after load</span>
              <span aria-hidden="true">·</span>
              <span>Full JSON backup export</span>
            </div>
          </div>

          {/* Interactive Workspace Overview Preview */}
          <div className="lg:col-span-6 flex items-stretch">
            <div className="w-full rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Integrated Career Modules
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any module below to jump straight in
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  9 Workspaces
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    to: '/roadmaps',
                    title: 'Career Roadmaps',
                    meta: '10 paths · Beginner to Advanced',
                    icon: Map,
                  },
                  {
                    to: '/interview',
                    title: 'Interview Arena',
                    meta: '110+ MCQs · 11 core categories',
                    icon: GraduationCap,
                  },
                  {
                    to: '/resume',
                    title: 'Resume Studio',
                    meta: '3 templates · Print-ready PDF',
                    icon: FileText,
                  },
                  {
                    to: '/skills',
                    title: 'Skill Tracker',
                    meta: 'Proficiency & topic analytics',
                    icon: TrendingUp,
                  },
                  {
                    to: '/playground',
                    title: 'Coding Playground',
                    meta: 'Sandboxed JS runner · 5 languages',
                    icon: Code2,
                  },
                  {
                    to: '/planner',
                    title: 'Growth Planner',
                    meta: 'Tasks · Calendar · Pomodoro timer',
                    icon: CalendarCheck,
                  },
                ].map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.to}
                      to={mod.to}
                      className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 hover:border-indigo-500/60 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/30 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 border border-slate-200 dark:bg-slate-900 dark:text-indigo-400 dark:border-slate-700">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors">
                          {mod.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {mod.meta}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>Zero server dependency · Instant local persistence</span>
                <Link
                  to="/achievements"
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <Award className="h-3.5 w-3.5" />
                  Milestone system
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Bento Grid */}
      <section id="features" className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl text-balance">
              Everything required to move from learning to job readiness
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Built for college students, fresh graduates, and practicing engineers preparing for
              technical roles.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                01. Structured Roadmaps
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Step-by-step Career Timelines
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Explore 10 engineering, data, DevOps, and QA career tracks broken into Beginner,
                Intermediate, and Advanced milestones with clear learning objectives and completion
                tracking.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                02. Timed Practice
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Interview Arena Across 11 Subjects
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Test yourself across Python, Java, JavaScript, HTML/CSS, SQL, DSA, DBMS, OS,
                Computer Networks, Aptitude, and Logical Reasoning with timers and detailed
                explanations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                03. Resume Studio
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Live Preview & PDF Print
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Reorder sections, switch between three clean templates, adjust typography and accent
                color, and export crisp PDF resumes directly via your browser.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                04. Restricted Code Sandbox
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Coding Playground
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Practice classic interview problems with isolated Web Worker execution for
                JavaScript and editable templates for Python, Java, C, and C++.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                05. Focus & Consistency
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Growth Planner & Pomodoro
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Organize tasks across daily, weekly, and calendar views, log timed Pomodoro study
                sessions, and track daily learning habits and streaks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Roadmaps Preview */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              How SkillPilot works
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Start immediately with zero sign-up friction. Every completed topic, quiz attempt,
              study session, and skill updates your readiness metrics in real time.
            </p>
            <div className="mt-8 space-y-6">
              {[
                {
                  step: '01. Choose your target role',
                  desc: 'Select from 10 career roadmaps during onboarding or start from a clean slate.',
                },
                {
                  step: '02. Practice & document progress',
                  desc: 'Complete roadmap topics, take timed interview quizzes, log skills, and run Pomodoro study sessions.',
                },
                {
                  step: '03. Build your resume & export backups',
                  desc: 'Craft print-ready resumes in Resume Studio and back up your entire workspace as portable JSON anytime.',
                },
              ].map((item) => (
                <div key={item.step} className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.step}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="roadmaps" className="lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Included Career Tracks
                </h3>
                <Link
                  to="/roadmaps"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Open Explorer
                </Link>
              </div>
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {CAREER_ROADMAPS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{r.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {r.category} · {r.topics.length} modules
                      </p>
                    </div>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {r.totalHours}h est.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local-First Privacy Architecture Section */}
      <section
        id="privacy"
        className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Local-First Architecture & Data Ownership
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                SkillPilot runs entirely inside your web browser without an external database,
                tracking server, or user account system. Understanding how your data is stored helps
                keep your work safe:
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Lock,
                  title: 'No Account Required',
                  desc: 'Start using every module immediately without creating passwords or sharing an email address.',
                },
                {
                  icon: HardDrive,
                  title: 'Stored Locally',
                  desc: 'Your profile, resumes, skills, tasks, and test history stay in your browser’s LocalStorage.',
                },
                {
                  icon: Database,
                  title: 'No Auto Cross-Device Sync',
                  desc: 'Data does not automatically synchronize between browsers or devices because there is no cloud backend.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Export Regular Backups',
                  desc: 'Always export a JSON backup in Settings before clearing browser site data or switching devices.',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="space-y-2">
                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
              <Link
                to="/overview"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/privacy"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Read Privacy Information
              </Link>
              <Link
                to="/terms"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Read Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-base font-bold text-slate-900 dark:text-white">
              SkillPilot
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Build Skills. Master Interviews. Accelerate Your Career.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link to="/overview" className="hover:text-slate-900 dark:hover:text-white">
              Workspace
            </Link>
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white">
              Terms of Use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
