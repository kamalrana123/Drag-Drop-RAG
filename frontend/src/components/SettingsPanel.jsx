import React from 'react';
import { useStore } from '../store';
import { 
  X, Settings, Scan, Scissors, Tags, FileText, 
  Database, Filter, MessageSquare, Globe, Cloud,
  Layout, Zap, ListFilter, BrainCircuit, Sparkles, Hash
} from 'lucide-react';

const SettingsPanel = () => {
  const { selectedNode, setSelectedNode, updateNodeData, nodes } = useStore();
  
  if (!selectedNode) return null;
  
  const node = nodes.find(n => n.id === selectedNode.id);
  if (!node) return null;

  const handleConfigChange = (key, value) => {
    const currentConfig = node.data.config || {};
    updateNodeData(node.id, {
      config: { ...currentConfig, [key]: value }
    });
  };

  const renderConfigFields = () => {
    const config = node.data.config || {};
    
    switch (node.type) {
      case 'FileSource':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">File Types</label>
              <div className="flex flex-wrap gap-2">
                {['.pdf', '.txt', '.docx', '.md'].map(ext => (
                  <label key={ext} className="flex items-center space-x-1">
                    <input 
                      type="checkbox" 
                      checked={(config.extensions || ['.pdf', '.txt']).includes(ext)}
                      onChange={(e) => {
                        const exts = config.extensions || ['.pdf', '.txt'];
                        if (e.target.checked) handleConfigChange('extensions', [...exts, ext]);
                        else handleConfigChange('extensions', exts.filter(x => x !== ext));
                      }}
                      className="rounded text-indigo-600 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">{ext}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'WebSource':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target URL</label>
              <input 
                type="text" 
                placeholder="https://example.com"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Depth</label>
              <input 
                type="number" 
                value={config.depth || 1}
                onChange={(e) => handleConfigChange('depth', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'S3Source':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bucket Name</label>
              <input 
                type="text" 
                value={config.bucket || ''}
                onChange={(e) => handleConfigChange('bucket', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prefix / Path</label>
              <input 
                type="text" 
                value={config.prefix || ''}
                onChange={(e) => handleConfigChange('prefix', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'DocumentExtraction':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Strategy</label>
              <select 
                value={config.strategy || 'simple'} 
                onChange={(e) => handleConfigChange('strategy', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              >
                <option value="simple">Simple Text</option>
                <option value="layout">Layout-Aware</option>
                <option value="markdown">Markdown</option>
                <option value="ocr">OCR Only</option>
              </select>
            </div>
          </div>
        );

      case 'OCRProcessor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">OCR Engine</label>
              <select 
                value={config.engine || 'tesseract'} 
                onChange={(e) => handleConfigChange('engine', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              >
                <option value="tesseract">Tesseract</option>
                <option value="easyocr">EasyOCR</option>
                <option value="paddle">PaddleOCR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
              <input 
                type="text" 
                value={config.lang || 'eng'}
                onChange={(e) => handleConfigChange('lang', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'Chunker':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Strategy</label>
              <select 
                value={config.strategy || 'recursive'} 
                onChange={(e) => handleConfigChange('strategy', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              >
                <option value="recursive">Recursive</option>
                <option value="sentence">Sentence</option>
                <option value="token">Token</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chunk Size</label>
              <input 
                type="number" 
                value={config.chunkSize || 512}
                onChange={(e) => handleConfigChange('chunkSize', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Overlap</label>
              <input 
                type="number" 
                value={config.chunkOverlap || 50}
                onChange={(e) => handleConfigChange('chunkOverlap', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'SemanticSplitter':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Embedding Model</label>
              <select 
                value={config.embedModel || 'text-embedding-3-small'} 
                onChange={(e) => handleConfigChange('embedModel', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              >
                <option value="text-embedding-3-small">OpenAI Small</option>
                <option value="text-embedding-3-large">OpenAI Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buffer Size</label>
              <input 
                type="number" 
                value={config.bufferSize || 1}
                onChange={(e) => handleConfigChange('bufferSize', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        );

      case 'VectorStore':
      case 'ChromaDBStore':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Collection Name</label>
              <input 
                type="text" 
                value={config.collection || 'default'}
                onChange={(e) => handleConfigChange('collection', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            {node.type === 'VectorStore' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Qdrant URL</label>
                <input 
                  type="text" 
                  value={config.url || 'http://localhost:6333'}
                  onChange={(e) => handleConfigChange('url', e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-md p-2"
                />
              </div>
            )}
          </div>
        );

      case 'VectorRetriever':
      case 'HybridRetriever':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Top K</label>
              <input 
                type="number" 
                value={config.topK || 5}
                onChange={(e) => handleConfigChange('topK', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            {node.type === 'HybridRetriever' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alpha (0=BM25, 1=Vector)</label>
                <input 
                  type="range" min="0" max="1" step="0.1"
                  value={config.alpha || 0.5}
                  onChange={(e) => handleConfigChange('alpha', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        );

      case 'Reranker':
      case 'CohereRerank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Top N</label>
              <input 
                type="number" 
                value={config.topN || 3}
                onChange={(e) => handleConfigChange('topN', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              />
            </div>
            {node.type === 'CohereRerank' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cohere API Key</label>
                <input 
                  type="password" 
                  value={config.apiKey || ''}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="w-full text-sm border-gray-300 rounded-md p-2"
                />
              </div>
            )}
          </div>
        );

      case 'LLMResponse':
      case 'Summarizer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
              <select 
                value={config.model || 'gpt-4o'} 
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temperature</label>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            {node.type === 'LLMResponse' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">System Prompt</label>
                <textarea 
                  value={config.systemPrompt || ''}
                  onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                  rows={4}
                  className="w-full text-sm border-gray-300 rounded-md p-2"
                  placeholder="You are a helpful assistant..."
                />
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-xs text-gray-500 italic">Settings for {node.type} coming soon.</p>;
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'FileSource': return <FileText size={18} />;
      case 'WebSource': return <Globe size={18} />;
      case 'S3Source': return <Cloud size={18} />;
      case 'DocumentExtraction': return <Scan size={18} />;
      case 'OCRProcessor': return <Layout size={18} />;
      case 'MarkdownConverter': return <Hash size={18} />;
      case 'Chunker': return <Scissors size={18} />;
      case 'MetadataExtractor': return <Tags size={18} />;
      case 'SemanticSplitter': return <BrainCircuit size={18} />;
      case 'VectorStore': return <Database size={18} />;
      case 'ChromaDBStore': return <Database size={18} />;
      case 'VectorRetriever': return <Zap size={18} />;
      case 'HybridRetriever': return <ListFilter size={18} />;
      case 'Reranker': return <Filter size={18} />;
      case 'CohereRerank': return <Sparkles size={18} />;
      case 'LLMResponse': return <MessageSquare size={18} />;
      case 'Summarizer': return <Zap size={18} />;
      default: return <Settings size={18} />;
    }
  };

  const getColorClass = () => {
    const blue = 'text-blue-600 bg-blue-50';
    const amber = 'text-amber-600 bg-amber-50';
    const emerald = 'text-emerald-600 bg-emerald-50';
    const green = 'text-green-600 bg-green-50';
    const cyan = 'text-cyan-600 bg-cyan-50';
    const orange = 'text-orange-600 bg-orange-50';
    const purple = 'text-purple-600 bg-purple-50';

    switch (node.type) {
      case 'FileSource': case 'WebSource': case 'S3Source': return blue;
      case 'DocumentExtraction': case 'OCRProcessor': case 'MarkdownConverter': return amber;
      case 'Chunker': case 'MetadataExtractor': case 'SemanticSplitter': return emerald;
      case 'VectorStore': case 'ChromaDBStore': return green;
      case 'VectorRetriever': case 'HybridRetriever': return cyan;
      case 'Reranker': case 'CohereRerank': return orange;
      case 'LLMResponse': case 'Summarizer': return purple;
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded ${getColorClass()}`}>
            {getIcon()}
          </div>
          <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">{node.data.label}</h2>
        </div>
        <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        <div className="mb-6">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Type</div>
          <div className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">{node.type}</div>
        </div>
        
        <div className="mb-6">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-4 tracking-widest border-b pb-1">Configuration</div>
          {renderConfigFields()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
