import { useState, useMemo } from 'react';
import {
  ChevronLeft, LayoutDashboard, Network, FileText, Settings, Zap, Rocket,
  RotateCcw, RotateCw, FolderOpen, Save, X
} from 'lucide-react';
import { useStore } from '../store';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { savePipeline } from '../utils/persistence';
import { serializePipeline } from '../utils/pipelineSerialization';
import Sidebar from './Sidebar';
import Flow from './Flow';
import SettingsPanel from './SettingsPanel';
import ValidationBanner from './ValidationBanner';
import ChatPanel from './ChatPanel';
import WorkflowManager from './WorkflowManager';
import PipelineSelector from './PipelineSelector';
import ProjectOverviewTab from './ProjectOverviewTab';
import ProjectDocumentsTab from './ProjectDocumentsTab';
import ProjectSettingsTab from './ProjectSettingsTab';
import ProjectLLMTab from './ProjectLLMTab';
import ProjectDeployTab from './ProjectDeployTab';

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'pipeline',  label: 'Pipeline',  icon: Network },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'llm',       label: 'Models',    icon: Zap },
  { id: 'deploy',    label: 'Deploy',    icon: Rocket },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

// ── Pipeline tab toolbar (undo/redo/save/workflows — only shown in pipeline tab) ──
function PipelineToolbar() {
  const { undo, redo, history, future, nodes, edges } = useStore();
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [savePopover, setSavePopover] = useState(false);
  const [saveName, setSaveName] = useState('');

  const shortcuts = useMemo(() => [
    { keys: ['z', 'ctrl'],          handler: undo },
    { keys: ['z', 'ctrl', 'shift'], handler: redo },
    { keys: ['s', 'ctrl'],          handler: () => setSavePopover(true) },
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
    <>
      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors border-r border-gray-200">
            <RotateCcw size={13} /><span>Undo</span>
          </button>
          <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Shift+Z)"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <RotateCw size={13} /><span>Redo</span>
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200" />

        <button onClick={() => setWorkflowOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          <FolderOpen size={13} /><span>Workflows</span>
        </button>

        <div className="relative">
          <button onClick={() => setSavePopover(!savePopover)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <Save size={13} /><span>Save</span>
          </button>
          {savePopover && (
            <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 w-56">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Save Pipeline</span>
                <button onClick={() => setSavePopover(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
              </div>
              <input autoFocus value={saveName} onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()} placeholder="Pipeline name…"
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={handleSave} disabled={!saveName.trim()}
                className="w-full py-1.5 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors">
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <WorkflowManager isOpen={workflowOpen} onClose={() => setWorkflowOpen(false)} />
    </>
  );
}

// ── Main ProjectView ──────────────────────────────────────────────────────────
export default function ProjectView() {
  const {
    currentProjectId, currentProject, activeProjectTab,
    setActiveProjectTab, closeProject, chatPanelOpen, nodes,
  } = useStore();

  const project = currentProject;

  if (!project) {
    closeProject();
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={closeProject}
            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Back to Dashboard"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">AV</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 leading-none">{project.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {nodes.length} nodes in current pipeline
            </p>
          </div>
        </div>

        {/* Toolbar — only shown for Pipeline tab */}
        {activeProjectTab === 'pipeline' && <PipelineToolbar />}
      </header>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <nav className="flex items-center border-b border-gray-200 bg-white px-6 flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeProjectTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveProjectTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                active
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Tab panels ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Overview */}
        {activeProjectTab === 'overview' && (
          <ProjectOverviewTab project={project} />
        )}

        {/* Pipeline — always mounted, shown/hidden via CSS to preserve ReactFlow state */}
        <div className={`flex flex-1 overflow-hidden ${activeProjectTab === 'pipeline' ? 'flex' : 'hidden'}`}>
          <PipelineSelector />
          <Sidebar />
          <div className="flex-1 relative h-full">
            <ValidationBanner />
            <Flow />
          </div>
          {chatPanelOpen ? <ChatPanel /> : <SettingsPanel />}
        </div>

        {/* Documents */}
        {activeProjectTab === 'documents' && (
          <ProjectDocumentsTab project={project} />
        )}

        {/* Models / LLM config */}
        {activeProjectTab === 'llm' && (
          <ProjectLLMTab project={project} />
        )}

        {/* Deploy */}
        {activeProjectTab === 'deploy' && (
          <ProjectDeployTab project={project} />
        )}

        {/* Settings */}
        {activeProjectTab === 'settings' && (
          <ProjectSettingsTab project={project} />
        )}

      </div>
    </div>
  );
}
