import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-slate-900 dark:text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
