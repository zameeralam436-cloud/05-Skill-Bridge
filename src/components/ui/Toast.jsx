import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  const { id, type = 'info', title, message } = toast;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
      border: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      border: 'border-amber-200 bg-amber-50/90 text-amber-950',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      border: 'border-rose-200 bg-rose-50/90 text-rose-950',
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
      border: 'border-indigo-200 bg-indigo-50/90 text-indigo-950',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-md w-full ${config.border}`}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {message && <p className={`mt-0.5 opacity-90 ${title ? 'text-xs' : 'text-sm'}`}>{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
