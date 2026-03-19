import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Copy, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Spinner from './ui/Spinner';
import { useStore } from '../store';

const UserMessage = ({ msg }) => (
  <div className="flex justify-end">
    <div className="max-w-[85%] bg-indigo-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      <div className="text-[10px] text-indigo-200 mt-1 text-right">
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
);

const AssistantMessage = ({ msg }) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const hasSources = msg.sources?.length > 0;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(msg.content).catch(() => {});
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] space-y-1">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
            <div className="text-[10px] text-gray-400">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button onClick={copyToClipboard} className="text-gray-300 hover:text-gray-500 transition-colors" title="Copy answer">
              <Copy size={11} />
            </button>
          </div>
        </div>

        {hasSources && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>{msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}</span>
              {sourcesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            {sourcesOpen && (
              <div className="border-t border-gray-100 px-3 pb-2 space-y-1">
                {msg.sources.map((src, i) => (
                  <div key={i} className="text-[10px] text-gray-500 py-0.5">
                    <span className="font-medium text-indigo-500">[{i + 1}]</span>{' '}
                    {typeof src === 'string' ? src : src.content ?? JSON.stringify(src)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPanel = () => {
  const { chatHistory, addChatMessage, clearChatHistory, setChatPanelOpen } = useStore();
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const textareaRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    addChatMessage({
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    const runQuery = useStore.getState()._runQuery;
    if (runQuery) {
      await runQuery(query);
    } else {
      addChatMessage({
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Backend not connected. Start the API server at http://localhost:8000.',
        sources: [],
        timestamp: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg">
            <MessageCircle size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-800">Query Pipeline</h2>
        </div>
        <div className="flex items-center space-x-1">
          {chatHistory.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => setChatPanelOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={22} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Ask your pipeline a question</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed">
              Type a question below. Your RAG pipeline will retrieve and generate an answer.
            </p>
          </div>
        ) : (
          chatHistory.map((msg) =>
            msg.role === 'user'
              ? <UserMessage key={msg.id} msg={msg} />
              : <AssistantMessage key={msg.id} msg={msg} />
          )
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-2">
              <Spinner size={13} className="text-indigo-400" />
              <span className="text-xs text-gray-400">Generating answer…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Enter to send)"
            rows={2}
            disabled={loading}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors self-end"
          >
            {loading ? <Spinner size={14} className="text-white" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Enter ↵ to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatPanel;
