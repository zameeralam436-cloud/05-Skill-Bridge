import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow focus:ring-purple-500 active:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 dark:active:bg-purple-700",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:active:bg-slate-600",
    outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-purple-500 bg-white dark:bg-slate-900",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:ring-slate-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:bg-rose-800 dark:bg-rose-50 dark:hover:bg-rose-600 dark:active:bg-rose-700",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 dark:bg-emerald-50 dark:hover:bg-emerald-600 dark:active:bg-emerald-750",
    custom: " ",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const combinedClassNames = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled || isLoading}
      className={combinedClassNames}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      
      <span>{children}</span>

      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
