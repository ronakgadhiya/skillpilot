import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Circle,
  Code2,
  CornerDownLeft,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Map,
  Search,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { CAREER_ROADMAPS } from '../../data/roadmaps';
import { INTERVIEW_CATEGORIES } from '../../data/questions';

export interface PaletteItem {
  id: string;
  group: 'Modules' | 'Roadmaps' | 'Tasks' | 'Interviews' | 'Skills & Tools';
  title: string;
  subtitle: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULE_ITEMS: PaletteItem[] = [
  { id: 'mod-overview', group: 'Modules', title: 'Overview', subtitle: 'Ctrl+1 · Dashboard & metrics', route: '/overview', icon: LayoutDashboard },
  { id: 'mod-roadmaps', group: 'Modules', title: 'Career Roadmaps', subtitle: 'Ctrl+2 · 10 career paths', route: '/roadmaps', icon: Map },
  { id: 'mod-interview', group: 'Modules', title: 'Interview Arena', subtitle: 'Ctrl+3 · Timed MCQ practice', route: '/interview', icon: GraduationCap },
  { id: 'mod-resume', group: 'Modules', title: 'Resume Studio', subtitle: 'Ctrl+4 · Builder & PDF export', route: '/resume', icon: FileText },
  { id: 'mod-skills', group: 'Modules', title: 'Skill Tracker', subtitle: 'Ctrl+5 · Skill progress & analytics', route: '/skills', icon: TrendingUp },
  { id: 'mod-playground', group: 'Modules', title: 'Coding Playground', subtitle: 'Ctrl+6 · Code sandbox & templates', route: '/playground', icon: Code2 },
  { id: 'mod-planner', group: 'Modules', title: 'Growth Planner', subtitle: 'Ctrl+7 · Tasks, calendar & Pomodoro', route: '/planner', icon: CalendarCheck },
  { id: 'mod-achievements', group: 'Modules', title: 'Achievements', subtitle: 'Ctrl+8 · Badges & levels', route: '/achievements', icon: Award },
  { id: 'mod-settings', group: 'Modules', title: 'Settings', subtitle: 'Ctrl+9 · Preferences & JSON backup', route: '/settings', icon: Settings },
  { id: 'mod-home', group: 'Modules', title: 'Public Landing Page', subtitle: 'Overview & privacy disclosures', route: '/', icon: Home },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { state } = useAppData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [...MODULE_ITEMS];

    for (const roadmap of CAREER_ROADMAPS) {
      const done = state.roadmapProgress[roadmap.id]?.length || 0;
      items.push({
        id: `rm-${roadmap.id}`,
        group: 'Roadmaps',
        title: roadmap.title,
        subtitle: `${roadmap.category} · ${done}/${roadmap.topics.length} topics`,
        route: `/roadmaps?id=${roadmap.id}`,
        icon: Map,
      });
    }

    for (const task of state.tasks) {
      items.push({
        id: `tk-${task.id}`,
        group: 'Tasks',
        title: task.title,
        subtitle: `${task.completed ? 'Completed' : 'Pending'} · ${task.priority} · Due ${task.dueDate}`,
        route: '/planner',
        icon: task.completed ? CheckCircle2 : Circle,
      });
    }

    for (const cat of INTERVIEW_CATEGORIES) {
      items.push({
        id: `iv-${cat}`,
        group: 'Interviews',
        title: `${cat} Practice Test`,
        subtitle: 'Interview Arena · Timed quiz',
        route: `/interview?category=${encodeURIComponent(cat)}`,
        icon: GraduationCap,
      });
    }

    for (const skill of state.skills) {
      items.push({
        id: `sk-${skill.id}`,
        group: 'Skills & Tools',
        title: skill.name,
        subtitle: `Skill · ${skill.proficiency} · ${skill.hoursLogged}h`,
        route: '/skills',
        icon: TrendingUp,
      });
    }

    for (const snp of state.snippets) {
      items.push({
        id: `sn-${snp.id}`,
        group: 'Skills & Tools',
        title: snp.title,
        subtitle: `Saved Snippet · ${snp.language}`,
        route: '/playground',
        icon: Code2,
      });
    }

    return items;
  }, [state.roadmapProgress, state.tasks, state.skills, state.snippets]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show top modules, top roadmaps, and pending tasks when query is empty
      const modules = allItems.filter((i) => i.group === 'Modules').slice(0, 6);
      const tasks = allItems.filter((i) => i.group === 'Tasks').slice(0, 3);
      const roadmaps = allItems.filter((i) => i.group === 'Roadmaps').slice(0, 3);
      return [...modules, ...tasks, ...roadmaps];
    }

    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 14);
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (item: PaletteItem) => {
    navigate(item.route);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
      );
      return;
    }
    if (e.key === 'Enter' && filteredItems[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global command palette search"
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 backdrop-blur-xs px-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a module, roadmap, task, interview, or skill..."
            aria-label="Search commands and workspace items"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden dark:text-slate-100"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No results for "{query}"
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try searching for a module name, career roadmap, task title, or interview topic.
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === activeIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-950 dark:bg-indigo-950/60 dark:text-indigo-100'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.group} · {item.subtitle}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 shrink-0">
                          <CornerDownLeft className="h-3.5 w-3.5" />
                          Open
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
          <span>Use ↑ ↓ to navigate · Enter to open · Esc to close</span>
          <span className="font-mono">Cmd/Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
