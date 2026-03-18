import React from 'react';
import { FileText, Database, Filter, MessageSquare, HelpCircle } from 'lucide-react';

const SidebarItem = ({ type, label, icon: Icon, color }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-indigo-500 hover:shadow-sm transition-all group"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className={`p-2 rounded bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">RAG Component</div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Ingestion Nodes
        </h2>
        <div className="space-y-3 mb-6">
          <SidebarItem type="FileSource" label="Document Source" icon={FileText} color="blue" />
          <SidebarItem type="OCREngine" label="OCR Engine" icon={Settings} color="amber" />
          <SidebarItem type="Chunker" label="Text Chunker" icon={Filter} color="emerald" />
          <SidebarItem type="MetadataExtractor" label="Metadata Extractor" icon={Database} color="indigo" />
          <SidebarItem type="VectorStore" label="Vector DB (Qdrant)" icon={Database} color="green" />
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Retrieval Nodes
        </h2>
        <div className="space-y-3">
          <SidebarItem type="Reranker" label="Reranker (FlashRank)" icon={Filter} color="orange" />
          <SidebarItem type="LLMResponse" label="LLM Response" icon={MessageSquare} color="purple" />
        </div>
      </div>

      <div className="mt-auto bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">How to use</span>
        </div>
        <p className="text-xs text-indigo-700 leading-relaxed">
          Drag components from this sidebar onto the canvas and connect them to build your RAG pipeline.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
