import { Network, FileText, Cpu, Activity, ArrowRight, Upload, Settings, Zap, Rocket } from 'lucide-react';
import { useStore } from '../store';

function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center space-x-4">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ProjectOverviewTab({ project }) {
  const { setActiveProjectTab } = useStore();

  const nodeCount = project.pipeline?.nodes?.length ?? 0;
  const edgeCount = project.pipeline?.edges?.length ?? 0;
  const docCount = project.documents?.length ?? 0;

  const quickActions = [
    {
      icon: <Network size={16} className="text-indigo-600" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      border: 'border-indigo-200',
      label: 'Open Pipeline',
      desc: 'Design your RAG pipeline visually',
      tab: 'pipeline',
    },
    {
      icon: <Upload size={16} className="text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      border: 'border-emerald-200',
      label: 'Manage Documents',
      desc: 'Upload and manage source documents',
      tab: 'documents',
    },
    {
      icon: <Zap size={16} className="text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100',
      border: 'border-amber-200',
      label: 'Configure Models',
      desc: 'Set LLM and embedding models',
      tab: 'llm',
    },
    {
      icon: <Rocket size={16} className="text-teal-600" />,
      bg: 'bg-teal-50 hover:bg-teal-100',
      border: 'border-teal-200',
      label: 'Deploy',
      desc: 'Share link, embed iFrame, or Dockerfile',
      tab: 'deploy',
    },
    {
      icon: <Settings size={16} className="text-violet-600" />,
      bg: 'bg-violet-50 hover:bg-violet-100',
      border: 'border-violet-200',
      label: 'Project Settings',
      desc: 'Rename, describe, or delete project',
      tab: 'settings',
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Project info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}
            Last updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Cpu size={16} className="text-indigo-600" />}
            iconBg="bg-indigo-100"
            label="Pipeline Nodes"
            value={nodeCount}
            sub={`${edgeCount} connections`}
          />
          <StatCard
            icon={<FileText size={16} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
            label="Documents"
            value={docCount}
            sub={docCount === 0 ? 'None uploaded yet' : `${docCount} file${docCount !== 1 ? 's' : ''}`}
          />
          <StatCard
            icon={<Activity size={16} className="text-violet-600" />}
            iconBg="bg-violet-100"
            label="Pipeline Status"
            value={nodeCount === 0 ? 'Empty' : 'Draft'}
            sub={nodeCount === 0 ? 'No nodes added' : `${nodeCount} nodes configured`}
          />
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.tab}
                onClick={() => setActiveProjectTab(action.tab)}
                className={`flex items-start space-x-3 p-4 rounded-xl border ${action.border} ${action.bg} text-left transition-colors group`}
              >
                <div className="mt-0.5 flex-shrink-0">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 flex items-center justify-between">
                    {action.label}
                    <ArrowRight size={13} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Getting started checklist */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Getting Started</h3>
          <div className="space-y-3">
            {[
              { label: 'Upload source documents', done: docCount > 0, tab: 'documents' },
              { label: 'Design your RAG pipeline', done: nodeCount > 0, tab: 'pipeline' },
              { label: 'Connect pipeline nodes', done: edgeCount > 0, tab: 'pipeline' },
            ].map((step, i) => (
              <button
                key={i}
                onClick={() => !step.done && setActiveProjectTab(step.tab)}
                className="w-full flex items-center space-x-3 text-left group"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                  step.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-indigo-400'
                }`}>
                  {step.done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${step.done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <ArrowRight size={12} className="text-gray-400 ml-auto group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
