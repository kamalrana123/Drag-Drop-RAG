import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X, Copy } from 'lucide-react';
import ModalPortal from './ModalPortal';

const ResultModal = ({ isOpen, title = 'Result', content, variant = 'success', onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const isSuccess = variant === 'success';

  const formatted =
    typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : String(content ?? '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatted).catch(() => {});
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
                {isSuccess
                  ? <CheckCircle2 size={18} className="text-green-600" />
                  : <XCircle size={18} className="text-red-600" />
                }
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={15} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-mono bg-gray-50 rounded-xl p-4 leading-relaxed">
              {formatted}
            </pre>
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ResultModal;
