import React, { useState } from 'react';
import { 
  FileText, Database, Filter, MessageSquare, HelpCircle, 
  Settings, Scan, Scissors, Tags, Globe, Cloud, Search, 
  Layout, Zap, ListFilter, BrainCircuit, Sparkles, Hash
} from 'lucide-react';

const SidebarItem = ({ type, label, icon: Icon, color }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center space-x-3 p-2.5 bg-white border border-gray-100 rounded-lg cursor-grab hover:border-indigo-400 hover:shadow-sm transition-all group"
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      <div className={`p-1.5 rounded bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
        <Icon size={16} className={`text-${color}-600`} />
      </div>
      <div className="text-[13px] font-medium text-gray-700 truncate">{label}</div>
    </div>
  );
};

const Category = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-2">
      {children}
    </div>
  </div>
);

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <Category title="Data Ingestion">
          <SidebarItem type="FileSource" label="File Upload" icon={FileText} color="blue" />
          <SidebarItem type="WebSource" label="Web Crawler" icon={Globe} color="blue" />
          <SidebarItem type="S3Source" label="S3 Storage" icon={Cloud} color="blue" />
        </Category>

        <Category title="Document Extraction">
          <SidebarItem type="DocumentExtraction" label="Unified Extractor" icon={Scan} color="amber" />
          <SidebarItem type="OCRProcessor" label="OCR Processor" icon={Layout} color="amber" />
          <SidebarItem type="MarkdownConverter" label="MD Converter" icon={Hash} color="amber" />
        </Category>

        <Category title="Text Enrichment">
          <SidebarItem type="Chunker" label="Text Chunker" icon={Scissors} color="emerald" />
          <SidebarItem type="MetadataExtractor" label="Metadata" icon={Tags} color="emerald" />
          <SidebarItem type="SemanticSplitter" label="Semantic Split" icon={BrainCircuit} color="emerald" />
        </Category>

        <Category title="Vector Storage">
          <SidebarItem type="VectorStore" label="Qdrant DB" icon={Database} color="green" />
          <SidebarItem type="ChromaDBStore" label="ChromaDB" icon={Database} color="green" />
        </Category>

        <Category title="Retrieval & Search">
          <SidebarItem type="VectorRetriever" label="Vector Search" icon={Zap} color="cyan" />
          <SidebarItem type="HybridRetriever" label="Hybrid Search" icon={ListFilter} color="cyan" />
        </Category>

        <Category title="Rerankers">
          <SidebarItem type="Reranker" label="FlashRank" icon={Filter} color="orange" />
          <SidebarItem type="CohereRerank" label="Cohere Rerank" icon={Sparkles} color="orange" />
        </Category>

        <Category title="LLMs & Generation">
          <SidebarItem type="LLMResponse" label="Chat Response" icon={MessageSquare} color="purple" />
          <SidebarItem type="Summarizer" label="Summarizer" icon={Zap} color="purple" />
        </Category>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <HelpCircle size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Quick Tip</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Drag nodes to the canvas and connect the handles to define your RAG logic.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
