import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
}

export function LegalPage({ mode }: LegalPageProps) {
  const isPrivacy = mode === 'privacy';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            <Compass className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            SkillPilot
          </Link>
          <Link
            to="/overview"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Open Workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isPrivacy ? 'Privacy Information' : 'Terms of Use'}
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            SkillPilot · Local-First Browser Application
          </p>

          {isPrivacy ? (
            <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  1. No Account or Personal Data Collection
                </h2>
                <p className="mt-2">
                  SkillPilot does not require registration, login credentials, or user accounts.
                  We do not collect, transmit, or store your resume details, career roadmaps,
                  interview scores, tasks, or code snippets on external servers.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  2. Local Browser Storage
                </h2>
                <p className="mt-2">
                  All workspace records are stored strictly inside your own browser’s LocalStorage
                  under versioned SkillPilot keys. Theme preferences are likewise saved locally on
                  your device.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  3. No Automatic Cross-Device Sync
                </h2>
                <p className="mt-2">
                  Because there is no backend database, SkillPilot does not automatically
                  synchronize your progress across different browsers, profiles, or physical
                  devices.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  4. Backups and Browser Data Clearing
                </h2>
                <p className="mt-2">
                  Clearing your browser’s site data or using private browsing windows will permanently
                  remove local workspace data. Always download a JSON backup from Settings before
                  clearing browser storage or switching devices.
                </p>
              </section>
            </div>
          ) : (
            <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  1. Purpose of Application
                </h2>
                <p className="mt-2">
                  SkillPilot is provided as a self-paced personal career planning, resume
                  authoring, and interview preparation tool running locally in your browser.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  2. User Responsibility for Data Backups
                </h2>
                <p className="mt-2">
                  You retain full control and responsibility for data stored in your browser. Use
                  the built-in JSON export tool regularly to maintain personal backups of resumes,
                  skills, and progress logs.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  3. Coding Playground Sandbox
                </h2>
                <p className="mt-2">
                  JavaScript code run in the Coding Playground executes inside an isolated Web
                  Worker with a strict execution timeout. Templates for Python, Java, C, and C++ are
                  provided for authoring and study and require an external compiler outside this
                  browser-only application.
                </p>
              </section>

              <section>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  4. No Warranty
                </h2>
                <p className="mt-2">
                  Learning materials, roadmaps, and practice questions are provided for educational
                  preparation without warranty of employment outcomes.
                </p>
              </section>
            </div>
          )}

          <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
            <Link
              to={isPrivacy ? '/terms' : '/privacy'}
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              {isPrivacy ? 'View Terms of Use' : 'View Privacy Information'}
            </Link>
            <Link
              to="/overview"
              className="font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Go to Workspace
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
