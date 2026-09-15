import React from 'react';

export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-slate-200 ${className}`}>
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap pb-3.5 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                isActive
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.icon && (
                <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 py-0.5 px-2 text-xs rounded-full font-bold ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
