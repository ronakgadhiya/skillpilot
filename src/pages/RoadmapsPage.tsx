import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { CAREER_ROADMAPS } from '../data/roadmaps';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const CATEGORIES = ['All', 'Software Engineering', 'Data & AI', 'Infrastructure & QA'] as const;

export function RoadmapsPage() {
  const { state, setActiveRoadmap, toggleRoadmapTopic, resetRoadmapProgress } = useAppData();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const paramId = searchParams.get('id');
    if (paramId && CAREER_ROADMAPS.some((r) => r.id === paramId)) {
      setActiveRoadmap(paramId);
    }
  }, [searchParams, setActiveRoadmap]);

  const filteredRoadmaps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CAREER_ROADMAPS.filter((r) => {
      const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.overview.toLowerCase().includes(q) ||
        r.requiredSkills.some((s) => s.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, categoryFilter]);

  const selectedRoadmap =
    CAREER_ROADMAPS.find((r) => r.id === state.activeRoadmapId) || CAREER_ROADMAPS[0];

  const completedIds = state.roadmapProgress[selectedRoadmap.id] || [];
  const completedCount = selectedRoadmap.topics.filter((t) => completedIds.includes(t.id)).length;
  const progressPercent =
    selectedRoadmap.topics.length > 0
      ? Math.round((completedCount / selectedRoadmap.topics.length) * 100)
      : 0;

  const nextIncompleteTopic = selectedRoadmap.topics.find((t) => !completedIds.includes(t.id));

  const handleResumeNext = () => {
    if (!nextIncompleteTopic) return;
    setLevelFilter('All');
    setHighlightedTopicId(nextIncompleteTopic.id);
    window.setTimeout(() => {
      const el = topicRefs.current[nextIncompleteTopic.id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const levels: ('Beginner' | 'Intermediate' | 'Advanced')[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
  ];

  const visibleLevels = levelFilter === 'All' ? levels : [levelFilter];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Career Roadmaps
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Structured learning paths from Beginner fundamentals to Advanced production mastery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {nextIncompleteTopic && (
            <button
              type="button"
              onClick={handleResumeNext}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Play className="h-4 w-4" />
              Resume Next Topic
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            disabled={completedCount === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Progress
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search career tracks or skills..."
            aria-label="Search career roadmaps"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left List of 10 Roadmaps */}
        <div className="space-y-2.5 lg:col-span-4">
          {filteredRoadmaps.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No career roadmaps match "{search}".
              </p>
            </div>
          ) : (
            filteredRoadmaps.map((roadmap) => {
              const done = state.roadmapProgress[roadmap.id] || [];
              const pct =
                roadmap.topics.length > 0
                  ? Math.round((done.length / roadmap.topics.length) * 100)
                  : 0;
              const isSelected = roadmap.id === selectedRoadmap.id;

              return (
                <button
                  key={roadmap.id}
                  type="button"
                  onClick={() => {
                    setActiveRoadmap(roadmap.id);
                    setHighlightedTopicId(null);
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-slate-900 dark:text-white">
                        {roadmap.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {roadmap.category} · {roadmap.topics.length} topics · {roadmap.totalHours}h
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums shrink-0">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detailed Roadmap Timeline */}
        <div className="space-y-6 lg:col-span-8">
          {/* Overview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {selectedRoadmap.category}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                  {selectedRoadmap.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {selectedRoadmap.overview}
                </p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {progressPercent}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {completedCount} of {selectedRoadmap.topics.length} completed
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Required Skills:{' '}
                </span>
                {selectedRoadmap.requiredSkills.join(' · ')}
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      levelFilter === lvl
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Timeline by Level */}
          <div className="space-y-6">
            {visibleLevels.map((level) => {
              const levelTopics = selectedRoadmap.topics.filter((t) => t.level === level);
              if (levelTopics.length === 0) return null;
              const levelCompleted = levelTopics.filter((t) => completedIds.includes(t.id)).length;

              return (
                <section
                  key={level}
                  className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                      {level} Level
                    </h3>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {levelCompleted}/{levelTopics.length} completed
                    </span>
                  </div>

                  <div className="mt-5 relative space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                    {levelTopics.map((topic) => {
                      const isDone = completedIds.includes(topic.id);
                      const isHighlighted = highlightedTopicId === topic.id;

                      return (
                        <div
                          key={topic.id}
                          ref={(el) => {
                            topicRefs.current[topic.id] = el;
                          }}
                          className={`relative pl-10 transition-colors ${
                            isHighlighted ? 'rounded-lg bg-indigo-50/60 p-3 pl-10 -mx-3 dark:bg-indigo-950/30' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleRoadmapTopic(
                                selectedRoadmap.id,
                                topic.id,
                                topic.estimatedHours
                              )
                            }
                            aria-label={`Mark ${topic.title} as ${isDone ? 'incomplete' : 'complete'}`}
                            className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-900"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 transition-colors" />
                            )}
                          </button>

                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleRoadmapTopic(
                                    selectedRoadmap.id,
                                    topic.id,
                                    topic.estimatedHours
                                  )
                                }
                                className={`text-left text-sm font-semibold transition-colors ${
                                  isDone
                                    ? 'text-slate-500 line-through dark:text-slate-400'
                                    : 'text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400'
                                }`}
                              >
                                {topic.title}
                              </button>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {topic.description}
                              </p>
                            </div>

                            <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                              <Clock className="h-3.5 w-3.5" />
                              {topic.estimatedHours}h
                            </span>
                          </div>

                          <ul className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            {topic.objectives.map((obj) => (
                              <li key={obj} className="flex items-start gap-2">
                                <span aria-hidden="true" className="text-indigo-500">
                                  ·
                                </span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset roadmap progress?"
        description={`This will clear all completed topics for "${selectedRoadmap.title}". Your other roadmaps and skills will not be affected.`}
        confirmLabel="Reset Progress"
        destructive
        onConfirm={() => {
          resetRoadmapProgress(selectedRoadmap.id);
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
