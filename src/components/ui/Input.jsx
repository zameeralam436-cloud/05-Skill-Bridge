import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-400 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 text-rose-900 dark:text-rose-100 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950 bg-rose-50/20 dark:bg-rose-950/10'
              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-950 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-650'
          } py-2.5 ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
