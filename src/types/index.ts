export type ThemeMode = 'light' | 'dark';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type SkillCategory =
  | 'Programming Languages'
  | 'Frontend'
  | 'Backend'
  | 'Databases'
  | 'Cloud & DevOps'
  | 'Data & AI'
  | 'CS Fundamentals'
  | 'Testing & QA'
  | 'Soft Skills';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type InterviewCategory =
  | 'Python'
  | 'Java'
  | 'JavaScript'
  | 'HTML and CSS'
  | 'SQL'
  | 'Data Structures and Algorithms'
  | 'DBMS'
  | 'Operating Systems'
  | 'Computer Networks'
  | 'Aptitude'
  | 'Logical Reasoning';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskCategory =
  | 'Learning'
  | 'Interview Prep'
  | 'Coding Practice'
  | 'Resume & Career'
  | 'Project';

export type ProgrammingLanguage = 'javascript' | 'python' | 'java' | 'c' | 'cpp';

export interface UserProfile {
  displayName: string;
  careerGoal: string;
  preferredCategory: string;
  dailyGoalHours: number;
  dailyGoalTasks: number;
  onboarded: boolean;
  createdAt: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  objectives: string[];
  estimatedHours: number;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  category: 'Software Engineering' | 'Data & AI' | 'Infrastructure & QA';
  overview: string;
  requiredSkills: string[];
  totalHours: number;
  topics: RoadmapTopic[];
}

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface InterviewAttemptAnswer {
  questionId: string;
  questionText: string;
  options: [string, string, string, string];
  selectedIndex: number | null;
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface InterviewAttempt {
  id: string;
  category: InterviewCategory;
  difficulty: Difficulty | 'All';
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  durationSeconds: number;
  completedAt: string;
  answers: InterviewAttemptAnswer[];
}

export interface InterviewPrepLogEntry {
  id: string;
  category: string;
  focusNote: string;
  mode: 'countdown' | 'stopwatch';
  targetMinutes: number | null;
  durationSeconds: number;
  completedAt: string;
}

export interface DailyMicroGoal {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
}

export type ResumeSectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'languages';

export type ResumeTemplateId = 'classic' | 'modern' | 'technical';

export type ResumeFontFamily = 'sans' | 'serif' | 'mono';

export interface ResumeEducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  details: string;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string;
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  techStack: string;
  link: string;
  description: string;
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeAchievementItem {
  id: string;
  title: string;
  description: string;
}

export interface ResumeLanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface ResumeDocument {
  id: string;
  title: string;
  updatedAt: string;
  template: ResumeTemplateId;
  fontFamily: ResumeFontFamily;
  accentColor: string;
  sectionOrder: ResumeSectionKey[];
  enabledSections: ResumeSectionKey[];
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  education: ResumeEducationItem[];
  experience: ResumeExperienceItem[];
  technicalSkills: string;
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  achievements: ResumeAchievementItem[];
  languages: ResumeLanguageItem[];
}

export interface TrackedSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillLevel;
  goal: string;
  completedTopics: number;
  totalTopics: number;
  hoursLogged: number;
  notes: string;
  lastPracticed: string;
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  problemId?: string;
  code: string;
  updatedAt: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  category: TaskCategory;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface StudySession {
  id: string;
  topic: string;
  durationMinutes: number;
  mode: 'focus' | 'manual';
  date: string;
  completedAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  targetPerWeek: number;
  completedDates: string[];
  createdAt: string;
}

export interface DailyActivityEntry {
  date: string;
  minutesStudied: number;
  tasksCompleted: number;
  topicsCompleted: number;
  interviewsTaken: number;
}

export interface AchievementUnlock {
  id: string;
  unlockedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'info';
  createdAt: string;
  read: boolean;
  route?: string;
}

export interface SkillPilotState {
  version: number;
  profile: UserProfile;
  roadmapProgress: Record<string, string[]>;
  activeRoadmapId: string;
  interviewHistory: InterviewAttempt[];
  interviewPrepLogs: InterviewPrepLogEntry[];
  resumes: ResumeDocument[];
  activeResumeId: string;
  skills: TrackedSkill[];
  snippets: CodeSnippet[];
  tasks: PlannerTask[];
  dailyMicroGoals: Record<string, DailyMicroGoal[]>;
  studySessions: StudySession[];
  habits: HabitItem[];
  activityLog: Record<string, DailyActivityEntry>;
  unlockedAchievements: AchievementUnlock[];
  notifications: AppNotification[];
}
