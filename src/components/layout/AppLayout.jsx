import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Heart, TestTube2, Scale, Pill,
  ClipboardList, User, Menu, X, Sun, Moon, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/blood-pressure', icon: Heart, label: 'Pressione' },
  { path: '/blood-tests', icon: TestTube2, label: 'Analisi' },
  { path: '/body-metrics', icon: Scale, label: 'Metriche' },
  { path: '/medications', icon: Pill, label: 'Farmaci' },
  { path: '/symptoms', icon: ClipboardList, label: 'Sintomi' },
  { path: '/profile', icon: User, label: 'Profilo' },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const ThemeToggle = ({ className }) => (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {theme === 'dark'
        ? <><Sun className="w-4 h-4" /><span>Tema chiaro</span></>
        : <><Moon className="w-4 h-4" /><span>Tema scuro</span></>
      }
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">VitalPulse</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <nav className="absolute top-14 left-0 right-0 bg-card border-b shadow-xl p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t mt-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-card fixed top-0 bottom-0 left-0 z-30">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">VitalPulse</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Gestione Salute</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="px-3 pb-4 space-y-1 border-t pt-3">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 mb-1">
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.full_name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {(user.full_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{user.full_name}</p>
                  {user.email && <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>}
                </div>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Esci</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav - mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t safe-area-inset-bottom">
        <div className="flex justify-around py-1.5 px-2">
          {[...navItems.slice(0, 4), navItems[6]].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.path && "scale-110")} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
