import React from 'react';

export const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...'
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-purple-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-600 border-t-transparent',
    emerald: 'border-emerald-600 border-t-transparent',
  };

  return (
    <div className="inline-flex items-center justify-center role='status'">
      <div
        className={`rounded-full animate-spin ${sizes[size] || sizes.md} ${colors[color] || colors.primary} ${className}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
