import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  CodeSnippet,
  DailyActivityEntry,
  DailyMicroGoal,
  HabitItem,
  InterviewAttempt,
  InterviewPrepLogEntry,
  PlannerTask,
  ResumeDocument,
  SkillPilotState,
  StudySession,
  TrackedSkill,
  UserProfile,
} from '../types';
import {
  clearAppStateOnly,
  createBlankResume,
  generateId,
  getDefaultState,
  getSampleWorkspaceState,
  getTodayISO,
  loadAppState,
  saveAppState,
} from '../storage/storage';
import { ACHIEVEMENTS } from '../data/achievements';
import { useToast } from './ToastContext';

interface AppDataContextValue {
  state: SkillPilotState;
  completeOnboarding: (opts: {
    displayName: string;
    careerGoal: string;
    preferredCategory: string;
    dailyGoalHours: number;
    useSampleData: boolean;
  }) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;

  // Roadmaps
  setActiveRoadmap: (roadmapId: string) => void;
  toggleRoadmapTopic: (roadmapId: string, topicId: string, estimatedHours?: number) => void;
  resetRoadmapProgress: (roadmapId: string) => void;

  // Interviews
  recordInterviewAttempt: (attempt: Omit<InterviewAttempt, 'id' | 'completedAt'>) => void;
  clearInterviewHistory: () => void;
  addInterviewPrepLog: (entry: Omit<InterviewPrepLogEntry, 'id' | 'completedAt'>) => void;
  deleteInterviewPrepLog: (logId: string) => void;
  clearInterviewPrepLogs: () => void;

  // Daily Goals (3 micro-tasks per day)
  updateDailyMicroGoal: (
    date: string,
    index: number,
    patch: { title?: string; completed?: boolean }
  ) => void;
  resetDailyMicroGoals: (date: string) => void;

  // Resumes
  setActiveResume: (resumeId: string) => void;
  createResume: (title?: string, fromSample?: boolean) => ResumeDocument;
  updateResume: (resume: ResumeDocument) => void;
  deleteResume: (resumeId: string) => void;

  // Skills
  addSkill: (skill: Omit<TrackedSkill, 'id' | 'createdAt'>) => void;
  updateSkill: (skill: TrackedSkill) => void;
  deleteSkill: (skillId: string) => void;

  // Coding Playground
  saveSnippet: (snippet: Omit<CodeSnippet, 'id' | 'updatedAt'> & { id?: string }) => CodeSnippet;
  deleteSnippet: (snippetId: string) => void;

  // Planner Tasks, Study Sessions, Habits
  addTask: (task: Omit<PlannerTask, 'id' | 'completed' | 'completedAt' | 'createdAt'>) => void;
  updateTask: (task: PlannerTask) => void;
  toggleTaskComplete: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  logStudySession: (session: Omit<StudySession, 'id' | 'completedAt'>) => void;
  addHabit: (title: string, targetPerWeek: number) => void;
  toggleHabitDate: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;

  // Notifications & Data Management
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  importFullState: (nextState: SkillPilotState) => void;
  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

function appendDailyActivity(
  log: Record<string, DailyActivityEntry>,
  date: string,
  delta: Partial<Omit<DailyActivityEntry, 'date'>>
): Record<string, DailyActivityEntry> {
  const existing = log[date] || {
    date,
    minutesStudied: 0,
    tasksCompleted: 0,
    topicsCompleted: 0,
    interviewsTaken: 0,
  };
  return {
    ...log,
    [date]: {
      date,
      minutesStudied: Math.max(0, existing.minutesStudied + (delta.minutesStudied || 0)),
      tasksCompleted: Math.max(0, existing.tasksCompleted + (delta.tasksCompleted || 0)),
      topicsCompleted: Math.max(0, existing.topicsCompleted + (delta.topicsCompleted || 0)),
      interviewsTaken: Math.max(0, existing.interviewsTaken + (delta.interviewsTaken || 0)),
    },
  };
}

function evaluateAchievements(nextState: SkillPilotState): {
  stateWithBadges: SkillPilotState;
  newlyUnlockedTitles: string[];
} {
  const alreadyUnlocked = new Set(nextState.unlockedAchievements.map((a) => a.id));
  const newlyUnlocked = [...nextState.unlockedAchievements];
  const newNotifications = [...nextState.notifications];
  const newlyUnlockedTitles: string[] = [];

  for (const def of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(def.id)) continue;
    const { current, target } = def.getProgress(nextState);
    if (current >= target) {
      const now = new Date().toISOString();
      newlyUnlocked.push({ id: def.id, unlockedAt: now });
      newlyUnlockedTitles.push(def.title);
      newNotifications.unshift({
        id: generateId('ntf'),
        title: `Achievement Unlocked: ${def.title}`,
        message: `${def.description} (+${def.points} pts)`,
        type: 'achievement',
        createdAt: now,
        read: false,
        route: '/achievements',
      });
    }
  }

  if (newlyUnlockedTitles.length === 0) {
    return { stateWithBadges: nextState, newlyUnlockedTitles: [] };
  }

  return {
    stateWithBadges: {
      ...nextState,
      unlockedAchievements: newlyUnlocked,
      notifications: newNotifications.slice(0, 30),
    },
    newlyUnlockedTitles,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SkillPilotState>(() => loadAppState());
  const { showToast } = useToast();

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const applyMutation = useCallback(
    (updater: (prev: SkillPilotState) => SkillPilotState) => {
      setState((prev) => {
        const updated = updater(prev);
        const { stateWithBadges, newlyUnlockedTitles } = evaluateAchievements(updated);
        if (newlyUnlockedTitles.length > 0) {
          window.setTimeout(() => {
            showToast(`Achievement unlocked: ${newlyUnlockedTitles[0]}`, 'success');
          }, 50);
        }
        return stateWithBadges;
      });
    },
    [showToast]
  );

  const completeOnboarding: AppDataContextValue['completeOnboarding'] = ({
    displayName,
    careerGoal,
    preferredCategory,
    dailyGoalHours,
    useSampleData,
  }) => {
    if (useSampleData) {
      const sample = getSampleWorkspaceState(displayName, careerGoal);
      sample.profile.preferredCategory = preferredCategory;
      sample.profile.dailyGoalHours = dailyGoalHours;
      const { stateWithBadges } = evaluateAchievements(sample);
      setState(stateWithBadges);
      showToast('Sample workspace loaded locally. Ready to explore!', 'success');
      return;
    }

    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        displayName: displayName.trim() || 'Learner',
        careerGoal,
        preferredCategory,
        dailyGoalHours,
        onboarded: true,
      },
    }));
    showToast('Workspace personalized and saved locally.', 'success');
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    applyMutation((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const setActiveRoadmap = (roadmapId: string) => {
    applyMutation((prev) => ({ ...prev, activeRoadmapId: roadmapId }));
  };

  const toggleRoadmapTopic = (roadmapId: string, topicId: string, estimatedHours = 1) => {
    const today = getTodayISO();
    applyMutation((prev) => {
      const current = prev.roadmapProgress[roadmapId] || [];
      const exists = current.includes(topicId);
      const nextList = exists ? current.filter((id) => id !== topicId) : [...current, topicId];
      const deltaMinutes = exists ? 0 : Math.min(60, Math.round(estimatedHours * 15));

      return {
        ...prev,
        activeRoadmapId: roadmapId,
        roadmapProgress: {
          ...prev.roadmapProgress,
          [roadmapId]: nextList,
        },
        activityLog: exists
          ? prev.activityLog
          : appendDailyActivity(prev.activityLog, today, {
              topicsCompleted: 1,
              minutesStudied: deltaMinutes,
            }),
      };
    });
  };

  const resetRoadmapProgress = (roadmapId: string) => {
    applyMutation((prev) => ({
      ...prev,
      roadmapProgress: {
        ...prev.roadmapProgress,
        [roadmapId]: [],
      },
    }));
    showToast('Roadmap progress reset.', 'info');
  };

  const recordInterviewAttempt: AppDataContextValue['recordInterviewAttempt'] = (attempt) => {
    const today = getTodayISO();
    const record: InterviewAttempt = {
      ...attempt,
      id: generateId('int'),
      completedAt: new Date().toISOString(),
    };
    const minutes = Math.max(2, Math.round(attempt.durationSeconds / 60));

    applyMutation((prev) => ({
      ...prev,
      interviewHistory: [record, ...prev.interviewHistory],
      activityLog: appendDailyActivity(prev.activityLog, today, {
        interviewsTaken: 1,
        minutesStudied: minutes,
      }),
    }));
  };

  const clearInterviewHistory = () => {
    applyMutation((prev) => ({ ...prev, interviewHistory: [] }));
    showToast('Interview practice history cleared.', 'info');
  };

  const addInterviewPrepLog: AppDataContextValue['addInterviewPrepLog'] = (entry) => {
    const today = getTodayISO();
    const record: InterviewPrepLogEntry = {
      ...entry,
      id: generateId('plg'),
      completedAt: new Date().toISOString(),
    };
    const minutes = Math.max(1, Math.round(entry.durationSeconds / 60));

    applyMutation((prev) => ({
      ...prev,
      interviewPrepLogs: [record, ...prev.interviewPrepLogs],
      activityLog: appendDailyActivity(prev.activityLog, today, {
        minutesStudied: minutes,
      }),
    }));
    showToast(`Logged ${minutes} min prep session.`, 'success');
  };

  const deleteInterviewPrepLog = (logId: string) => {
    applyMutation((prev) => ({
      ...prev,
      interviewPrepLogs: prev.interviewPrepLogs.filter((l) => l.id !== logId),
    }));
  };

  const clearInterviewPrepLogs = () => {
    applyMutation((prev) => ({ ...prev, interviewPrepLogs: [] }));
    showToast('Interview prep timer history cleared.', 'info');
  };

  const updateDailyMicroGoal: AppDataContextValue['updateDailyMicroGoal'] = (
    date,
    index,
    patch
  ) => {
    if (index < 0 || index > 2) return;
    applyMutation((prev) => {
      const existingList = prev.dailyMicroGoals[date] || [];
      const slots: DailyMicroGoal[] = [0, 1, 2].map((i) => {
        const found = existingList[i];
        return (
          found || {
            id: `goal-${i + 1}`,
            title: '',
            completed: false,
            updatedAt: new Date().toISOString(),
          }
        );
      });

      const currentSlot = slots[index];
      const nextCompleted =
        patch.completed !== undefined ? patch.completed : currentSlot.completed;
      const nextTitle = patch.title !== undefined ? patch.title : currentSlot.title;
      const toggledDone = patch.completed !== undefined && patch.completed !== currentSlot.completed;

      slots[index] = {
        ...currentSlot,
        title: nextTitle,
        completed: nextTitle.trim() ? nextCompleted : false,
        updatedAt: new Date().toISOString(),
      };

      const nextActivityLog = toggledDone
        ? appendDailyActivity(prev.activityLog, date, {
            tasksCompleted: nextCompleted ? 1 : -1,
          })
        : prev.activityLog;

      return {
        ...prev,
        dailyMicroGoals: {
          ...prev.dailyMicroGoals,
          [date]: slots,
        },
        activityLog: nextActivityLog,
      };
    });
  };

  const resetDailyMicroGoals = (date: string) => {
    applyMutation((prev) => ({
      ...prev,
      dailyMicroGoals: {
        ...prev.dailyMicroGoals,
        [date]: [0, 1, 2].map((i) => ({
          id: `goal-${i + 1}`,
          title: '',
          completed: false,
          updatedAt: new Date().toISOString(),
        })),
      },
    }));
    showToast('Today’s 3 daily goals cleared.', 'info');
  };

  const setActiveResume = (resumeId: string) => {
    applyMutation((prev) => ({ ...prev, activeResumeId: resumeId }));
  };

  const createResume = (title = 'Untitled Resume', fromSample = false): ResumeDocument => {
    const doc = createBlankResume(title);
    if (fromSample) {
      const sample = getSampleWorkspaceState(state.profile.displayName, state.profile.careerGoal).resumes[0];
      doc.personal = { ...sample.personal };
      doc.summary = sample.summary;
      doc.education = sample.education;
      doc.experience = sample.experience;
      doc.technicalSkills = sample.technicalSkills;
      doc.projects = sample.projects;
      doc.certifications = sample.certifications;
      doc.achievements = sample.achievements;
      doc.languages = sample.languages;
      doc.enabledSections = sample.enabledSections;
    }

    applyMutation((prev) => ({
      ...prev,
      resumes: [doc, ...prev.resumes],
      activeResumeId: doc.id,
    }));
    return doc;
  };

  const updateResume = (resume: ResumeDocument) => {
    const updated = { ...resume, updatedAt: new Date().toISOString() };
    applyMutation((prev) => ({
      ...prev,
      resumes: prev.resumes.map((r) => (r.id === updated.id ? updated : r)),
    }));
  };

  const deleteResume = (resumeId: string) => {
    applyMutation((prev) => {
      const remaining = prev.resumes.filter((r) => r.id !== resumeId);
      const nextResumes = remaining.length > 0 ? remaining : [createBlankResume('My Primary Resume')];
      const nextActive =
        prev.activeResumeId === resumeId ? nextResumes[0].id : prev.activeResumeId;
      return {
        ...prev,
        resumes: nextResumes,
        activeResumeId: nextActive,
      };
    });
    showToast('Resume removed.', 'info');
  };

  const addSkill: AppDataContextValue['addSkill'] = (skill) => {
    const item: TrackedSkill = {
      ...skill,
      id: generateId('skl'),
      createdAt: new Date().toISOString(),
    };
    const today = getTodayISO();
    applyMutation((prev) => ({
      ...prev,
      skills: [item, ...prev.skills],
      activityLog:
        skill.hoursLogged > 0
          ? appendDailyActivity(prev.activityLog, today, {
              minutesStudied: Math.round(skill.hoursLogged * 60),
            })
          : prev.activityLog,
    }));
    showToast(`Added skill "${skill.name}".`, 'success');
  };

  const updateSkill = (skill: TrackedSkill) => {
    applyMutation((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === skill.id ? skill : s)),
    }));
    showToast(`Updated "${skill.name}".`, 'success');
  };

  const deleteSkill = (skillId: string) => {
    applyMutation((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== skillId),
    }));
    showToast('Skill deleted.', 'info');
  };

  const saveSnippet: AppDataContextValue['saveSnippet'] = (snippetInput) => {
    const saved: CodeSnippet = {
      id: snippetInput.id || generateId('snp'),
      title: snippetInput.title,
      language: snippetInput.language,
      problemId: snippetInput.problemId,
      code: snippetInput.code,
      updatedAt: new Date().toISOString(),
    };
    applyMutation((prev) => {
      const exists = prev.snippets.some((s) => s.id === saved.id);
      return {
        ...prev,
        snippets: exists
          ? prev.snippets.map((s) => (s.id === saved.id ? saved : s))
          : [saved, ...prev.snippets],
      };
    });
    showToast(`Saved snippet "${saved.title}".`, 'success');
    return saved;
  };

  const deleteSnippet = (snippetId: string) => {
    applyMutation((prev) => ({
      ...prev,
      snippets: prev.snippets.filter((s) => s.id !== snippetId),
    }));
    showToast('Snippet deleted.', 'info');
  };

  const addTask: AppDataContextValue['addTask'] = (task) => {
    const item: PlannerTask = {
      ...task,
      id: generateId('tsk'),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    applyMutation((prev) => ({
      ...prev,
      tasks: [item, ...prev.tasks],
    }));
    showToast('Task added to Growth Planner.', 'success');
  };

  const updateTask = (task: PlannerTask) => {
    applyMutation((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
    showToast('Task updated.', 'success');
  };

  const toggleTaskComplete = (taskId: string) => {
    const today = getTodayISO();
    applyMutation((prev) => {
      const target = prev.tasks.find((t) => t.id === taskId);
      if (!target) return prev;
      const nextCompleted = !target.completed;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : null,
              }
            : t
        ),
        activityLog: nextCompleted
          ? appendDailyActivity(prev.activityLog, today, { tasksCompleted: 1 })
          : prev.activityLog,
      };
    });
  };

  const deleteTask = (taskId: string) => {
    applyMutation((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    showToast('Task deleted.', 'info');
  };

  const logStudySession: AppDataContextValue['logStudySession'] = (session) => {
    const item: StudySession = {
      ...session,
      id: generateId('ses'),
      completedAt: new Date().toISOString(),
    };
    applyMutation((prev) => ({
      ...prev,
      studySessions: [item, ...prev.studySessions],
      activityLog: appendDailyActivity(prev.activityLog, session.date, {
        minutesStudied: session.durationMinutes,
      }),
    }));
    showToast(`Logged ${session.durationMinutes} min study session.`, 'success');
  };

  const addHabit = (title: string, targetPerWeek: number) => {
    const item: HabitItem = {
      id: generateId('hab'),
      title: title.trim(),
      targetPerWeek,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    applyMutation((prev) => ({
      ...prev,
      habits: [...prev.habits, item],
    }));
    showToast('Habit added.', 'success');
  };

  const toggleHabitDate = (habitId: string, date: string) => {
    applyMutation((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const has = h.completedDates.includes(date);
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date],
        };
      }),
    }));
  };

  const deleteHabit = (habitId: string) => {
    applyMutation((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const importFullState = (nextState: SkillPilotState) => {
    const { stateWithBadges } = evaluateAchievements(nextState);
    setState(stateWithBadges);
    saveAppState(stateWithBadges);
    showToast('Backup imported and restored successfully.', 'success');
  };

  const resetAllData = () => {
    clearAppStateOnly();
    const fresh = getDefaultState();
    setState(fresh);
    saveAppState(fresh);
    showToast('SkillPilot data cleared. Returned to onboarding.', 'info');
  };

  return (
    <AppDataContext.Provider
      value={{
        state,
        completeOnboarding,
        updateProfile,
        setActiveRoadmap,
        toggleRoadmapTopic,
        resetRoadmapProgress,
        recordInterviewAttempt,
        clearInterviewHistory,
        addInterviewPrepLog,
        deleteInterviewPrepLog,
        clearInterviewPrepLogs,
        updateDailyMicroGoal,
        resetDailyMicroGoals,
        setActiveResume,
        createResume,
        updateResume,
        deleteResume,
        addSkill,
        updateSkill,
        deleteSkill,
        saveSnippet,
        deleteSnippet,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        logStudySession,
        addHabit,
        toggleHabitDate,
        deleteHabit,
        markAllNotificationsRead,
        markNotificationRead,
        importFullState,
        resetAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
