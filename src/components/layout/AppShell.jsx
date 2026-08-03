import React from 'react';
import Navbar from './Navbar';
import { Compass } from 'lucide-react';

export const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-slate-800">SkillBridge Platform</span>
              <span className="text-xs text-slate-400">© 2026. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500">
              <a href="#privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#support" className="hover:text-indigo-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
