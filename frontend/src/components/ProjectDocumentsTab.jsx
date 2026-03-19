import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, Trash2, File, FileImage, FileCode, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import api from '../utils/api';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-gray-100 text-gray-600',    icon: <Clock size={11} /> },
  processing: { label: 'Processing', color: 'bg-amber-100 text-amber-600',  icon: <Clock size={11} className="animate-spin" /> },
  indexed:    { label: 'Indexed',    color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={11} /> },
  error:      { label: 'Error',      color: 'bg-red-100 text-red-600',      icon: <AlertCircle size={11} /> },
};

function getFileIcon(type) {
  if (type?.startsWith('image/')) return <FileImage size={16} className="text-pink-500" />;
  if (type === 'application/pdf') return <FileText size={16} className="text-red-500" />;
  if (type?.includes('code') || type?.includes('json') || type?.includes('xml'))
    return <FileCode size={16} className="text-blue-500" />;
  return <File size={16} className="text-gray-400" />;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


export default function ProjectDocumentsTab() {
  const { currentProjectId } = useStore();
  const [docs, setDocs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadDocs = useCallback(() => {
    if (!currentProjectId) return;
    api.documents.list(currentProjectId).then(setDocs).catch(() => {});
  }, [currentProjectId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const pollStatus = useCallback((docId) => {
    const timer = setInterval(async () => {
      try {
        const { status } = await api.documents.status(currentProjectId, docId);
        setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, status } : d));
        if (status !== 'pending' && status !== 'processing') clearInterval(timer);
      } catch {
        clearInterval(timer);
      }
    }, 2000);
  }, [currentProjectId]);

  const handleFiles = async (files) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const doc = await api.documents.upload(currentProjectId, file);
        setDocs((prev) => [...prev, doc]);
        if (doc.status === 'pending' || doc.status === 'processing') pollStatus(doc.id);
      } catch { /* ignore individual failures */ }
    }
    setUploading(false);
  };

  const handleDelete = async (docId) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    await api.documents.remove(currentProjectId, docId).catch(() => {});
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload source documents for this project. Files are stored server-side and indexed into the vector store.
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${dragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <Upload size={20} className={dragging ? 'text-indigo-600' : 'text-gray-400'} />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {uploading ? 'Uploading…' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, CSV, JSON, and more</p>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
        </div>

        {/* Documents table */}
        {docs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {docs.map((doc) => {
                const status = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
                return (
                  <div key={doc.id} className="flex items-center px-5 py-3.5 hover:bg-gray-50 group transition-colors">
                    <div className="flex-shrink-0 mr-3">{getFileIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full mr-4 ${status.color}`}>
                      {status.icon}
                      <span>{status.label}</span>
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {docs.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
