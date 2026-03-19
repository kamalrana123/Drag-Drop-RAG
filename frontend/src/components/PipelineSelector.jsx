import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { useStore } from '../store';
import api from '../utils/api';

const TYPE_META = {
  ingestion: { label: 'Ingestion', color: 'bg-blue-100 text-blue-700' },
  retrieval:  { label: 'Retrieval', color: 'bg-emerald-100 text-emerald-700' },
  agentic:    { label: 'Agentic',   color: 'bg-purple-100 text-purple-700' },
  custom:     { label: 'Custom',    color: 'bg-gray-100 text-gray-500' },
};

const PIPELINE_TYPES = ['ingestion', 'retrieval', 'agentic', 'custom'];

export default function PipelineSelector() {
  const {
    pipelines, currentPipelineId, currentProjectId,
    setPipelines, setCurrentPipelineId, loadPipeline,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(null); // pipeline id being loaded
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('custom');
  const [collapsed, setCollapsed] = useState(false);

  // Load pipelines on mount / project change
  useEffect(() => {
    if (!currentProjectId) return;
    let cancelled = false;
    setLoading(true);
    api.pipelines.list(currentProjectId)
      .then(async (list) => {
        if (cancelled) return;
        if (list.length === 0) {
          // Auto-create a default pipeline for new projects
          const p = await api.pipelines.create(currentProjectId, {
            name: 'Main Pipeline',
            pipeline_type: 'custom',
          });
          list = [p];
        }
        setPipelines(list);
        // Auto-select first if none active
        if (!currentPipelineId && list.length > 0) {
          await handleSwitch(list[0].id, list[0]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const handleSwitch = async (id, pipelineObj) => {
    if (id === currentPipelineId) return;
    setSwitching(id);
    try {
      // Use already-fetched data if available, otherwise fetch from API
      const full = pipelineObj ?? await api.pipelines.get(currentProjectId, id);
      loadPipeline(full.nodes ?? [], full.edges ?? []);
      setCurrentPipelineId(id);
    } catch { /* ignore */ } finally {
      setSwitching(null);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim() || 'Untitled Pipeline';
    try {
      const p = await api.pipelines.create(currentProjectId, {
        name,
        pipeline_type: newType,
      });
      setPipelines([...pipelines, p]);
      await handleSwitch(p.id, p);
    } catch { /* ignore */ } finally {
      setCreating(false);
      setNewName('');
      setNewType('custom');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (pipelines.length <= 1) return; // always keep at least one
    const updated = pipelines.filter((p) => p.id !== id);
    setPipelines(updated);
    if (currentPipelineId === id) {
      await handleSwitch(updated[0].id, updated[0]);
    }
    await api.pipelines.remove(currentProjectId, id).catch(() => {});
  };

  return (
    <div className="w-52 border-r border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          <span>Pipelines</span>
        </button>
        <button
          onClick={() => setCreating(true)}
          className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="New pipeline"
        >
          <Plus size={13} />
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto py-1">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader size={14} className="animate-spin text-gray-400" />
            </div>
          ) : (
            pipelines.map((p) => {
              const meta = TYPE_META[p.pipeline_type] ?? TYPE_META.custom;
              const isActive = p.id === currentPipelineId;
              const isLoading = switching === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitch(p.id, p)}
                  className={`group w-full text-left px-3 py-2.5 transition-colors ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium truncate flex-1 mr-1 ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {p.name}
                    </span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isLoading && <Loader size={10} className="animate-spin text-indigo-500" />}
                      {pipelines.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                </button>
              );
            })
          )}

          {/* Create form */}
          {creating && (
            <div className="mx-2 mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                placeholder="Pipeline name…"
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1 mb-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {PIPELINE_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_META[t].label}</option>
                ))}
              </select>
              <div className="flex space-x-1.5">
                <button onClick={handleCreate}
                  className="flex-1 py-1 text-[11px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors">
                  Create
                </button>
                <button onClick={() => setCreating(false)}
                  className="flex-1 py-1 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
