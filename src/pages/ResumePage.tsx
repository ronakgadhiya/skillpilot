import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FilePlus,
  Printer,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import {
  ResumeDocument,
  ResumeFontFamily,
  ResumeSectionKey,
  ResumeTemplateId,
} from '../types';
import { createSampleResume, generateId } from '../storage/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const SECTION_LABELS: Record<ResumeSectionKey, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  projects: 'Projects',
  skills: 'Technical Skills',
  education: 'Education',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
};

const ACCENT_COLORS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Slate', value: '#0F172A' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Cobalt', value: '#0284C7' },
  { label: 'Crimson', value: '#B91C1C' },
];

export function ResumePage() {
  const { state, setActiveResume, createResume, updateResume, deleteResume } = useAppData();
  const { showToast } = useToast();

  const activeResume =
    state.resumes.find((r) => r.id === state.activeResumeId) || state.resumes[0];

  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const patchResume = (patch: Partial<ResumeDocument>) => {
    updateResume({ ...activeResume, ...patch });
  };

  const toggleSection = (key: ResumeSectionKey) => {
    const enabled = activeResume.enabledSections.includes(key)
      ? activeResume.enabledSections.filter((k) => k !== key)
      : [...activeResume.enabledSections, key];
    patchResume({ enabledSections: enabled });
  };

  const moveSection = (key: ResumeSectionKey, dir: -1 | 1) => {
    const order = [...activeResume.sectionOrder];
    const idx = order.indexOf(key);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= order.length) return;
    [order[idx], order[target]] = [order[target], order[idx]];
    patchResume({ sectionOrder: order });
  };

  const handleLoadSample = () => {
    const sample = createSampleResume();
    updateResume({
      ...activeResume,
      personal: sample.personal,
      summary: sample.summary,
      experience: sample.experience,
      education: sample.education,
      technicalSkills: sample.technicalSkills,
      projects: sample.projects,
      certifications: sample.certifications,
      achievements: sample.achievements,
      languages: sample.languages,
      enabledSections: sample.enabledSections,
    });
    showToast('Sample resume content loaded. Customize fields anytime.', 'success');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const fontClass =
    activeResume.fontFamily === 'serif'
      ? 'font-serif'
      : activeResume.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const renderSectionPreview = (key: ResumeSectionKey) => {
    if (!activeResume.enabledSections.includes(key)) return null;

    const headingStyle = { color: activeResume.accentColor };

    switch (key) {
      case 'summary':
        if (!activeResume.summary.trim()) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Professional Summary
            </h3>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">
              {activeResume.summary}
            </p>
          </section>
        );

      case 'experience':
        if (activeResume.experience.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Work Experience
            </h3>
            <div className="mt-2 space-y-3">
              {activeResume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {exp.role || 'Role Title'} — {exp.company || 'Company'}
                    </p>
                    <span className="text-[10px] text-slate-500 shrink-0">{exp.period}</span>
                  </div>
                  {exp.location && <p className="text-[10px] text-slate-500">{exp.location}</p>}
                  {exp.bullets.trim() && (
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                      {exp.bullets
                        .split('\n')
                        .map((b) => b.trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (activeResume.projects.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Projects
            </h3>
            <div className="mt-2 space-y-2.5">
              {activeResume.projects.map((p) => (
                <div key={p.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {p.name || 'Project Name'}
                      {p.techStack ? ` · ${p.techStack}` : ''}
                    </p>
                    {p.link && <span className="text-[10px] text-slate-500 shrink-0">{p.link}</span>}
                  </div>
                  {p.description && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
                      {p.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (!activeResume.technicalSkills.trim()) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Technical Skills
            </h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700">
              {activeResume.technicalSkills}
            </p>
          </section>
        );

      case 'education':
        if (activeResume.education.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Education
            </h3>
            <div className="mt-2 space-y-2">
              {activeResume.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {edu.degree || 'Degree'} — {edu.institution || 'Institution'}
                    </p>
                    <span className="text-[10px] text-slate-500 shrink-0">{edu.period}</span>
                  </div>
                  {edu.details && <p className="text-[10px] text-slate-600">{edu.details}</p>}
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (activeResume.certifications.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Certifications
            </h3>
            <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
              {activeResume.certifications.map((c) => (
                <li key={c.id} className="flex justify-between gap-2">
                  <span>
                    <strong className="font-semibold text-slate-900">{c.name}</strong>
                    {c.issuer ? ` — ${c.issuer}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0">{c.year}</span>
                </li>
              ))}
            </ul>
          </section>
        );

      case 'achievements':
        if (activeResume.achievements.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Achievements
            </h3>
            <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
              {activeResume.achievements.map((a) => (
                <li key={a.id}>
                  <strong className="font-semibold text-slate-900">{a.title}:</strong>{' '}
                  {a.description}
                </li>
              ))}
            </ul>
          </section>
        );

      case 'languages':
        if (activeResume.languages.length === 0) return null;
        return (
          <section key={key} className="mt-4">
            <h3
              style={headingStyle}
              className="border-b border-slate-200 pb-1 text-xs font-bold tracking-wider uppercase"
            >
              Languages
            </h3>
            <p className="mt-1.5 text-[11px] text-slate-700">
              {activeResume.languages
                .map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`)
                .join(' · ')}
            </p>
          </section>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar (hidden in print) */}
      <div className="no-print flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Live resume editor with customizable templates, section ordering, and clean PDF print export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeResume.id}
            onChange={(e) => setActiveResume(e.target.value)}
            aria-label="Select resume document"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {state.resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => createResume(`Resume ${state.resumes.length + 1}`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FilePlus className="h-3.5 w-3.5" />
            New
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Load Sample
          </button>

          {state.resumes.length > 1 && (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              aria-label="Delete current resume"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Mobile Edit/Preview Toggle */}
      <div className="no-print flex rounded-lg bg-slate-100 p-1 xl:hidden dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMobileTab('edit')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold ${
            mobileTab === 'edit'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Edit Resume
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 rounded-md py-2 text-xs font-semibold ${
            mobileTab === 'preview'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Live Preview
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Editor Column */}
        <div
          className={`no-print space-y-5 xl:col-span-6 ${
            mobileTab === 'preview' ? 'hidden xl:block' : ''
          }`}
        >
          {/* Appearance & Template */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Document & Design Settings
            </h2>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Document Name
                </label>
                <input
                  type="text"
                  value={activeResume.title}
                  onChange={(e) => patchResume({ title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Template
                </label>
                <select
                  value={activeResume.template}
                  onChange={(e) => patchResume({ template: e.target.value as ResumeTemplateId })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="modern">Modern Minimal</option>
                  <option value="classic">Executive Classic</option>
                  <option value="technical">Technical Split</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Typography
                </label>
                <select
                  value={activeResume.fontFamily}
                  onChange={(e) => patchResume({ fontFamily: e.target.value as ResumeFontFamily })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="sans">Clean Sans</option>
                  <option value="serif">Editorial Serif</option>
                  <option value="mono">Technical Mono</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Accent:
                </span>
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={`Set accent color ${c.label}`}
                    onClick={() => patchResume({ accentColor: c.value })}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      activeResume.accentColor === c.value
                        ? 'scale-110 border-slate-900 dark:border-white'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Section Order & Visibility */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Sections (Toggle & Reorder)
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {activeResume.sectionOrder.map((key, idx) => {
                  const enabled = activeResume.enabledSections.includes(key);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className="flex items-center gap-2 text-left font-medium text-slate-700 dark:text-slate-200"
                      >
                        {enabled ? (
                          <Eye className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span className={!enabled ? 'text-slate-400 line-through' : ''}>
                          {SECTION_LABELS[key]}
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSection(key, -1)}
                          aria-label={`Move ${SECTION_LABELS[key]} up`}
                          className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === activeResume.sectionOrder.length - 1}
                          onClick={() => moveSection(key, 1)}
                          aria-label={`Move ${SECTION_LABELS[key]} down`}
                          className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:hover:text-slate-200"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Personal Info */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Personal Information
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                value={activeResume.personal.fullName}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, fullName: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Target Headline (e.g., Backend Engineer)"
                value={activeResume.personal.headline}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, headline: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={activeResume.personal.email}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, email: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={activeResume.personal.phone}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, phone: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="City, Country"
                value={activeResume.personal.location}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, location: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="GitHub / Portfolio URL"
                value={activeResume.personal.website}
                onChange={(e) =>
                  patchResume({ personal: { ...activeResume.personal, website: e.target.value } })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </section>

          {/* Professional Summary & Skills */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Professional Summary
              </label>
              <textarea
                rows={3}
                value={activeResume.summary}
                onChange={(e) => patchResume({ summary: e.target.value })}
                placeholder="Concise 2–3 sentence summary of experience and strengths..."
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Technical Skills
              </label>
              <textarea
                rows={2}
                value={activeResume.technicalSkills}
                onChange={(e) => patchResume({ technicalSkills: e.target.value })}
                placeholder="TypeScript, React, Python, SQL, Docker, Git..."
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </section>

          {/* Work Experience */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Work Experience
              </h2>
              <button
                type="button"
                onClick={() =>
                  patchResume({
                    experience: [
                      ...activeResume.experience,
                      { id: generateId('exp'), company: '', role: '', period: '', location: '', bullets: '' },
                    ],
                  })
                }
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                + Add Experience
              </button>
            </div>
            {activeResume.experience.map((exp, idx) => (
              <div key={exp.id} className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Role #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({
                        experience: activeResume.experience.filter((e) => e.id !== exp.id),
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Role Title"
                    value={exp.role}
                    onChange={(e) =>
                      patchResume({
                        experience: activeResume.experience.map((item) =>
                          item.id === exp.id ? { ...item, role: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) =>
                      patchResume({
                        experience: activeResume.experience.map((item) =>
                          item.id === exp.id ? { ...item, company: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Period (e.g., Jun 2024 – Present)"
                    value={exp.period}
                    onChange={(e) =>
                      patchResume({
                        experience: activeResume.experience.map((item) =>
                          item.id === exp.id ? { ...item, period: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location}
                    onChange={(e) =>
                      patchResume({
                        experience: activeResume.experience.map((item) =>
                          item.id === exp.id ? { ...item, location: e.target.value } : item
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Accomplishments (one bullet per line)..."
                  value={exp.bullets}
                  onChange={(e) =>
                    patchResume({
                      experience: activeResume.experience.map((item) =>
                        item.id === exp.id ? { ...item, bullets: e.target.value } : item
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Projects</h2>
              <button
                type="button"
                onClick={() =>
                  patchResume({
                    projects: [
                      ...activeResume.projects,
                      { id: generateId('prj'), name: '', techStack: '', link: '', description: '' },
                    ],
                  })
                }
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                + Add Project
              </button>
            </div>
            {activeResume.projects.map((p) => (
              <div key={p.id} className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({ projects: activeResume.projects.filter((x) => x.id !== p.id) })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={p.name}
                    onChange={(e) =>
                      patchResume({
                        projects: activeResume.projects.map((x) =>
                          x.id === p.id ? { ...x, name: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack"
                    value={p.techStack}
                    onChange={(e) =>
                      patchResume({
                        projects: activeResume.projects.map((x) =>
                          x.id === p.id ? { ...x, techStack: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Repo / Link"
                    value={p.link}
                    onChange={(e) =>
                      patchResume({
                        projects: activeResume.projects.map((x) =>
                          x.id === p.id ? { ...x, link: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project impact and architecture..."
                  value={p.description}
                  onChange={(e) =>
                    patchResume({
                      projects: activeResume.projects.map((x) =>
                        x.id === p.id ? { ...x, description: e.target.value } : x
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            ))}
          </section>

          {/* Education */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Education</h2>
              <button
                type="button"
                onClick={() =>
                  patchResume({
                    education: [
                      ...activeResume.education,
                      { id: generateId('edu'), institution: '', degree: '', period: '', details: '' },
                    ],
                  })
                }
                className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                + Add Education
              </button>
            </div>
            {activeResume.education.map((edu) => (
              <div key={edu.id} className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({ education: activeResume.education.filter((x) => x.id !== edu.id) })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      patchResume({
                        education: activeResume.education.map((x) =>
                          x.id === edu.id ? { ...x, institution: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      patchResume({
                        education: activeResume.education.map((x) =>
                          x.id === edu.id ? { ...x, degree: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Period"
                    value={edu.period}
                    onChange={(e) =>
                      patchResume({
                        education: activeResume.education.map((x) =>
                          x.id === edu.id ? { ...x, period: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="GPA / Coursework"
                    value={edu.details}
                    onChange={(e) =>
                      patchResume({
                        education: activeResume.education.map((x) =>
                          x.id === edu.id ? { ...x, details: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Certifications, Achievements, Languages */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Certifications
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    patchResume({
                      certifications: [
                        ...activeResume.certifications,
                        { id: generateId('crt'), name: '', issuer: '', year: '' },
                      ],
                    })
                  }
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add
                </button>
              </div>
              {activeResume.certifications.map((c) => (
                <div key={c.id} className="mt-2 grid gap-2 sm:grid-cols-7">
                  <input
                    type="text"
                    placeholder="Certification"
                    value={c.name}
                    onChange={(e) =>
                      patchResume({
                        certifications: activeResume.certifications.map((x) =>
                          x.id === c.id ? { ...x, name: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Issuer"
                    value={c.issuer}
                    onChange={(e) =>
                      patchResume({
                        certifications: activeResume.certifications.map((x) =>
                          x.id === c.id ? { ...x, issuer: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={c.year}
                    onChange={(e) =>
                      patchResume({
                        certifications: activeResume.certifications.map((x) =>
                          x.id === c.id ? { ...x, year: e.target.value } : x
                        ),
                      })
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({
                        certifications: activeResume.certifications.filter((x) => x.id !== c.id),
                      })
                    }
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Achievements
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    patchResume({
                      achievements: [
                        ...activeResume.achievements,
                        { id: generateId('ach'), title: '', description: '' },
                      ],
                    })
                  }
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add
                </button>
              </div>
              {activeResume.achievements.map((a) => (
                <div key={a.id} className="mt-2 grid gap-2 sm:grid-cols-7">
                  <input
                    type="text"
                    placeholder="Title"
                    value={a.title}
                    onChange={(e) =>
                      patchResume({
                        achievements: activeResume.achievements.map((x) =>
                          x.id === a.id ? { ...x, title: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={a.description}
                    onChange={(e) =>
                      patchResume({
                        achievements: activeResume.achievements.map((x) =>
                          x.id === a.id ? { ...x, description: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-4 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({
                        achievements: activeResume.achievements.filter((x) => x.id !== a.id),
                      })
                    }
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Languages */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Languages</h2>
                <button
                  type="button"
                  onClick={() =>
                    patchResume({
                      languages: [
                        ...activeResume.languages,
                        { id: generateId('lng'), name: '', proficiency: '' },
                      ],
                    })
                  }
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  + Add
                </button>
              </div>
              {activeResume.languages.map((l) => (
                <div key={l.id} className="mt-2 grid gap-2 sm:grid-cols-7">
                  <input
                    type="text"
                    placeholder="Language"
                    value={l.name}
                    onChange={(e) =>
                      patchResume({
                        languages: activeResume.languages.map((x) =>
                          x.id === l.id ? { ...x, name: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Proficiency (e.g., Native)"
                    value={l.proficiency}
                    onChange={(e) =>
                      patchResume({
                        languages: activeResume.languages.map((x) =>
                          x.id === l.id ? { ...x, proficiency: e.target.value } : x
                        ),
                      })
                    }
                    className="sm:col-span-3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      patchResume({
                        languages: activeResume.languages.filter((x) => x.id !== l.id),
                      })
                    }
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Live Print-Ready Preview Column */}
        <div
          className={`xl:col-span-6 ${
            mobileTab === 'edit' ? 'hidden xl:block' : ''
          }`}
        >
          <div className="sticky top-20">
            <div className="print-only-container rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xs dark:border-slate-800">
              <div className={fontClass}>
                {/* Header Layout varies by Template */}
                {activeResume.template === 'classic' && (
                  <header className="border-b-2 pb-3 text-center" style={{ borderColor: activeResume.accentColor }}>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {activeResume.personal.fullName || 'Your Name'}
                    </h2>
                    {activeResume.personal.headline && (
                      <p className="mt-0.5 text-xs font-medium" style={{ color: activeResume.accentColor }}>
                        {activeResume.personal.headline}
                      </p>
                    )}
                    <p className="mt-1.5 text-[10px] text-slate-600">
                      {[
                        activeResume.personal.email,
                        activeResume.personal.phone,
                        activeResume.personal.location,
                        activeResume.personal.website,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'email@example.com · City · github.com/username'}
                    </p>
                  </header>
                )}

                {activeResume.template === 'modern' && (
                  <header className="border-b border-slate-200 pb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      {activeResume.personal.fullName || 'Your Name'}
                    </h2>
                    {activeResume.personal.headline && (
                      <p className="mt-0.5 text-sm font-semibold" style={{ color: activeResume.accentColor }}>
                        {activeResume.personal.headline}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
                      {[
                        activeResume.personal.email,
                        activeResume.personal.phone,
                        activeResume.personal.location,
                        activeResume.personal.website,
                      ]
                        .filter(Boolean)
                        .map((item, i) => (
                          <span key={i}>{item}</span>
                        ))}
                    </div>
                  </header>
                )}

                {activeResume.template === 'technical' && (
                  <header
                    className="flex flex-col justify-between gap-2 rounded-lg p-4 text-white sm:flex-row sm:items-center"
                    style={{ backgroundColor: activeResume.accentColor }}
                  >
                    <div>
                      <h2 className="text-lg font-bold">
                        {activeResume.personal.fullName || 'Your Name'}
                      </h2>
                      <p className="text-xs opacity-90">
                        {activeResume.personal.headline || 'Software Engineer'}
                      </p>
                    </div>
                    <div className="text-[10px] opacity-90 sm:text-right space-y-0.5">
                      {activeResume.personal.email && <p>{activeResume.personal.email}</p>}
                      {activeResume.personal.phone && <p>{activeResume.personal.phone}</p>}
                      {activeResume.personal.website && <p>{activeResume.personal.website}</p>}
                    </div>
                  </header>
                )}

                {activeResume.sectionOrder.map((key) => renderSectionPreview(key))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this resume?"
        description={`Are you sure you want to delete "${activeResume.title}"? This action cannot be undone.`}
        confirmLabel="Delete Resume"
        destructive
        onConfirm={() => {
          deleteResume(activeResume.id);
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
