import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, Sparkles, User, Briefcase, ShieldCheck, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, userRole, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Student Portal', path: '/student-dashboard', icon: <User className="w-4 h-4" /> },
    { label: 'Employer Portal', path: '/employer-dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Admin', path: '/admin-dashboard', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      addToast({
        title: 'Logged Out',
        message: 'You have been logged out successfully.',
        type: 'info',
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getUserBadgeVariant = (role) => {
    if (role === 'student') return 'primary';
    if (role === 'employer') return 'success';
    if (role === 'admin') return 'warning';
    return 'neutral';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Placeholder Left */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Skill<span className="text-purple-600">Bridge</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider -mt-1">
                Careers & Skills
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links Right */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isActive(item.path)
                    ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons Right (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  {userRole && (
                    <Badge variant={getUserBadgeVariant(userRole)} size="sm" className="self-end mt-0.5">
                      {userRole}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Action Controls (Mobile) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle Button Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Collapse Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  {userRole && <Badge variant={getUserBadgeVariant(userRole)} size="sm">{userRole}</Badge>}
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
