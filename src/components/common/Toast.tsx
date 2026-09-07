import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-slate-900 text-white border-emerald-500/30',
    warning: 'bg-slate-900 text-white border-amber-500/30',
    error: 'bg-slate-900 text-white border-rose-500/30',
    info: 'bg-slate-900 text-white border-blue-500/30',
  };

  return (
    <aside
      aria-label="Notification d'alerte"
      id="sysgesco-toast"
      className={`fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-xs font-bold text-white tracking-wide uppercase">{toast.title}</h4>}
        <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={hideToast}
        aria-label="Fermer la notification"
        className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
