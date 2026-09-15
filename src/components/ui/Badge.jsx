import React from 'react';

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors duration-150";

  const variants = {
    primary: "bg-purple-50 text-purple-700 border border-purple-200/60",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/60",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/80",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/60",
  };

  const dotColors = {
    primary: "bg-purple-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-slate-400",
    purple: "bg-purple-500",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1 text-sm gap-2",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-purple-500'}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
