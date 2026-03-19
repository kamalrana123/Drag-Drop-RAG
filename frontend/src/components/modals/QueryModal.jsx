import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import ModalPortal from './ModalPortal';

const QueryModal = ({ isOpen, onSubmit, onClose, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
    // Reset query when modal closes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && !isLoading) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    onSubmit(query.trim());
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <MessageSquare size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Run Query</h3>
          </div>

          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…&#10;(Enter to submit, Shift+Enter for new line)"
            rows={4}
            disabled={isLoading}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
          />

          <p className="text-[11px] text-gray-400 mt-1">Enter ↵ to submit · Shift+Enter for new line</p>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={14} className="animate-spin" /><span>Running…</span></>
              ) : (
                <><Send size={14} /><span>Run Query</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default QueryModal;
