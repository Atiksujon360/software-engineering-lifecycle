import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProject();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="no-print fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-[var(--line)]';
        let bgClass = 'bg-[var(--surface)]';
        let icon = <Info className="w-4 h-4 text-[var(--cobalt)] shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-[var(--green)]/30';
          bgClass = 'bg-[var(--surface)]';
          icon = <CheckCircle className="w-4 h-4 text-[var(--green)] shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-[var(--amber)]/30';
          icon = <AlertCircle className="w-4 h-4 text-[var(--amber)] shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-[var(--red)]/30';
          icon = <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-lg border ${borderClass} ${bgClass} text-[var(--ink)] shadow-lg transition-all animate-in slide-in-from-bottom-2 text-xs`}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium">{toast.text}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded hover:bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
