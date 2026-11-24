import { SkillPilotState } from '../types';
import { CAREER_ROADMAPS } from '../data/roadmaps';
import { calculateTotalLearningHours } from '../data/achievements';
import { computeLearningStreak, getOffsetDateISO, getTodayISO } from '../storage/storage';

export interface DashboardMetrics {
  careerReadinessScore: number;
  totalLearningHours: number;
  skillsCompletedCount: number;
  totalSkillsCount: number;
  interviewAverageScore: number | null;
  currentStreak: number;
  weeklyProductivityPercent: number;
  todayMinutes: number;
}

export function computeDashboardMetrics(state: SkillPilotState): DashboardMetrics {
  const activeRoadmap =
    CAREER_ROADMAPS.find((r) => r.id === state.activeRoadmapId) || CAREER_ROADMAPS[0];
  const completedInActive = state.roadmapProgress[activeRoadmap.id] || [];
  const roadmapRatio =
    activeRoadmap.topics.length > 0
      ? Math.min(1, completedInActive.length / activeRoadmap.topics.length)
      : 0;

  const totalSkillsCount = state.skills.length;
  const skillsCompletedCount = state.skills.filter(
    (s) => s.proficiency === 'Advanced' || s.proficiency === 'Expert' || s.completedTopics >= s.totalTopics
  ).length;
  const completedTopicsTotal = Object.values(state.roadmapProgress).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const skillPoints = state.skills.reduce((sum, s) => {
    const map = { Beginner: 0.3, Intermediate: 0.6, Advanced: 0.85, Expert: 1 };
    return sum + map[s.proficiency];
  }, 0);
  const skillRatio = totalSkillsCount > 0 ? Math.min(1, skillPoints / Math.max(5, totalSkillsCount)) : 0;

  const interviewCount = state.interviewHistory.length;
  const interviewAverageScore =
    interviewCount > 0
      ? Math.round(
          state.interviewHistory.reduce((acc, item) => acc + item.scorePercent, 0) / interviewCount
        )
      : null;
  const interviewRatio = interviewAverageScore !== null ? interviewAverageScore / 100 : 0;

  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const totalTasks = state.tasks.length;
  const taskRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const hasAnyActivity =
    completedTopicsTotal > 0 || totalSkillsCount > 0 || interviewCount > 0 || completedTasks > 0;

  const careerReadinessScore = hasAnyActivity
    ? Math.min(
        100,
        Math.round(
          roadmapRatio * 35 + skillRatio * 25 + interviewRatio * 25 + taskRatio * 15
        )
      )
    : 0;

  const totalLearningHours = calculateTotalLearningHours(state);
  const currentStreak = computeLearningStreak(state.activityLog);

  // Weekly productivity: combination of hours logged last 7 days vs 7 * dailyGoalHours and task completion
  let weeklyMinutes = 0;
  let weeklyTasksDone = 0;
  for (let i = 0; i < 7; i++) {
    const entry = state.activityLog[getOffsetDateISO(-i)];
    if (entry) {
      weeklyMinutes += entry.minutesStudied;
      weeklyTasksDone += entry.tasksCompleted;
    }
  }
  const targetWeeklyMinutes = Math.max(60, state.profile.dailyGoalHours * 60 * 7);
  const timeScore = Math.min(1, weeklyMinutes / targetWeeklyMinutes);
  const taskScore = totalTasks > 0 ? Math.min(1, (weeklyTasksDone + completedTasks) / Math.max(1, totalTasks)) : 0;
  const weeklyProductivityPercent =
    weeklyMinutes === 0 && weeklyTasksDone === 0 && completedTasks === 0
      ? 0
      : Math.min(100, Math.round(timeScore * 65 + taskScore * 35));

  const todayEntry = state.activityLog[getTodayISO()];
  const todayMinutes = todayEntry ? todayEntry.minutesStudied : 0;

  return {
    careerReadinessScore,
    totalLearningHours,
    skillsCompletedCount: skillsCompletedCount + completedTopicsTotal,
    totalSkillsCount,
    interviewAverageScore,
    currentStreak,
    weeklyProductivityPercent,
    todayMinutes,
  };
}

export function buildWeeklyActivitySeries(state: SkillPilotState) {
  const days: { day: string; hours: number; tasks: number; topics: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const iso = getOffsetDateISO(-i);
    const dateObj = new Date(iso + 'T12:00:00');
    const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = state.activityLog[iso];
    days.push({
      day: label,
      hours: entry ? Number((entry.minutesStudied / 60).toFixed(2)) : 0,
      tasks: entry ? entry.tasksCompleted : 0,
      topics: entry ? entry.topicsCompleted : 0,
    });
  }
  return days;
}

export function buildSkillProgressSeries(state: SkillPilotState) {
  const levelMap = { Beginner: 25, Intermediate: 55, Advanced: 80, Expert: 100 };
  if (state.skills.length > 0) {
    return state.skills.slice(0, 7).map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + '…' : s.name,
      progress: s.totalTopics > 0 ? Math.min(100, Math.round((s.completedTopics / s.totalTopics) * 100)) : levelMap[s.proficiency],
      hours: s.hoursLogged,
    }));
  }
  return [];
}

export function buildInterviewPerformanceSeries(state: SkillPilotState) {
  return [...state.interviewHistory]
    .slice(0, 10)
    .reverse()
    .map((item, idx) => ({
      attempt: `#${idx + 1}`,
      category: item.category,
      score: item.scorePercent,
    }));
}

export function buildReadinessTrendSeries(state: SkillPilotState) {
  const activeRoadmap =
    CAREER_ROADMAPS.find((r) => r.id === state.activeRoadmapId) || CAREER_ROADMAPS[0];
  const baseReadiness = computeDashboardMetrics(state).careerReadinessScore;
  const series: { day: string; readiness: number }[] = [];

  let cumulativeActivity = 0;
  const recentEntries = [];
  for (let i = 6; i >= 0; i--) {
    const iso = getOffsetDateISO(-i);
    const entry = state.activityLog[iso];
    const scoreDelta = entry
      ? Math.min(12, Math.round(entry.minutesStudied / 30) + entry.tasksCompleted * 2 + entry.topicsCompleted * 3 + entry.interviewsTaken * 4)
      : 0;
    recentEntries.push({ iso, scoreDelta });
    cumulativeActivity += scoreDelta;
  }

  const startValue = Math.max(0, baseReadiness - cumulativeActivity);
  let running = startValue;
  for (const item of recentEntries) {
    running = Math.min(100, running + item.scoreDelta);
    const dateObj = new Date(item.iso + 'T12:00:00');
    series.push({
      day: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      readiness: baseReadiness === 0 ? 0 : running,
    });
  }

  if (series.length > 0 && activeRoadmap) {
    series[series.length - 1].readiness = baseReadiness;
  }
  return series;
}
