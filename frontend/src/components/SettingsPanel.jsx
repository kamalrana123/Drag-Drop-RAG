import React from 'react';
import { useStore } from '../store';
import { X, Settings, Scan, Scissors, Tags, FileText, Database, Filter, MessageSquare } from 'lucide-react';

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
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">{ext}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'OCREngine':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">OCR Engine</label>
              <select 
                value={config.engine || 'tesseract'} 
                onChange={(e) => handleConfigChange('engine', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="tesseract">Tesseract (Local)</option>
                <option value="unstructured">Unstructured.io</option>
                <option value="easyocr">EasyOCR</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={config.preserveLayout || false}
                onChange={(e) => handleConfigChange('preserveLayout', e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label className="text-xs text-gray-700 font-medium">Preserve Layout</label>
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
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="recursive">Recursive Character</option>
                <option value="sentence">Sentence Splitter</option>
                <option value="semantic">Semantic Splitter</option>
                <option value="token">Token Splitter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chunk Size</label>
              <input 
                type="number" 
                value={config.chunkSize || 512}
                onChange={(e) => handleConfigChange('chunkSize', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chunk Overlap</label>
              <input 
                type="number" 
                value={config.chunkOverlap || 50}
                onChange={(e) => handleConfigChange('chunkOverlap', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'MetadataExtractor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Extraction Fields</label>
              <div className="space-y-2">
                {['Summary', 'Keywords', 'Entities', 'Questions'].map(field => (
                  <label key={field} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={(config.fields || ['Summary']).includes(field)}
                      onChange={(e) => {
                        const fields = config.fields || ['Summary'];
                        if (e.target.checked) handleConfigChange('fields', [...fields, field]);
                        else handleConfigChange('fields', fields.filter(f => f !== field));
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LLM for Extraction</label>
              <select 
                value={config.extractorLlm || 'gpt-4o'} 
                onChange={(e) => handleConfigChange('extractorLlm', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>
        );

      case 'VectorStore':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Collection Name</label>
              <input 
                type="text" 
                placeholder="e.g., my_docs"
                value={config.collectionName || ''}
                onChange={(e) => handleConfigChange('collectionName', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'Reranker':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Top N Results</label>
              <input 
                type="number" 
                value={config.topN || 5}
                onChange={(e) => handleConfigChange('topN', parseInt(e.target.value))}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 'LLMResponse':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Model</label>
              <select 
                value={config.model || 'gpt-4o'} 
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gemini-pro">Gemini Pro</option>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">System Prompt</label>
              <textarea 
                value={config.systemPrompt || ''}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                rows={3}
                placeholder="You are a helpful assistant..."
                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      default:
        return <p className="text-xs text-gray-500 italic">No specific settings for this node.</p>;
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'FileSource': return <FileText size={18} />;
      case 'OCREngine': return <Scan size={18} />;
      case 'Chunker': return <Scissors size={18} />;
      case 'MetadataExtractor': return <Tags size={18} />;
      case 'VectorStore': return <Database size={18} />;
      case 'Reranker': return <Filter size={18} />;
      case 'LLMResponse': return <MessageSquare size={18} />;
      default: return <Settings size={18} />;
    }
  };

  const getColorClass = () => {
    switch (node.type) {
      case 'FileSource': return 'text-blue-600 bg-blue-50';
      case 'OCREngine': return 'text-amber-600 bg-amber-50';
      case 'Chunker': return 'text-emerald-600 bg-emerald-50';
      case 'MetadataExtractor': return 'text-indigo-600 bg-indigo-50';
      case 'VectorStore': return 'text-green-600 bg-green-50';
      case 'Reranker': return 'text-orange-600 bg-orange-50';
      case 'LLMResponse': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded ${getColorClass()}`}>
            {getIcon()}
          </div>
          <h2 className="text-sm font-semibold text-gray-800">{node.data.label}</h2>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        <div className="mb-6">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Node ID</div>
          <div className="text-xs font-mono bg-gray-100 p-1.5 rounded border border-gray-200 text-gray-600 truncate">{node.id}</div>
        </div>
        
        <div className="mb-6">
          <div className="text-[10px] uppercase font-bold text-gray-400 mb-4 tracking-wider">Configuration</div>
          {renderConfigFields()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
