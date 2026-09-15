import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-400 pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-950 cursor-pointer ${
            error
              ? 'border-rose-400 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950'
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-950 hover:border-slate-400 dark:hover:border-slate-650'
          } ${className}`}
          {...props}
        >
          {children ? (
            children
          ) : (
            options.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-slate-900">
                {opt.label}
              </option>
            ))
          )}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
