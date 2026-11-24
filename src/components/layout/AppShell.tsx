import React, { useRef, useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  CalendarCheck,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Download,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Map,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { downloadWorkspaceBackupJSON } from '../../storage/storage';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { CommandPalette } from './CommandPalette';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/overview', icon: LayoutDashboard },
  { label: 'Career Roadmaps', to: '/roadmaps', icon: Map },
  { label: 'Interview Arena', to: '/interview', icon: GraduationCap },
  { label: 'Resume Studio', to: '/resume', icon: FileText },
  { label: 'Skill Tracker', to: '/skills', icon: TrendingUp },
  { label: 'Coding Playground', to: '/playground', icon: Code2 },
  { label: 'Growth Planner', to: '/planner', icon: CalendarCheck },
  { label: 'Achievements', to: '/achievements', icon: Award },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, markAllNotificationsRead, markNotificationRead } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setPaletteOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcuts: Cmd/Ctrl+K for Command Palette, Ctrl+1..9 for modules
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
        setPaletteOpen((prev) => !prev);
        return;
      }

      if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (e.key < '1' || e.key > '9') return;
      const targetIndex = Number(e.key) - 1;
      const targetNav = NAV_ITEMS[targetIndex];
      if (!targetNav) return;

      e.preventDefault();
      setMobileMenuOpen(false);
      setPaletteOpen(false);
      setNotifOpen(false);
      setProfileOpen(false);
      if (!location.pathname.startsWith(targetNav.to)) {
        navigate(targetNav.to);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.pathname]);

  const handleQuickExport = () => {
    downloadWorkspaceBackupJSON(state);
    showToast('Activity data exported as JSON.', 'success');
  };

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const userName = state.profile.displayName || 'Workspace User';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'SP';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Primary Workspace Navigation"
        className={`no-print fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'} shrink-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link
            to="/overview"
            className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Compass className="h-4.5 w-4.5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                SkillPilot
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation drawer"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:inline-flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const shortcut = `Ctrl+${idx + 1}`;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? `${item.label} (${shortcut})` : shortcut}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`
                }
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>
                </span>
                {!sidebarCollapsed && (
                  <kbd className="hidden lg:inline-block font-mono text-[11px] font-normal text-slate-400 dark:text-slate-500 shrink-0">
                    {shortcut}
                  </kbd>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link
            to="/"
            title={sidebarCollapsed ? 'Public Landing Page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors whitespace-nowrap ${
              sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <Home className="h-4.5 w-4.5 shrink-0" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Public Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {currentNav?.label || 'Workspace'}
              </p>
              <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
                {state.profile.careerGoal} · Local Browser Storage
              </p>
            </div>
          </div>

          {/* Global Command Palette Search Trigger */}
          <div className="hidden flex-1 max-w-md md:block">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette search (Cmd+K)"
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">Search modules, roadmaps, tasks...</span>
              </span>
              <kbd className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                Cmd+K
              </kbd>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open global search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {state.notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      state.notifications.slice(0, 8).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.route) navigate(n.route);
                            setNotifOpen(false);
                          }}
                          className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                            !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                New
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {n.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="User profile menu"
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">{userName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {state.profile.careerGoal}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/settings');
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profile & Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/achievements');
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Award className="h-4 w-4 text-slate-400" />
                      Achievements
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/');
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Home className="h-4 w-4 text-slate-400" />
                      Public Landing Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="relative flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-24 max-w-[1440px] w-full mx-auto">
          <ErrorBoundary>{children}</ErrorBoundary>

          {/* Floating Quick Export Button */}
          <button
            type="button"
            onClick={handleQuickExport}
            aria-label="Quick export activity data as JSON"
            title="Download current activity data as JSON"
            className="no-print fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Quick Export</span>
          </button>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
