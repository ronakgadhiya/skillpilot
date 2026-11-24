import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppDataProvider } from './context/AppDataContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LegalPage } from './pages/LegalPage';
import { OverviewPage } from './pages/OverviewPage';
import { RoadmapsPage } from './pages/RoadmapsPage';
import { InterviewPage } from './pages/InterviewPage';
import { ResumePage } from './pages/ResumePage';
import { SkillsPage } from './pages/SkillsPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { PlannerPage } from './pages/PlannerPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SettingsPage } from './pages/SettingsPage';

function WorkspaceRoute({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppDataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Legal Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/privacy" element={<LegalPage mode="privacy" />} />
              <Route path="/terms" element={<LegalPage mode="terms" />} />

              {/* 9 Application Shell Routes */}
              <Route
                path="/overview"
                element={
                  <WorkspaceRoute>
                    <OverviewPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/roadmaps"
                element={
                  <WorkspaceRoute>
                    <RoadmapsPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/interview"
                element={
                  <WorkspaceRoute>
                    <InterviewPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <WorkspaceRoute>
                    <ResumePage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <WorkspaceRoute>
                    <SkillsPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/playground"
                element={
                  <WorkspaceRoute>
                    <PlaygroundPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/planner"
                element={
                  <WorkspaceRoute>
                    <PlannerPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <WorkspaceRoute>
                    <AchievementsPage />
                  </WorkspaceRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <WorkspaceRoute>
                    <SettingsPage />
                  </WorkspaceRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppDataProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
