import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Play,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../context/ToastContext';
import { CODING_PROBLEMS } from '../data/codingProblems';
import { ProgrammingLanguage } from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

const LANGUAGES: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'javascript', label: 'JavaScript (Sandbox)' },
  { id: 'python', label: 'Python (Template)' },
  { id: 'java', label: 'Java (Template)' },
  { id: 'c', label: 'C (Template)' },
  { id: 'cpp', label: 'C++ (Template)' },
];

function executeJavaScriptInSandbox(code: string): Promise<{ logs: string[]; error: string | null }> {
  return new Promise((resolve) => {
    const workerSource = `
      "use strict";
      // Restrict network and browser APIs inside the worker scope
      const blocked = () => { throw new Error("Network and storage APIs are disabled in the sandbox."); };
      self.fetch = blocked;
      self.XMLHttpRequest = function() { blocked(); };
      self.WebSocket = function() { blocked(); };
      self.importScripts = blocked;

      const logs = [];
      const safeFormat = (val) => {
        if (typeof val === "string") return val;
        try { return JSON.stringify(val); } catch { return String(val); }
      };
      const console = {
        log: (...args) => logs.push(args.map(safeFormat).join(" ")),
        info: (...args) => logs.push(args.map(safeFormat).join(" ")),
        warn: (...args) => logs.push("[warn] " + args.map(safeFormat).join(" ")),
        error: (...args) => logs.push("[error] " + args.map(safeFormat).join(" ")),
      };

      self.onmessage = (e) => {
        try {
          const fn = new Function("console", e.data);
          fn(console);
          self.postMessage({ logs, error: null });
        } catch (err) {
          self.postMessage({ logs, error: err && err.message ? err.message : String(err) });
        }
      };
    `;

    const blob = new Blob([workerSource], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        logs: [],
        error: 'Execution timed out after 2000ms (possible infinite loop).',
      });
    }, 2000);

    worker.onmessage = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };

    worker.onerror = (err) => {
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        logs: [],
        error: err.message || 'Runtime error inside sandbox.',
      });
    };

    worker.postMessage(code);
  });
}

function highlightCodeLine(line: string): React.ReactNode {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
    return <span className="text-slate-400 italic">{line}</span>;
  }
  return line;
}

export function PlaygroundPage() {
  const { state, saveSnippet, deleteSnippet } = useAppData();
  const { showToast } = useToast();

  const [selectedProblemId, setSelectedProblemId] = useState(CODING_PROBLEMS[1].id);
  const [language, setLanguage] = useState<ProgrammingLanguage>('javascript');
  const [code, setCode] = useState(CODING_PROBLEMS[1].templates.javascript);
  const [snippetTitle, setSnippetTitle] = useState('Two Sum Indices');
  const [activeSnippetId, setActiveSnippetId] = useState<string | undefined>(undefined);

  const [running, setRunning] = useState(false);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const selectedProblem = useMemo(
    () => CODING_PROBLEMS.find((p) => p.id === selectedProblemId) || CODING_PROBLEMS[0],
    [selectedProblemId]
  );

  const handleProblemChange = (problemId: string) => {
    const prob = CODING_PROBLEMS.find((p) => p.id === problemId) || CODING_PROBLEMS[0];
    setSelectedProblemId(prob.id);
    setCode(prob.templates[language]);
    setSnippetTitle(prob.title);
    setActiveSnippetId(undefined);
    setOutputLogs([]);
    setOutputError(null);
    setHasRun(false);
  };

  const handleLanguageChange = (nextLang: ProgrammingLanguage) => {
    setLanguage(nextLang);
    setCode(selectedProblem.templates[nextLang]);
    setActiveSnippetId(undefined);
    setOutputLogs([]);
    setOutputError(null);
    setHasRun(false);
  };

  const handleReset = () => {
    setCode(selectedProblem.templates[language]);
    setOutputLogs([]);
    setOutputError(null);
    setHasRun(false);
    showToast('Editor reset to starter template.', 'info');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Code copied to clipboard.', 'success');
    } catch {
      showToast('Could not copy automatically. Please copy from editor.', 'warning');
    }
  };

  const handleSaveSnippet = () => {
    const title = snippetTitle.trim() || `${selectedProblem.title} (${language})`;
    const saved = saveSnippet({
      id: activeSnippetId,
      title,
      language,
      problemId: selectedProblem.id,
      code,
    });
    setActiveSnippetId(saved.id);
  };

  const handleRunJS = async () => {
    if (language !== 'javascript') return;
    setRunning(true);
    setHasRun(true);
    const res = await executeJavaScriptInSandbox(code);
    setOutputLogs(res.logs);
    setOutputError(res.error);
    setRunning(false);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = code.substring(0, start) + '  ' + code.substring(end);
      setCode(updated);
      window.requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Coding Playground
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Practice coding challenges with isolated Web Worker JavaScript execution and multi-language templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as ProgrammingLanguage)}
            aria-label="Select programming language"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Problem Description + Saved Snippets */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Select Problem
            </label>
            <select
              value={selectedProblemId}
              onChange={(e) => handleProblemChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {CODING_PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>

            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedProblem.title}
                </h2>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {selectedProblem.difficulty} · {selectedProblem.category}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedProblem.description}
              </p>

              <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800/70">
                <p className="text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">Input:</span> {selectedProblem.sampleInput}
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">Expected Output:</span>{' '}
                  {selectedProblem.expectedOutput}
                </p>
              </div>

              <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedProblem.constraints.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Saved Snippets */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Saved Local Snippets ({state.snippets.length})
            </h3>
            {state.snippets.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Save your solutions locally to revisit them later.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {state.snippets.map((snp) => (
                  <li key={snp.id} className="flex items-center justify-between gap-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage(snp.language);
                        setCode(snp.code);
                        setSnippetTitle(snp.title);
                        setActiveSnippetId(snp.id);
                        if (snp.problemId) setSelectedProblemId(snp.problemId);
                        setOutputLogs([]);
                        setOutputError(null);
                        setHasRun(false);
                      }}
                      className="min-w-0 text-left hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {snp.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {snp.language} · {new Date(snp.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(snp.id)}
                      aria-label={`Delete snippet ${snp.title}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Editor & Restricted Output Console */}
        <div className="space-y-4 lg:col-span-7">
          {/* External Compiler Notice for Non-JS Languages */}
          {language !== 'javascript' && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold">
                  External compiler required for {language.toUpperCase()} execution
                </p>
                <p className="mt-1 leading-relaxed">
                  SkillPilot runs 100% locally in your browser without backend servers. You can edit,
                  copy, and save {language.toUpperCase()} templates locally, and execute them using
                  a local IDE or external compiler service. Live browser execution is supported for
                  JavaScript.
                </p>
              </div>
            </div>
          )}

          {/* Code Editor Surface */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                aria-label="Snippet title"
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-hidden border-b border-transparent focus:border-indigo-400"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSnippet}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Snippet
                </button>
                {language === 'javascript' && (
                  <button
                    type="button"
                    onClick={handleRunJS}
                    disabled={running}
                    className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {running ? 'Running...' : 'Run JavaScript'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex max-h-[380px] overflow-auto font-mono text-xs leading-6">
              <div
                aria-hidden="true"
                className="select-none border-r border-slate-800 bg-slate-900/60 px-3 py-3 text-right text-slate-500 tabular-nums"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                aria-label="Code editor"
                rows={Math.max(12, lineCount)}
                className="w-full resize-none bg-transparent p-3 font-mono text-xs leading-6 text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Syntax-Highlighted Readout Strip */}
            <details className="border-t border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-400">
              <summary className="cursor-pointer font-medium hover:text-slate-200">
                Inspect Formatted Code Preview
              </summary>
              <pre className="mt-2 overflow-x-auto pb-2 font-mono text-xs leading-5 text-slate-200">
                {code.split('\n').map((l, i) => (
                  <div key={i}>{highlightCodeLine(l) || ' '}</div>
                ))}
              </pre>
            </details>
          </div>

          {/* Output Console (JS Sandbox only) */}
          {language === 'javascript' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Restricted Sandbox Output
                </h3>
                <span className="text-[11px] text-slate-400">
                  Isolated Web Worker · 2000ms limit
                </span>
              </div>
              <div className="mt-3 min-h-[96px] rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-100">
                {!hasRun ? (
                  <p className="text-slate-500">Click "Run JavaScript" to execute in sandbox.</p>
                ) : outputError ? (
                  <div className="space-y-1">
                    {outputLogs.map((l, i) => (
                      <div key={i} className="text-slate-300">
                        {l}
                      </div>
                    ))}
                    <div className="text-red-400">Error: {outputError}</div>
                  </div>
                ) : outputLogs.length === 0 ? (
                  <p className="text-slate-400">
                    Executed cleanly with no console.log output.
                  </p>
                ) : (
                  outputLogs.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap text-emerald-300">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete saved snippet?"
        description="This removes the saved code snippet from LocalStorage."
        confirmLabel="Delete Snippet"
        destructive
        onConfirm={() => {
          if (deleteTargetId) deleteSnippet(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
