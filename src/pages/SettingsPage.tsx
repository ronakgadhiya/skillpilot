import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Moon,
  RotateCcw,
  Save,
  Sun,
  Upload,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { CAREER_ROADMAPS } from '../data/roadmaps';
import { INTERVIEW_CATEGORIES } from '../data/questions';
import { downloadWorkspaceBackupJSON, validateImportedState } from '../storage/storage';
import { SkillPilotState } from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function SettingsPage() {
  const { state, updateProfile, importFullState, resetAllData } = useAppData();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [careerGoal, setCareerGoal] = useState(state.profile.careerGoal);
  const [preferredCategory, setPreferredCategory] = useState(state.profile.preferredCategory);
  const [dailyGoalHours, setDailyGoalHours] = useState(state.profile.dailyGoalHours);

  const [pendingImport, setPendingImport] = useState<SkillPilotState | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Display name cannot be empty.', 'error');
      return;
    }
    updateProfile({
      displayName: displayName.trim(),
      careerGoal,
      preferredCategory,
      dailyGoalHours,
    });
    showToast('Profile settings saved locally.', 'success');
  };

  const handleExportJSON = () => {
    downloadWorkspaceBackupJSON(state);
    showToast('Workspace backup downloaded as JSON.', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validation = validateImportedState(parsed);
        if (!validation.valid || !validation.data) {
          showToast(validation.error || 'Invalid backup file schema.', 'error');
          return;
        }
        setPendingImport(validation.data);
      } catch {
        showToast('Malformed JSON file. Could not parse backup.', 'error');
      }
    };
    reader.onerror = () => {
      showToast('Failed to read the selected file.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Data Management
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Customize your profile preferences, theme appearance, and local JSON backups.
        </p>
      </div>

      {/* Profile Preferences */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Profile & Learning Preferences
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Target Career Goal
            </label>
            <select
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {CAREER_ROADMAPS.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Preferred Interview Category
            </label>
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {INTERVIEW_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Daily Learning Target (Hours)
            </label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 tabular-nums"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </form>

      {/* Theme Appearance */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Appearance
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Theme preference persists locally across reloads.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="h-4 w-4" />
            Light Mode
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="h-4 w-4" />
            Dark Mode
          </button>
        </div>
      </section>

      {/* Data Backup, Import & Reset */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Local Data Backup & Restore
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            SkillPilot stores all records locally in your browser (schema v{state.version}). Export
            backups regularly before clearing site data or moving to another device.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Export JSON Backup
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Import JSON Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Reset SkillPilot Data
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Removes only SkillPilot application data from LocalStorage and returns you to the initial
            onboarding screen.
          </p>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Application
          </button>
        </div>
      </section>

      {/* Import Confirmation */}
      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="Replace current workspace with backup?"
        description={
          pendingImport
            ? `Validated backup (schema v${pendingImport.version}) for "${
                pendingImport.profile.displayName || 'Workspace User'
              }" containing ${pendingImport.skills.length} skills, ${
                pendingImport.resumes.length
              } resume(s), and ${
                pendingImport.tasks.length
              } tasks. Importing will overwrite your current local data.`
            : ''
        }
        confirmLabel="Restore Backup"
        onConfirm={() => {
          if (pendingImport) {
            importFullState(pendingImport);
            setDisplayName(pendingImport.profile.displayName);
            setCareerGoal(pendingImport.profile.careerGoal);
            setPreferredCategory(pendingImport.profile.preferredCategory);
            setDailyGoalHours(pendingImport.profile.dailyGoalHours);
          }
          setPendingImport(null);
        }}
        onCancel={() => setPendingImport(null)}
      />

      {/* Reset Confirmation */}
      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset all SkillPilot data?"
        description="This permanently clears your roadmaps, interview history, resumes, skills, tasks, and achievements from LocalStorage and returns you to onboarding."
        confirmLabel="Reset Everything"
        destructive
        onConfirm={() => {
          setConfirmResetOpen(false);
          resetAllData();
          navigate('/overview');
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
