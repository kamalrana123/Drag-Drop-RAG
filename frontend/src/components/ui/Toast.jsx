import React, { useEffect } from 'react';
import { XCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const VARIANT_CONFIG = {
  error:   { icon: XCircle,       bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   iconClass: 'text-red-500'   },
  success: { icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', iconClass: 'text-green-500' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', iconClass: 'text-amber-500' },
};

const Toast = ({ message, variant = 'error', onDismiss, duration = 4000 }) => {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.error;
  const IconComp = cfg.icon;

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-lg ${cfg.bg} ${cfg.border} animate-slide-up max-w-md`}>
      <IconComp size={16} className={cfg.iconClass} />
      <span className={`text-sm font-medium ${cfg.text} flex-1`}>{message}</span>
      <button onClick={onDismiss} className={`${cfg.iconClass} hover:opacity-70 transition-opacity`}>
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
