import {
  DailyActivityEntry,
  ResumeDocument,
  SkillPilotState,
  ThemeMode,
} from '../types';

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'skillpilot_state_v1';
export const THEME_KEY = 'skillpilot_theme_v1';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateISO(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlankResume(title = 'Software Developer Resume'): ResumeDocument {
  return {
    id: generateId('res'),
    title,
    updatedAt: new Date().toISOString(),
    template: 'modern',
    fontFamily: 'sans',
    accentColor: '#4F46E5',
    sectionOrder: [
      'summary',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
      'achievements',
      'languages',
    ],
    enabledSections: ['summary', 'experience', 'projects', 'skills', 'education'],
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      website: '',
    },
    summary: '',
    education: [],
    experience: [],
    technicalSkills: '',
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  };
}

export function createSampleResume(): ResumeDocument {
  return {
    id: generateId('res'),
    title: 'Full Stack Engineer (Sample)',
    updatedAt: new Date().toISOString(),
    template: 'modern',
    fontFamily: 'sans',
    accentColor: '#4F46E5',
    sectionOrder: [
      'summary',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
      'achievements',
      'languages',
    ],
    enabledSections: [
      'summary',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
      'achievements',
      'languages',
    ],
    personal: {
      fullName: 'Aarav Mehta',
      headline: 'Full Stack Software Engineer',
      email: 'aarav.mehta@example.com',
      phone: '+1 (555) 234-8910',
      location: 'Austin, TX',
      website: 'github.com/aaravmehta',
    },
    summary:
      'Product-minded software engineer with 2+ years of experience building React, TypeScript, and Node.js web applications. Focused on accessible UI architecture, clean API design, and automated test coverage.',
    education: [
      {
        id: generateId('edu'),
        institution: 'State University of Technology',
        degree: 'B.S. in Computer Science',
        period: '2020 – 2024',
        details: 'GPA: 3.8/4.0 · Coursework: Data Structures, Databases, Operating Systems',
      },
    ],
    experience: [
      {
        id: generateId('exp'),
        company: 'Northstar Systems',
        role: 'Software Engineer',
        period: 'Jun 2024 – Present',
        location: 'Remote',
        bullets:
          'Built modular TypeScript dashboard components reducing bundle size by 22%.\nDesigned REST endpoints with PostgreSQL indexing, cutting P95 query latency from 420ms to 95ms.\nMaintained 90% unit and integration test coverage across core billing workflows.',
      },
      {
        id: generateId('exp'),
        company: 'CloudBridge Labs',
        role: 'Software Engineering Intern',
        period: 'May 2023 – Aug 2023',
        location: 'Austin, TX',
        bullets:
          'Developed internal analytics views using React and Recharts for customer support teams.\nAutomated CI validation checks, preventing 15+ regression bugs before release.',
      },
    ],
    technicalSkills:
      'TypeScript, JavaScript, Python, React, Node.js, Express, PostgreSQL, SQL, Tailwind CSS, Docker, Git, REST APIs',
    projects: [
      {
        id: generateId('prj'),
        name: 'TrackFlow Issue Board',
        techStack: 'React, TypeScript, IndexedDB, Tailwind CSS',
        link: 'github.com/aaravmehta/trackflow',
        description:
          'Offline-capable project planner featuring keyboard shortcuts, sprint burndown charts, and JSON workspace export.',
      },
    ],
    certifications: [
      {
        id: generateId('crt'),
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2025',
      },
    ],
    achievements: [
      {
        id: generateId('ach'),
        title: 'University Hackathon Finalist',
        description: 'Placed top 3 out of 60 teams for building an accessible transit route planner.',
      },
    ],
    languages: [
      { id: generateId('lng'), name: 'English', proficiency: 'Native / Fluent' },
      { id: generateId('lng'), name: 'Hindi', proficiency: 'Native / Fluent' },
    ],
  };
}

export function getDefaultState(): SkillPilotState {
  const initialResume = createBlankResume('My Primary Resume');
  return {
    version: STORAGE_VERSION,
    profile: {
      displayName: '',
      careerGoal: 'Full Stack Developer',
      preferredCategory: 'JavaScript',
      dailyGoalHours: 2,
      dailyGoalTasks: 3,
      onboarded: false,
      createdAt: new Date().toISOString(),
    },
    roadmapProgress: {},
    activeRoadmapId: 'fullstack-developer',
    interviewHistory: [],
    interviewPrepLogs: [],
    resumes: [initialResume],
    activeResumeId: initialResume.id,
    skills: [],
    snippets: [],
    tasks: [],
    dailyMicroGoals: {},
    studySessions: [],
    habits: [
      {
        id: generateId('hab'),
        title: 'Practice 1 coding challenge',
        targetPerWeek: 5,
        completedDates: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('hab'),
        title: 'Complete 1 roadmap topic',
        targetPerWeek: 4,
        completedDates: [],
        createdAt: new Date().toISOString(),
      },
    ],
    activityLog: {},
    unlockedAchievements: [],
    notifications: [
      {
        id: generateId('ntf'),
        title: 'Welcome to SkillPilot',
        message: 'Everything saves locally in your browser. Export backups regularly in Settings.',
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false,
        route: '/settings',
      },
    ],
  };
}

export function getSampleWorkspaceState(displayName: string, careerGoal: string): SkillPilotState {
  const today = getTodayISO();
  const sampleResume = createSampleResume();
  if (displayName.trim()) {
    sampleResume.personal.fullName = displayName.trim();
  }

  const activityLog: Record<string, DailyActivityEntry> = {
    [getOffsetDateISO(-4)]: { date: getOffsetDateISO(-4), minutesStudied: 65, tasksCompleted: 2, topicsCompleted: 1, interviewsTaken: 0 },
    [getOffsetDateISO(-3)]: { date: getOffsetDateISO(-3), minutesStudied: 90, tasksCompleted: 3, topicsCompleted: 1, interviewsTaken: 1 },
    [getOffsetDateISO(-2)]: { date: getOffsetDateISO(-2), minutesStudied: 50, tasksCompleted: 1, topicsCompleted: 1, interviewsTaken: 0 },
    [getOffsetDateISO(-1)]: { date: getOffsetDateISO(-1), minutesStudied: 110, tasksCompleted: 2, topicsCompleted: 2, interviewsTaken: 1 },
    [today]: { date: today, minutesStudied: 45, tasksCompleted: 1, topicsCompleted: 1, interviewsTaken: 0 },
  };

  return {
    version: STORAGE_VERSION,
    profile: {
      displayName: displayName.trim() || 'Alex Rivera',
      careerGoal: careerGoal || 'Full Stack Developer',
      preferredCategory: 'JavaScript',
      dailyGoalHours: 2,
      dailyGoalTasks: 3,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    roadmapProgress: {
      'fullstack-developer': ['fs-1', 'fs-2', 'fs-3'],
      'frontend-developer': ['fe-1', 'fe-2'],
    },
    activeRoadmapId: 'fullstack-developer',
    interviewHistory: [
      {
        id: generateId('int'),
        category: 'JavaScript',
        difficulty: 'Medium',
        totalQuestions: 5,
        correctCount: 4,
        scorePercent: 80,
        durationSeconds: 185,
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        answers: [],
      },
      {
        id: generateId('int'),
        category: 'Data Structures and Algorithms',
        difficulty: 'Medium',
        totalQuestions: 5,
        correctCount: 4,
        scorePercent: 80,
        durationSeconds: 210,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        answers: [],
      },
    ],
    interviewPrepLogs: [
      {
        id: generateId('plg'),
        category: 'Data Structures and Algorithms',
        focusNote: 'Binary trees & recursion dry-run',
        mode: 'countdown',
        targetMinutes: 25,
        durationSeconds: 1500,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: generateId('plg'),
        category: 'JavaScript',
        focusNote: 'Event loop & closure mock questions',
        mode: 'stopwatch',
        targetMinutes: null,
        durationSeconds: 740,
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    resumes: [sampleResume],
    activeResumeId: sampleResume.id,
    skills: [
      {
        id: generateId('skl'),
        name: 'TypeScript',
        category: 'Programming Languages',
        proficiency: 'Intermediate',
        goal: 'Master generic utility types and strict compiler configs',
        completedTopics: 7,
        totalTopics: 10,
        hoursLogged: 24,
        notes: 'Practicing discriminated unions and API response typing.',
        lastPracticed: getOffsetDateISO(-1),
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
      {
        id: generateId('skl'),
        name: 'React & Hooks',
        category: 'Frontend',
        proficiency: 'Advanced',
        goal: 'Build accessible compound components and performance profiling',
        completedTopics: 9,
        totalTopics: 10,
        hoursLogged: 38,
        notes: 'Focus on memoization boundaries and state architecture.',
        lastPracticed: today,
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
      },
      {
        id: generateId('skl'),
        name: 'SQL & Indexing',
        category: 'Databases',
        proficiency: 'Intermediate',
        goal: 'Query plan analysis and window functions',
        completedTopics: 5,
        totalTopics: 8,
        hoursLogged: 14,
        notes: 'Working through composite indexes and EXPLAIN plans.',
        lastPracticed: getOffsetDateISO(-2),
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
    ],
    snippets: [
      {
        id: generateId('snp'),
        title: 'Two Sum Hash Map',
        language: 'javascript',
        problemId: 'two-sum',
        code: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
        updatedAt: new Date().toISOString(),
      },
    ],
    tasks: [
      {
        id: generateId('tsk'),
        title: 'Complete REST API authentication roadmap module',
        description: 'Review stateless session patterns and HTTP status semantics.',
        priority: 'High',
        dueDate: today,
        category: 'Learning',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('tsk'),
        title: 'Take 10-question SQL interview practice test',
        description: 'Focus on JOINs, GROUP BY, and normalization questions.',
        priority: 'Medium',
        dueDate: today,
        category: 'Interview Prep',
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('tsk'),
        title: 'Refine Resume Studio project bullet metrics',
        description: 'Quantify latency and test coverage improvements before export.',
        priority: 'Low',
        dueDate: getOffsetDateISO(2),
        category: 'Resume & Career',
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    dailyMicroGoals: {
      [today]: [
        {
          id: 'goal-1',
          title: 'Review 15 JavaScript interview flashcards',
          completed: true,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          title: 'Solve 1 medium array coding challenge',
          completed: false,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'goal-3',
          title: 'Update resume project impact metrics',
          completed: false,
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    studySessions: [
      {
        id: generateId('ses'),
        topic: 'TypeScript Generics & Roadmap Review',
        durationMinutes: 45,
        mode: 'focus',
        date: today,
        completedAt: new Date().toISOString(),
      },
    ],
    habits: [
      {
        id: generateId('hab'),
        title: 'Practice 1 coding challenge',
        targetPerWeek: 5,
        completedDates: [getOffsetDateISO(-3), getOffsetDateISO(-1), today],
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('hab'),
        title: 'Review 10 interview questions',
        targetPerWeek: 4,
        completedDates: [getOffsetDateISO(-2), getOffsetDateISO(-1)],
        createdAt: new Date().toISOString(),
      },
    ],
    activityLog,
    unlockedAchievements: [
      { id: 'first-task', unlockedAt: new Date().toISOString() },
      { id: 'five-day-streak', unlockedAt: new Date().toISOString() },
    ],
    notifications: [
      {
        id: generateId('ntf'),
        title: '5-Day Learning Streak Unlocked',
        message: 'You reached a 5-day continuous learning streak.',
        type: 'achievement',
        createdAt: new Date().toISOString(),
        read: false,
        route: '/achievements',
      },
    ],
  };
}

export function loadAppState(): SkillPilotState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const validation = validateImportedState(parsed);
    if (!validation.valid || !validation.data) {
      return getDefaultState();
    }
    return validation.data;
  } catch {
    return getDefaultState();
  }
}

export function saveAppState(state: SkillPilotState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearAppStateOnly(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage quota errors
  }
}

export function validateImportedState(raw: unknown): {
  valid: boolean;
  error?: string;
  data?: SkillPilotState;
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Invalid backup format: expected a JSON object.' };
  }

  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== 'number') {
    return { valid: false, error: 'Missing or invalid schema version number.' };
  }
  if (obj.version > STORAGE_VERSION) {
    return {
      valid: false,
      error: `Backup version (${obj.version}) is newer than supported version (${STORAGE_VERSION}).`,
    };
  }
  if (!obj.profile || typeof obj.profile !== 'object') {
    return { valid: false, error: 'Backup is missing profile configuration.' };
  }
  if (!Array.isArray(obj.resumes) || !Array.isArray(obj.skills) || !Array.isArray(obj.tasks)) {
    return { valid: false, error: 'Backup is missing required arrays (resumes, skills, or tasks).' };
  }
  if (typeof obj.roadmapProgress !== 'object' || obj.roadmapProgress === null) {
    return { valid: false, error: 'Backup is missing roadmap progress records.' };
  }

  const defaults = getDefaultState();
  const normalized: SkillPilotState = {
    ...defaults,
    ...(obj as Partial<SkillPilotState>),
    version: STORAGE_VERSION,
    profile: {
      ...defaults.profile,
      ...(obj.profile as Partial<SkillPilotState['profile']>),
    },
    interviewHistory: Array.isArray(obj.interviewHistory) ? obj.interviewHistory : [],
    interviewPrepLogs: Array.isArray(obj.interviewPrepLogs) ? obj.interviewPrepLogs : [],
    snippets: Array.isArray(obj.snippets) ? obj.snippets : [],
    dailyMicroGoals:
      obj.dailyMicroGoals && typeof obj.dailyMicroGoals === 'object' && !Array.isArray(obj.dailyMicroGoals)
        ? (obj.dailyMicroGoals as SkillPilotState['dailyMicroGoals'])
        : {},
    studySessions: Array.isArray(obj.studySessions) ? obj.studySessions : [],
    habits: Array.isArray(obj.habits) ? obj.habits : defaults.habits,
    activityLog:
      obj.activityLog && typeof obj.activityLog === 'object'
        ? (obj.activityLog as SkillPilotState['activityLog'])
        : {},
    unlockedAchievements: Array.isArray(obj.unlockedAchievements) ? obj.unlockedAchievements : [],
    notifications: Array.isArray(obj.notifications) ? obj.notifications : [],
  };

  return { valid: true, data: normalized };
}

export function computeLearningStreak(activityLog: Record<string, DailyActivityEntry>): number {
  const isActive = (entry?: DailyActivityEntry) =>
    !!entry &&
    (entry.minutesStudied > 0 ||
      entry.tasksCompleted > 0 ||
      entry.topicsCompleted > 0 ||
      entry.interviewsTaken > 0);

  let streak = 0;
  const today = getTodayISO();
  const startOffset = isActive(activityLog[today]) ? 0 : -1;

  for (let i = startOffset; i >= -365; i--) {
    const key = getOffsetDateISO(i);
    if (isActive(activityLog[key])) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function downloadWorkspaceBackupJSON(state: SkillPilotState): void {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `skillpilot-backup-${getTodayISO()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

