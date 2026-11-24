import React, { useMemo, useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { SkillCategory, SkillLevel, TrackedSkill } from '../types';
import { getTodayISO } from '../storage/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const SKILL_CATEGORIES: SkillCategory[] = [
  'Programming Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud & DevOps',
  'Data & AI',
  'CS Fundamentals',
  'Testing & QA',
  'Soft Skills',
];

const PROFICIENCY_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9'];

interface SkillFormState {
  name: string;
  category: SkillCategory;
  proficiency: SkillLevel;
  goal: string;
  completedTopics: number;
  totalTopics: number;
  hoursLogged: number;
  notes: string;
  lastPracticed: string;
}

const emptyForm = (): SkillFormState => ({
  name: '',
  category: 'Programming Languages',
  proficiency: 'Beginner',
  goal: '',
  completedTopics: 0,
  totalTopics: 10,
  hoursLogged: 0,
  notes: '',
  lastPracticed: getTodayISO(),
});

export function SkillsPage() {
  const { state, addSkill, updateSkill, deleteSkill } = useAppData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'proficiency' | 'hours' | 'date'>('date');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TrackedSkill | null>(null);
  const [form, setForm] = useState<SkillFormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TrackedSkill | null>(null);

  const openAddModal = () => {
    setEditingSkill(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (skill: TrackedSkill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      goal: skill.goal,
      completedTopics: skill.completedTopics,
      totalTopics: skill.totalTopics,
      hoursLogged: skill.hoursLogged,
      notes: skill.notes,
      lastPracticed: skill.lastPracticed,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Skill name is required.');
      return;
    }
    if (form.totalTopics < 1) {
      setFormError('Total topics must be at least 1.');
      return;
    }
    if (form.completedTopics > form.totalTopics) {
      setFormError('Completed topics cannot exceed total topics.');
      return;
    }

    if (editingSkill) {
      updateSkill({
        ...editingSkill,
        ...form,
        name: form.name.trim(),
        goal: form.goal.trim(),
        notes: form.notes.trim(),
      });
    } else {
      addSkill({
        ...form,
        name: form.name.trim(),
        goal: form.goal.trim(),
        notes: form.notes.trim(),
      });
    }
    setModalOpen(false);
  };

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    const levelRank: Record<SkillLevel, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    return state.skills
      .filter((s) => {
        const catOk = categoryFilter === 'All' || s.category === categoryFilter;
        const lvlOk = levelFilter === 'All' || s.proficiency === levelFilter;
        const qOk =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.goal.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q);
        return catOk && lvlOk && qOk;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'proficiency') return levelRank[b.proficiency] - levelRank[a.proficiency];
        if (sortBy === 'hours') return b.hoursLogged - a.hoursLogged;
        return b.lastPracticed.localeCompare(a.lastPracticed);
      });
  }, [state.skills, search, categoryFilter, levelFilter, sortBy]);

  const categoryChartData = useMemo(() => {
    const counts: Record<string, { category: string; count: number; hours: number }> = {};
    for (const s of state.skills) {
      if (!counts[s.category]) counts[s.category] = { category: s.category, count: 0, hours: 0 };
      counts[s.category].count += 1;
      counts[s.category].hours += s.hoursLogged;
    }
    return Object.values(counts);
  }, [state.skills]);

  const proficiencyChartData = useMemo(() => {
    return PROFICIENCY_LEVELS.map((lvl) => ({
      name: lvl,
      value: state.skills.filter((s) => s.proficiency === lvl).length,
    })).filter((d) => d.value > 0);
  }, [state.skills]);

  const monthlyChartData = useMemo(() => {
    const map: Record<string, { month: string; skills: number; hours: number }> = {};
    for (const s of state.skills) {
      const dateStr = s.lastPracticed || s.createdAt.slice(0, 10);
      const monthKey = dateStr.slice(0, 7);
      if (!map[monthKey]) map[monthKey] = { month: monthKey, skills: 0, hours: 0 };
      map[monthKey].skills += 1;
      map[monthKey].hours += s.hoursLogged;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [state.skills]);

  const overallProgress = useMemo(() => {
    const totalTopics = state.skills.reduce((sum, s) => sum + s.totalTopics, 0);
    const doneTopics = state.skills.reduce((sum, s) => sum + s.completedTopics, 0);
    const totalHours = state.skills.reduce((sum, s) => sum + s.hoursLogged, 0);
    const percent = totalTopics > 0 ? Math.min(100, Math.round((doneTopics / totalTopics) * 100)) : 0;
    return { totalTopics, doneTopics, totalHours, percent };
  }, [state.skills]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skill Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor technical competencies, learning goals, practice hours, and topic completion.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Analytics Row */}
      {state.skills.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Skills & Hours by Category
            </h2>
            <div className="mt-4 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" name="Skills" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hours" name="Hours Logged" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Proficiency Distribution
            </h2>
            <div className="mt-4 h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={proficiencyChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {proficiencyChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Monthly Skill Development
                </h2>
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {overallProgress.percent}% topics done
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {overallProgress.doneTopics}/{overallProgress.totalTopics} topics · {overallProgress.totalHours}h logged
              </p>
            </div>

            <div className="mt-3 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="hours" name="Hours" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, goals, or notes..."
            aria-label="Search skills"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filter by proficiency"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Levels</option>
            {PROFICIENCY_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort skills"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="date">Sort: Recently Practiced</option>
            <option value="proficiency">Sort: Proficiency</option>
            <option value="hours">Sort: Hours Logged</option>
            <option value="name">Sort: Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Skills Grid / Empty State */}
      {filteredSkills.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {state.skills.length === 0 ? 'No skills tracked yet' : 'No matching skills found'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {state.skills.length === 0
              ? 'Add the languages, frameworks, and tools you are developing to monitor growth.'
              : 'Try adjusting your search term or category filters.'}
          </p>
          {state.skills.length === 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Your First Skill
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => {
            const pct =
              skill.totalTopics > 0
                ? Math.min(100, Math.round((skill.completedTopics / skill.totalTopics) * 100))
                : 0;
            return (
              <article
                key={skill.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold text-slate-900 dark:text-white">
                        {skill.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {skill.category} · {skill.proficiency}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(skill)}
                        aria-label={`Edit ${skill.name}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(skill)}
                        aria-label={`Delete ${skill.name}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {skill.goal && (
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{skill.goal}</p>
                  )}
                  {skill.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {skill.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    <span>
                      Topics: {skill.completedTopics}/{skill.totalTopics} ({pct}%)
                    </span>
                    <span className="font-mono">{skill.hoursLogged}h logged</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                    Last practiced: {skill.lastPracticed}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4"
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
                {formError}
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., TypeScript, PostgreSQL, Docker"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Proficiency Level
                </label>
                <select
                  value={form.proficiency}
                  onChange={(e) => setForm({ ...form, proficiency: e.target.value as SkillLevel })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {PROFICIENCY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Learning Goal
                </label>
                <input
                  type="text"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g., Build production APIs with automated integration tests"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Completed Topics
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.completedTopics}
                  onChange={(e) => setForm({ ...form, completedTopics: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Total Topics
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.totalTopics}
                  onChange={(e) => setForm({ ...form, totalTopics: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Hours Logged
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.hoursLogged}
                  onChange={(e) => setForm({ ...form, hoursLogged: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Last Practiced Date
                </label>
                <input
                  type="date"
                  value={form.lastPracticed}
                  onChange={(e) => setForm({ ...form, lastPracticed: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Key takeaways, weak spots, or resources..."
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {editingSkill ? 'Save Changes' : 'Add Skill'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete tracked skill?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.name}" from your Skill Tracker?`
            : ''
        }
        confirmLabel="Delete Skill"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteSkill(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
