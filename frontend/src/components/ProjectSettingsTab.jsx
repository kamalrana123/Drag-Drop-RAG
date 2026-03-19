import { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { updateProjectMeta, deleteProject } from '../utils/persistence';
import { ConfirmModal } from './modals';

export default function ProjectSettingsTab({ project }) {
  const { closeProject } = useStore();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProjectMeta(project.id, name.trim(), description.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    closeProject();
  };

  const nodeCount = project.pipeline?.nodes?.length ?? 0;
  const edgeCount = project.pipeline?.edges?.length ?? 0;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* General */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-5">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this project for?"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white'
              }`}
            >
              <Save size={14} />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Pipeline info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">Nodes</p>
              <p className="text-lg font-bold text-gray-900">{nodeCount}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">Connections</p>
              <p className="text-lg font-bold text-gray-900">{edgeCount}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <h3 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h3>
          <p className="text-xs text-gray-500 mb-4">
            Permanently delete this project and all its data. This cannot be undone.
          </p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-200 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete Project</span>
          </button>
        </div>

      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All pipeline data and document metadata will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
