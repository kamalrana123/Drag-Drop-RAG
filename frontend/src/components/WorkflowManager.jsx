import { useState, useRef } from 'react';
import { useModal } from '../hooks/useModal';
import { ResultModal } from './modals';
import { X, Download, Upload, Trash2, FolderOpen, LayoutTemplate, Save, Edit2, Check } from 'lucide-react';
import ModalPortal from './modals/ModalPortal';
import { useStore } from '../store';
import { PIPELINE_TEMPLATES } from '../constants/pipelineTemplates';
import {
  serializePipeline, deserializePipeline, exportToJSON, importFromJSON,
} from '../utils/pipelineSerialization';
import {
  getSavedPipelines, savePipeline, deletePipeline, renamePipeline,
} from '../utils/persistence';

const TABS = ['Templates', 'Saved Pipelines', 'Import / Export'];

const WorkflowManager = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState(0);
  const [savedList, setSavedList] = useState(() => getSavedPipelines());
  const [saveNameInput, setSaveNameInput] = useState('');
  const [renamingIdx, setRenamingIdx] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef(null);
  const errorModal = useModal();

  const { nodes, edges, loadPipeline } = useStore();

  const refresh = () => setSavedList(getSavedPipelines());

  const handleLoadTemplate = (template) => {
    const { nodes: n, edges: e } = deserializePipeline(template.pipeline);
    loadPipeline(n, e);
    onClose();
  };

  const handleSaveCurrent = () => {
    const name = saveNameInput.trim();
    if (!name) return;
    savePipeline(name, serializePipeline(nodes, edges));
    setSaveNameInput('');
    refresh();
  };

  const handleLoadSaved = (entry) => {
    const { nodes: n, edges: e } = deserializePipeline(entry.pipeline);
    loadPipeline(n, e);
    onClose();
  };

  const handleDelete = (name) => { deletePipeline(name); refresh(); };

  const handleExport = (entry) => {
    exportToJSON(entry.pipeline, `${entry.name.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  const handleExportCurrent = () => {
    exportToJSON(serializePipeline(nodes, edges));
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const json = await importFromJSON(file);
      const { nodes: n, edges: eg } = deserializePipeline(json);
      loadPipeline(n, eg);
      onClose();
    } catch (err) {
      errorModal.open({ title: 'Import Failed', content: err.message, variant: 'error' });
    }
    e.target.value = '';
  };

  const commitRename = (oldName) => {
    const newName = renameValue.trim();
    if (newName && newName !== oldName) renamePipeline(oldName, newName);
    setRenamingIdx(null);
    refresh();
  };

  return (
    <>
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Workflow Manager</h2>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === i ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Templates Tab */}
            {tab === 0 && (
              <div className="grid grid-cols-1 gap-4">
                {PIPELINE_TEMPLATES.map((tpl) => (
                  <div key={tpl.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0 mt-0.5">
                        <LayoutTemplate size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{tpl.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tpl.description}</div>
                        <div className="text-[11px] text-gray-400 mt-1">{tpl.nodeCount} nodes</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(tpl)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0 ml-4"
                    >
                      <FolderOpen size={12} />
                      <span>Load</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Pipelines Tab */}
            {tab === 1 && (
              <div className="space-y-4">
                {/* Save current */}
                <div className="flex space-x-2 mb-4">
                  <input
                    value={saveNameInput}
                    onChange={(e) => setSaveNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
                    placeholder="Pipeline name…"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={handleSaveCurrent}
                    disabled={!saveNameInput.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Save size={13} /><span>Save</span>
                  </button>
                </div>

                {savedList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Save size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No saved pipelines yet.</p>
                  </div>
                ) : (
                  savedList.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          <Save size={14} className="text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          {renamingIdx === i ? (
                            <div className="flex items-center space-x-1">
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(entry.name); if (e.key === 'Escape') setRenamingIdx(null); }}
                                className="text-sm border border-indigo-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              <button onClick={() => commitRename(entry.name)} className="text-indigo-500 hover:text-indigo-700"><Check size={14} /></button>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-800 truncate">{entry.name}</div>
                          )}
                          <div className="text-[11px] text-gray-400">Saved {new Date(entry.savedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <button onClick={() => handleLoadSaved(entry)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Load"><FolderOpen size={14} /></button>
                        <button onClick={() => { setRenamingIdx(i); setRenameValue(entry.name); }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Rename"><Edit2 size={14} /></button>
                        <button onClick={() => handleExport(entry)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Export JSON"><Download size={14} /></button>
                        <button onClick={() => handleDelete(entry.name)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Import / Export Tab */}
            {tab === 2 && (
              <div className="space-y-6">
                <div className="p-5 border border-gray-100 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Export Current Pipeline</h3>
                  <p className="text-xs text-gray-500 mb-4">Download the current canvas as a JSON file.</p>
                  <button
                    onClick={handleExportCurrent}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download size={14} /><span>Export as JSON</span>
                  </button>
                </div>

                <div className="p-5 border border-dashed border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Import Pipeline</h3>
                  <p className="text-xs text-gray-500 mb-4">Load a previously exported pipeline JSON file. This will replace the current canvas.</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload size={14} /><span>Import from File</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
    <ResultModal
      isOpen={errorModal.isOpen}
      {...errorModal.props}
      onClose={errorModal.close}
    />
    </>
  );
};

export default WorkflowManager;
