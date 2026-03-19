import { useState, useMemo } from 'react';
import Flow from './components/Flow';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import ValidationBanner from './components/ValidationBanner';
import WorkflowManager from './components/WorkflowManager';
import ChatPanel from './components/ChatPanel';
import { useStore } from './store';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { savePipeline } from './utils/persistence';
import { serializePipeline } from './utils/pipelineSerialization';
import {
  RotateCcw, RotateCw, FolderOpen, Save, X
} from 'lucide-react';

function App() {
  const { undo, redo, history, future, nodes, edges, chatPanelOpen } = useStore();
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [savePopover, setSavePopover] = useState(false);
  const [saveName, setSaveName] = useState('');

  const shortcuts = useMemo(() => [
    { keys: ['z', 'ctrl'],        handler: undo },
    { keys: ['z', 'ctrl', 'shift'], handler: redo },
    { keys: ['s', 'ctrl'],        handler: () => setSavePopover(true) },
  ], [undo, redo]);

  useKeyboardShortcuts(shortcuts);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;
    savePipeline(name, serializePipeline(nodes, edges));
    setSaveName('');
    setSavePopover(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">AV</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
            Advanced Visual RAG Builder
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Undo / Redo */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={undo}
              disabled={history.length === 0}
              title="Undo (Ctrl+Z)"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors border-r border-gray-200"
            >
              <RotateCcw size={13} /><span>Undo</span>
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Shift+Z)"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <RotateCw size={13} /><span>Redo</span>
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Workflows */}
          <button
            onClick={() => setWorkflowOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FolderOpen size={13} /><span>Workflows</span>
          </button>

          {/* Save */}
          <div className="relative">
            <button
              onClick={() => setSavePopover(!savePopover)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Save size={13} /><span>Save</span>
            </button>

            {savePopover && (
              <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-56">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Save Pipeline</span>
                  <button onClick={() => setSavePopover(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                </div>
                <input
                  autoFocus
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Pipeline name…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="w-full py-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex">
        <Sidebar />

        <div className="flex-1 relative h-full">
          <ValidationBanner />
          <Flow />
        </div>

        {chatPanelOpen
          ? <ChatPanel />
          : <SettingsPanel />
        }
      </main>

      <WorkflowManager isOpen={workflowOpen} onClose={() => setWorkflowOpen(false)} />
    </div>
  );
}

export default App;
