import { useState, useEffect } from 'react';
import {
  Plus, FolderOpen, Trash2, LogOut, Database, Clock,
  GitBranch, Layers, Activity, ArrowRight, Sparkles,
  Network, Cpu, MoreVertical, FileText
} from 'lucide-react';
import api from '../utils/api';
import { useStore } from '../store';

// Deterministic color palette per pipeline card
const CARD_ACCENTS = [
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  { bg: 'bg-sky-500',    light: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-200'    },
  { bg: 'bg-emerald-500',light: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-200'},
  { bg: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-200'  },
  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
];

function getAccent(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CARD_ACCENTS[Math.abs(hash) % CARD_ACCENTS.length];
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

// ── Project Card ─────────────────────────────────────────────────────────────
function PipelineCard({ entry, onOpen, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nodeCount = entry.pipeline?.nodes?.length ?? 0;
  const edgeCount = entry.pipeline?.edges?.length ?? 0;
  const docCount  = entry.documents?.length ?? 0;
  const accent = getAccent(entry.name);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top color bar */}
      <div className={`h-1 w-full ${accent.bg}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 ${accent.light} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Network size={17} className={accent.text} />
          </div>

          {/* Context menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-36">
                  <button
                    onClick={() => { onOpen(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FolderOpen size={13} />
                    <span>Open</span>
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <p className="text-sm font-semibold text-gray-900 mb-1 truncate leading-snug">{entry.name}</p>
        {entry.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-snug">{entry.description}</p>
        )}

        {/* Meta chips */}
        <div className="flex items-center flex-wrap gap-1.5 mb-5">
          <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full ${accent.light} ${accent.text}`}>
            <Cpu size={10} />
            <span>{nodeCount} nodes</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            <Activity size={10} />
            <span>{edgeCount} edges</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
            <FileText size={10} />
            <span>{docCount} docs</span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatRelative(entry.updatedAt ?? entry.savedAt)}</span>
          <button
            onClick={onOpen}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${accent.border} ${accent.text} hover:${accent.light} transition-colors`}
          >
            <span>Open</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Project Card ──────────────────────────────────────────────────────────
function NewCanvasCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 p-5 flex flex-col items-center justify-center text-center min-h-[192px]"
    >
      <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center mb-3 transition-colors">
        <Plus size={18} className="text-indigo-600" />
      </div>
      <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">New Project</p>
      <p className="text-xs text-gray-400 mt-1">Start a new RAG project</p>
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ onNewProject, onOpenProject, onLogout }) {
  const currentUser = useStore((s) => s.currentUser);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.projects.list()
      .then((data) => { if (!cancelled) setProjects(data); })
      .catch((err) => { if (!cancelled) setError(err.message ?? 'Failed to load projects'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    // Optimistic remove
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.projects.remove(id);
    } catch {
      // Rollback on failure by re-fetching
      api.projects.list().then(setProjects).catch(() => {});
    }
  };

  const lastSaved = projects.length > 0
    ? projects.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), projects[0].updatedAt)
    : null;

  const totalNodes = projects.reduce((sum, p) => sum + (p.pipeline?.nodes?.length ?? 0), 0);
  const totalDocs  = projects.reduce((sum, p) => sum + (p.documents?.length ?? 0), 0);

  return (
    <div className="w-full h-full flex flex-col bg-[#f8f9fc] overflow-auto">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 px-8 py-0 flex items-center justify-between flex-shrink-0 h-14">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs tracking-tight">AV</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 tracking-tight">Visual RAG Builder</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-xs text-gray-400 font-medium">Dashboard</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">
                {(currentUser?.email?.[0] ?? 'U').toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700">
              {currentUser?.email ?? 'User'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-8 py-8 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Good day, {currentUser?.email?.split('@')[0] ?? 'there'}
            </h1>
            <p className="text-indigo-300 text-sm">
              {projects.length === 0
                ? 'No projects yet. Create your first RAG project.'
                : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''}. Last updated ${formatRelative(lastSaved)}.`
              }
            </p>
          </div>

          <button
            onClick={onNewProject}
            className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <div className="px-8 -mt-4 mb-8 flex-shrink-0">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-4">
          {[
            {
              icon: <Layers size={16} className="text-indigo-600" />,
              iconBg: 'bg-indigo-100',
              label: 'Total Projects',
              value: projects.length,
              sub: projects.length === 1 ? '1 project' : `${projects.length} projects`,
            },
            {
              icon: <Cpu size={16} className="text-violet-600" />,
              iconBg: 'bg-violet-100',
              label: 'Total Nodes',
              value: totalNodes,
              sub: 'across all projects',
            },
            {
              icon: <FileText size={16} className="text-teal-600" />,
              iconBg: 'bg-teal-100',
              label: 'Total Documents',
              value: totalDocs,
              sub: 'across all projects',
            },
            {
              icon: <Clock size={16} className="text-sky-600" />,
              iconBg: 'bg-sky-100',
              label: 'Last Activity',
              value: lastSaved ? formatRelative(lastSaved) : '—',
              sub: lastSaved ? formatDate(lastSaved) : 'No activity yet',
              small: true,
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center space-x-4">
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">{stat.label}</p>
                <p className={`font-bold text-gray-900 leading-none ${stat.small ? 'text-base' : 'text-xl'}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pipeline grid ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Your Projects</h2>
              {projects.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            {projects.length > 0 && (
              <button
                onClick={onNewProject}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Plus size={13} />
                <span>New Project</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">Loading projects…</div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-sm text-red-500">{error}</div>
          ) : projects.length === 0 ? (
            // Empty state — only the new project card
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <NewCanvasCard onClick={onNewProject} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New project card always first */}
              <NewCanvasCard onClick={onNewProject} />

              {projects.map((entry) => (
                <PipelineCard
                  key={entry.id}
                  entry={entry}
                  onOpen={() => onOpenProject(entry)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white px-8 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">Advanced Visual RAG Builder</span>
          <div className="flex items-center space-x-1.5">
            <Database size={11} className="text-gray-300" />
            <span className="text-xs text-gray-400">Backend API · projects stored server-side</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
