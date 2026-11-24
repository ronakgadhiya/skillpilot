import { SkillPilotState } from '../types';
import { CAREER_ROADMAPS } from './roadmaps';
import { computeLearningStreak } from '../storage/storage';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'Productivity' | 'Roadmaps' | 'Interviews' | 'Skills' | 'Consistency';
  getProgress: (state: SkillPilotState) => { current: number; target: number };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-task',
    title: 'First Task Completed',
    description: 'Complete your first task in the Growth Planner.',
    points: 50,
    category: 'Productivity',
    getProgress: (state) => ({
      current: Math.min(1, state.tasks.filter((t) => t.completed).length),
      target: 1,
    }),
  },
  {
    id: 'first-roadmap',
    title: 'First Roadmap Completed',
    description: 'Complete 100% of topics in any Career Roadmap.',
    points: 250,
    category: 'Roadmaps',
    getProgress: (state) => {
      const completedRoadmaps = CAREER_ROADMAPS.filter((roadmap) => {
        const done = state.roadmapProgress[roadmap.id] || [];
        return roadmap.topics.length > 0 && roadmap.topics.every((t) => done.includes(t.id));
      }).length;
      return { current: Math.min(1, completedRoadmaps), target: 1 };
    },
  },
  {
    id: 'five-day-streak',
    title: 'Five-Day Learning Streak',
    description: 'Maintain active learning across 5 consecutive days.',
    points: 150,
    category: 'Consistency',
    getProgress: (state) => ({
      current: Math.min(5, computeLearningStreak(state.activityLog)),
      target: 5,
    }),
  },
  {
    id: 'ten-interviews',
    title: 'Ten Interview Tests Completed',
    description: 'Finish 10 practice tests inside the Interview Arena.',
    points: 200,
    category: 'Interviews',
    getProgress: (state) => ({
      current: Math.min(10, state.interviewHistory.length),
      target: 10,
    }),
  },
  {
    id: 'ten-skills',
    title: 'Ten Skills Added',
    description: 'Track at least 10 distinct skills in the Skill Tracker.',
    points: 150,
    category: 'Skills',
    getProgress: (state) => ({
      current: Math.min(10, state.skills.length),
      target: 10,
    }),
  },
  {
    id: 'fifty-hours',
    title: 'Fifty Learning Hours',
    description: 'Accumulate 50 total hours of logged study and skill practice.',
    points: 300,
    category: 'Consistency',
    getProgress: (state) => {
      const totalHours = calculateTotalLearningHours(state);
      return { current: Math.min(50, Math.floor(totalHours)), target: 50 };
    },
  },
];

export function calculateTotalLearningHours(state: SkillPilotState): number {
  const sessionMinutes = state.studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const activityMinutes = Object.values(state.activityLog).reduce(
    (acc, a) => acc + (a.minutesStudied || 0),
    0
  );
  const skillHours = state.skills.reduce((acc, s) => acc + (s.hoursLogged || 0), 0);
  const hoursFromMinutes = Math.max(sessionMinutes, activityMinutes) / 60;
  return Number((hoursFromMinutes + skillHours).toFixed(1));
}

export function calculateUserPoints(state: SkillPilotState): number {
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const completedTopics = Object.values(state.roadmapProgress).reduce(
    (acc, list) => acc + list.length,
    0
  );
  const interviewPoints = state.interviewHistory.reduce(
    (acc, test) => acc + 20 + Math.round(test.scorePercent / 5),
    0
  );
  const achievementPoints = state.unlockedAchievements.reduce((acc, u) => {
    const def = ACHIEVEMENTS.find((a) => a.id === u.id);
    return acc + (def ? def.points : 0);
  }, 0);

  return completedTasks * 15 + completedTopics * 25 + interviewPoints + achievementPoints;
}

export function getLevelInfo(points: number): {
  level: number;
  title: string;
  currentLevelFloor: number;
  nextLevelPoints: number;
  progressPercent: number;
} {
  const tiers = [
    { level: 1, title: 'Explorer', min: 0 },
    { level: 2, title: 'Apprentice', min: 150 },
    { level: 3, title: 'Builder', min: 400 },
    { level: 4, title: 'Practitioner', min: 800 },
    { level: 5, title: 'Specialist', min: 1400 },
    { level: 6, title: 'Architect', min: 2200 },
    { level: 7, title: 'Principal', min: 3200 },
  ];

  let current = tiers[0];
  let next = tiers[1];
  for (let i = 0; i < tiers.length; i++) {
    if (points >= tiers[i].min) {
      current = tiers[i];
      next = tiers[i + 1] || { level: tiers[i].level + 1, title: 'Master', min: tiers[i].min + 1000 };
    }
  }

  const span = next.min - current.min;
  const earnedInTier = points - current.min;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInTier / span) * 100)));

  return {
    level: current.level,
    title: current.title,
    currentLevelFloor: current.min,
    nextLevelPoints: next.min,
    progressPercent,
  };
}
