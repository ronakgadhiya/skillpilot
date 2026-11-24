import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Save,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { INTERVIEW_CATEGORIES, INTERVIEW_QUESTIONS } from '../data/questions';
import {
  Difficulty,
  InterviewAttempt,
  InterviewAttemptAnswer,
  InterviewCategory,
  InterviewQuestion,
} from '../types';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatSeconds(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PREP_TOPICS = [
  ...INTERVIEW_CATEGORIES,
  'System Design',
  'Behavioral & STAR',
];

export function InterviewPage() {
  const {
    state,
    recordInterviewAttempt,
    clearInterviewHistory,
    addInterviewPrepLog,
    deleteInterviewPrepLog,
    clearInterviewPrepLogs,
  } = useAppData();
  const [searchParams] = useSearchParams();

  // Quiz Setup state
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory>('JavaScript');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [questionCount, setQuestionCount] = useState<5 | 10>(10);
  const [quizTimerMode, setQuizTimerMode] = useState<'auto' | 'custom'>('auto');
  const [customQuizMinutes, setCustomQuizMinutes] = useState<number>(15);

  // Quiz session state
  const [mode, setMode] = useState<'setup' | 'active' | 'review'>('setup');
  const [quizQuestions, setQuizQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [quizPaused, setQuizPaused] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmClearHistoryOpen, setConfirmClearHistoryOpen] = useState(false);
  const [confirmClearPrepLogsOpen, setConfirmClearPrepLogsOpen] = useState(false);

  // Review state
  const [reviewAttempt, setReviewAttempt] = useState<InterviewAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect'>('all');

  // Standalone Customizable Interview Prep Timer state
  const [prepMode, setPrepMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [prepTargetMinutes, setPrepTargetMinutes] = useState<number>(15);
  const [prepTopic, setPrepTopic] = useState<string>('JavaScript');
  const [prepNote, setPrepNote] = useState<string>('');
  const [prepRunning, setPrepRunning] = useState<boolean>(false);
  const [prepSeconds, setPrepSeconds] = useState<number>(15 * 60);
  const prepCompletionGuard = useRef(false);

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && INTERVIEW_CATEGORIES.includes(catParam as InterviewCategory)) {
      setSelectedCategory(catParam as InterviewCategory);
      setPrepTopic(catParam);
    }
  }, [searchParams]);

  const availablePool = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter((q) => {
      const catMatch = q.category === selectedCategory;
      const diffMatch = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return catMatch && diffMatch;
    });
  }, [selectedCategory, selectedDifficulty]);

  const startTest = () => {
    const pool =
      availablePool.length > 0
        ? availablePool
        : INTERVIEW_QUESTIONS.filter((q) => q.category === selectedCategory);
    const chosen = shuffleArray(pool).slice(0, Math.min(questionCount, pool.length));
    const safeMinutes = Math.min(120, Math.max(1, Math.round(customQuizMinutes || 10)));
    const totalSeconds =
      quizTimerMode === 'custom' ? safeMinutes * 60 : chosen.length * 60;
    setQuizQuestions(chosen);
    setAnswers(new Array(chosen.length).fill(null));
    setCurrentIndex(0);
    setSecondsRemaining(totalSeconds);
    setTotalDurationSeconds(totalSeconds);
    setQuizPaused(false);
    setMode('active');
  };

  const finalizeTest = () => {
    setConfirmSubmitOpen(false);
    setQuizPaused(false);
    const evaluated: InterviewAttemptAnswer[] = quizQuestions.map((q, idx) => ({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selectedIndex: answers[idx],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    const correctCount = evaluated.filter((a) => a.selectedIndex === a.correctIndex).length;
    const scorePercent =
      evaluated.length > 0 ? Math.round((correctCount / evaluated.length) * 100) : 0;
    const elapsed = Math.max(1, totalDurationSeconds - secondsRemaining);

    const attemptPayload = {
      category: selectedCategory,
      difficulty: selectedDifficulty,
      totalQuestions: evaluated.length,
      correctCount,
      scorePercent,
      durationSeconds: elapsed,
      answers: evaluated,
    };

    recordInterviewAttempt(attemptPayload);
    addInterviewPrepLog({
      category: selectedCategory,
      focusNote: `Practice Quiz (${correctCount}/${evaluated.length} · ${scorePercent}%)`,
      mode: 'countdown',
      targetMinutes: Math.round(totalDurationSeconds / 60),
      durationSeconds: elapsed,
    });

    setReviewAttempt({
      ...attemptPayload,
      id: 'latest',
      completedAt: new Date().toISOString(),
    });
    setReviewFilter('all');
    setMode('review');
  };

  useEffect(() => {
    if (mode !== 'active' || quizPaused) return;
    if (secondsRemaining <= 0) {
      finalizeTest();
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, secondsRemaining, quizPaused]);

  // Prep Timer tick loop
  useEffect(() => {
    if (!prepRunning) return;
    const id = window.setInterval(() => {
      setPrepSeconds((prev) => {
        if (prepMode === 'countdown') {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [prepRunning, prepMode]);

  // Auto-log when countdown hits 00:00
  useEffect(() => {
    if (prepRunning && prepMode === 'countdown' && prepSeconds === 0 && !prepCompletionGuard.current) {
      prepCompletionGuard.current = true;
      setPrepRunning(false);
      const totalSec = Math.max(60, Math.round(prepTargetMinutes * 60));
      addInterviewPrepLog({
        category: prepTopic,
        focusNote: prepNote.trim() || 'Timed prep session',
        mode: 'countdown',
        targetMinutes: prepTargetMinutes,
        durationSeconds: totalSec,
      });
      setPrepSeconds(totalSec);
      window.setTimeout(() => {
        prepCompletionGuard.current = false;
      }, 200);
    }
  }, [prepRunning, prepMode, prepSeconds, prepTargetMinutes, prepTopic, prepNote, addInterviewPrepLog]);

  const prepElapsedSeconds = useMemo(() => {
    if (prepMode === 'stopwatch') return prepSeconds;
    const targetSec = Math.max(1, prepTargetMinutes) * 60;
    return Math.max(0, targetSec - prepSeconds);
  }, [prepMode, prepSeconds, prepTargetMinutes]);

  const handleSelectPrepMode = (nextMode: 'countdown' | 'stopwatch') => {
    if (prepRunning) return;
    setPrepMode(nextMode);
    setPrepSeconds(nextMode === 'countdown' ? Math.max(1, prepTargetMinutes) * 60 : 0);
  };

  const handleSetTargetMinutes = (minutes: number) => {
    const safe = Math.min(180, Math.max(1, Math.round(minutes || 1)));
    setPrepTargetMinutes(safe);
    if (!prepRunning && prepMode === 'countdown') {
      setPrepSeconds(safe * 60);
    }
  };

  const handleResetPrepTimer = () => {
    setPrepRunning(false);
    setPrepSeconds(prepMode === 'countdown' ? Math.max(1, prepTargetMinutes) * 60 : 0);
  };

  const handleFinishAndLogPrep = () => {
    if (prepElapsedSeconds <= 0) return;
    setPrepRunning(false);
    addInterviewPrepLog({
      category: prepTopic,
      focusNote: prepNote.trim() || (prepMode === 'countdown' ? 'Custom countdown prep' : 'Stopwatch prep'),
      mode: prepMode,
      targetMinutes: prepMode === 'countdown' ? prepTargetMinutes : null,
      durationSeconds: prepElapsedSeconds,
    });
    setPrepSeconds(prepMode === 'countdown' ? Math.max(1, prepTargetMinutes) * 60 : 0);
  };

  const totalPrepMinutesLogged = useMemo(() => {
    const totalSec = state.interviewPrepLogs.reduce((sum, item) => sum + item.durationSeconds, 0);
    return Math.round(totalSec / 60);
  }, [state.interviewPrepLogs]);

  if (mode === 'active' && quizQuestions.length > 0) {
    const currentQ = quizQuestions[currentIndex];
    const answeredCount = answers.filter((a) => a !== null).length;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {selectedCategory} · {currentQ.difficulty}
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
              Question {currentIndex + 1} of {quizQuestions.length} ({answeredCount} answered)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
                quizPaused
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                  : secondsRemaining <= 60
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'
                  : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              <Clock className="h-4 w-4" />
              {formatSeconds(secondsRemaining)}
              {quizPaused && <span className="ml-1 text-xs font-sans">Paused</span>}
            </div>
            <button
              type="button"
              onClick={() => setQuizPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              {quizPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {quizPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold leading-snug text-slate-900 dark:text-white">
            {currentQ.question}
          </h2>

          <div className="mt-5 space-y-3">
            {currentQ.options.map((opt, idx) => {
              const selected = answers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={quizPaused}
                  onClick={() => {
                    const next = [...answers];
                    next[currentIndex] = idx;
                    setAnswers(next);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50 ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold ${
                      selected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentIndex < quizQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(quizQuestions.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Finish & Review
              </button>
            )}
          </div>
        </div>

        {/* Question Palette */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Question Navigation
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quizQuestions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[idx] !== null;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 rounded-lg font-mono text-xs font-semibold tabular-nums transition-colors ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <ConfirmDialog
          open={confirmSubmitOpen}
          title="Submit interview practice test?"
          description={`You have answered ${answeredCount} out of ${quizQuestions.length} questions. Unanswered questions will be marked incorrect.`}
          confirmLabel="Submit Answers"
          onConfirm={finalizeTest}
          onCancel={() => setConfirmSubmitOpen(false)}
        />
      </div>
    );
  }

  if (mode === 'review' && reviewAttempt) {
    const incorrectCount = reviewAttempt.answers.filter(
      (a) => a.selectedIndex !== a.correctIndex
    ).length;
    const displayedAnswers =
      reviewFilter === 'incorrect'
        ? reviewAttempt.answers.filter((a) => a.selectedIndex !== a.correctIndex)
        : reviewAttempt.answers;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {reviewAttempt.category} · {reviewAttempt.difficulty}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              Test Results & Explanations
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
              {reviewAttempt.correctCount} correct out of {reviewAttempt.totalQuestions} · Completed in{' '}
              {formatSeconds(reviewAttempt.durationSeconds)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-3xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {reviewAttempt.scorePercent}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accuracy Score</p>
            </div>
            <button
              type="button"
              onClick={() => setMode('setup')}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              New Test
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Questions ({reviewAttempt.answers.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('incorrect')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                reviewFilter === 'incorrect'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Incorrect Only ({incorrectCount})
            </button>
          </div>
        </div>

        {displayedAnswers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              Perfect score! No incorrect answers to review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedAnswers.map((ans, idx) => {
              const isCorrect = ans.selectedIndex === ans.correctIndex;
              return (
                <div
                  key={ans.questionId + idx}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {idx + 1}. {ans.questionText}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                        isCorrect
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <p className="text-slate-600 dark:text-slate-400">
                      Your answer:{' '}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {ans.selectedIndex !== null ? ans.options[ans.selectedIndex] : 'Unanswered'}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-700 dark:text-emerald-400">
                        Correct answer:{' '}
                        <span className="font-semibold">{ans.options[ans.correctIndex]}</span>
                      </p>
                    )}
                    <p className="mt-2 rounded-lg bg-slate-50 p-3 text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                      <span className="font-semibold">Explanation: </span>
                      {ans.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const countdownProgress =
    prepMode === 'countdown' && prepTargetMinutes > 0
      ? Math.min(
          100,
          Math.round((prepElapsedSeconds / (prepTargetMinutes * 60)) * 100)
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Interview Arena
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Timed technical & aptitude practice across 11 core subjects, plus a customizable Interview Prep Timer.
        </p>
      </div>

      {/* Practice Quiz Setup & Practice History */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Quiz Setup */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Configure Practice Session
          </h2>

          <div className="mt-5">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Select Subject Category (11 Categories)
            </label>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {INTERVIEW_CATEGORIES.map((cat) => {
                const count = INTERVIEW_QUESTIONS.filter((q) => q.category === cat).length;
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/70 font-semibold text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="ml-2 font-mono text-xs text-slate-400 tabular-nums shrink-0">
                      {count} Qs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Difficulty Filter
              </label>
              <div className="mt-2 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Session Length
              </label>
              <div className="mt-2 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {([5, 10] as const).map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      questionCount === cnt
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customizable Quiz Timer */}
          <div className="mt-4 rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Quiz Timer Limit
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuizTimerMode('auto')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    quizTimerMode === 'auto'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Auto ({questionCount} min)
                </button>
                <button
                  type="button"
                  onClick={() => setQuizTimerMode('custom')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    quizTimerMode === 'custom'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            {quizTimerMode === 'custom' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[5, 10, 15, 25].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCustomQuizMinutes(m)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs font-medium tabular-nums transition-colors ${
                      customQuizMinutes === m
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={customQuizMinutes}
                    onChange={(e) => setCustomQuizMinutes(Number(e.target.value))}
                    aria-label="Custom quiz minutes"
                    className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-right font-mono text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white tabular-nums"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Randomized attempt · Matching pool: {availablePool.length} questions
            </p>
            <button
              type="button"
              onClick={startTest}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              <Play className="h-4 w-4" />
              Start Practice Test
            </button>
          </div>
        </div>

        {/* Practice History */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Practice History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quiz scores saved locally across sessions
              </p>
            </div>
            {state.interviewHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearHistoryOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          {state.interviewHistory.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No practice tests completed yet.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Start a session on the left to track your scores over time.
              </p>
            </div>
          ) : (
            <div className="mt-3 max-h-[460px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {state.interviewHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.category}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.difficulty} · {item.correctCount}/{item.totalQuestions} ·{' '}
                      {formatSeconds(item.durationSeconds)} ·{' '}
                      {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        item.scorePercent >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.scorePercent >= 40
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.scorePercent}%
                    </span>
                    {item.answers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewAttempt(item);
                          setReviewFilter('all');
                          setMode('review');
                        }}
                        className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customizable Interview Prep Timer + Timer History Log */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Timer Controls */}
        <section
          aria-label="Interview Prep Timer"
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Interview Prep Timer
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track mock interviews, system design, or topic drills and log elapsed time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                disabled={prepRunning}
                onClick={() => handleSelectPrepMode('countdown')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                  prepMode === 'countdown'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Countdown
              </button>
              <button
                type="button"
                disabled={prepRunning}
                onClick={() => handleSelectPrepMode('stopwatch')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                  prepMode === 'stopwatch'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Stopwatch
              </button>
            </div>
          </div>

          {/* Topic, Note & Custom Duration */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="prep-topic"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                Practice Topic
              </label>
              <select
                id="prep-topic"
                value={prepTopic}
                onChange={(e) => setPrepTopic(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {PREP_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="prep-note"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                Session Focus Note
              </label>
              <input
                id="prep-note"
                type="text"
                maxLength={80}
                value={prepNote}
                onChange={(e) => setPrepNote(e.target.value)}
                placeholder="e.g., Whiteboard DP problems & tradeoffs"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {prepMode === 'countdown' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Target Duration
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[5, 15, 25, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    disabled={prepRunning}
                    onClick={() => handleSetTargetMinutes(mins)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs font-medium tabular-nums transition-colors disabled:opacity-50 ${
                      prepTargetMinutes === mins
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                <div className="flex items-center gap-1.5 pl-1">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    disabled={prepRunning}
                    value={prepTargetMinutes}
                    onChange={(e) => handleSetTargetMinutes(Number(e.target.value))}
                    aria-label="Custom prep timer minutes"
                    className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-right font-mono text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white tabular-nums"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Readout & Controls */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {prepMode === 'countdown'
                    ? `Countdown (${prepTargetMinutes} min target)`
                    : 'Stopwatch Elapsed'}
                </p>
                <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatSeconds(prepSeconds)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPrepRunning((r) => !r)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  {prepRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {prepRunning ? 'Pause' : prepElapsedSeconds > 0 ? 'Resume' : 'Start Timer'}
                </button>
                <button
                  type="button"
                  onClick={handleResetPrepTimer}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  disabled={prepElapsedSeconds === 0}
                  onClick={handleFinishAndLogPrep}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70 transition-colors whitespace-nowrap"
                >
                  <Save className="h-4 w-4" />
                  Finish & Log
                </button>
              </div>
            </div>

            {prepMode === 'countdown' && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${countdownProgress}%` }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Prep Timer History Log */}
        <section
          aria-label="Prep Timer History Log"
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Prep Timer Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {state.interviewPrepLogs.length} sessions · {totalPrepMinutesLogged} min logged
              </p>
            </div>
            {state.interviewPrepLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearPrepLogsOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          {state.interviewPrepLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No timed prep sessions logged yet.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Start the Interview Prep Timer or finish a quiz to record duration here.
              </p>
            </div>
          ) : (
            <div className="mt-3 max-h-[340px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {state.interviewPrepLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {log.category}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {log.focusNote} ·{' '}
                      {log.mode === 'countdown'
                        ? `Countdown${log.targetMinutes ? ` (${log.targetMinutes}m)` : ''}`
                        : 'Stopwatch'}{' '}
                      · {new Date(log.completedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {formatSeconds(log.durationSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteInterviewPrepLog(log.id)}
                      aria-label="Delete timer log entry"
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmClearHistoryOpen}
        title="Clear interview practice history?"
        description="This removes all recorded test attempts and explanations from your local history."
        confirmLabel="Clear History"
        destructive
        onConfirm={() => {
          clearInterviewHistory();
          setConfirmClearHistoryOpen(false);
        }}
        onCancel={() => setConfirmClearHistoryOpen(false)}
      />

      <ConfirmDialog
        open={confirmClearPrepLogsOpen}
        title="Clear interview prep timer log?"
        description="This removes all logged prep timer durations from your local history."
        confirmLabel="Clear Timer Log"
        destructive
        onConfirm={() => {
          clearInterviewPrepLogs();
          setConfirmClearPrepLogsOpen(false);
        }}
        onCancel={() => setConfirmClearPrepLogsOpen(false)}
      />
    </div>
  );
}
