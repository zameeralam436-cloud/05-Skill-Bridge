import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed p-3.5 ${
            error
              ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-100 bg-white hover:border-slate-400'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
