import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import ModalPortal from './ModalPortal';

const VARIANT_CONFIG = {
  danger:  { icon: Trash2,         iconClass: 'text-red-500 bg-red-50',    confirmClass: 'bg-red-500 hover:bg-red-600 text-white' },
  warning: { icon: AlertTriangle,  iconClass: 'text-amber-500 bg-amber-50',confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white' },
  info:    { icon: Info,           iconClass: 'text-blue-500 bg-blue-50',  confirmClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
};

const ConfirmModal = ({
  isOpen,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}) => {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger;
  const IconComp = cfg.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-2.5 rounded-xl ${cfg.iconClass} flex-shrink-0`}>
              <IconComp size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${cfg.confirmClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmModal;
