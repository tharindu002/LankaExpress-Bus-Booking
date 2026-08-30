import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let bg = 'bg-slate-900 border-slate-700 text-slate-100';
        let Icon = Info;

        if (t.type === 'success') {
          bg = 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200';
          Icon = CheckCircle2;
        } else if (t.type === 'error') {
          bg = 'bg-rose-950/90 border-rose-500/50 text-rose-200';
          Icon = XCircle;
        } else if (t.type === 'warning') {
          bg = 'bg-amber-950/90 border-amber-500/50 text-amber-200';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md text-sm transition-all duration-300 ${bg}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 font-medium">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
