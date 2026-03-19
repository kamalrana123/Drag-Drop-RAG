import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const TABS = ['Raw Output', 'Formatted', 'Stats'];

const FormattedView = ({ nodeType, output }) => {
  if (!output) return <p className="text-xs text-gray-400 italic">No output data.</p>;

  if (nodeType === 'Chunker' || nodeType === 'SemanticSplitter' || nodeType === 'MetadataExtractor') {
    const chunks = Array.isArray(output) ? output : output.chunks ?? [];
    if (chunks.length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{chunks.length} chunks generated</p>
          {chunks.slice(0, 5).map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-[11px] text-gray-600 border border-gray-100">
              <span className="font-semibold text-gray-400 mr-1">[{i + 1}]</span>
              {typeof c === 'string' ? c.slice(0, 200) : JSON.stringify(c).slice(0, 200)}
              {(typeof c === 'string' ? c.length : JSON.stringify(c).length) > 200 && '…'}
            </div>
          ))}
          {chunks.length > 5 && <p className="text-[11px] text-gray-400 text-center">+ {chunks.length - 5} more chunks</p>}
        </div>
      );
    }
  }

  if (['VectorRetriever', 'HybridRetriever', 'ParentDocRetriever', 'BM25Retriever', 'EnsembleRetriever'].includes(nodeType)) {
    const docs = Array.isArray(output) ? output : output.documents ?? output.results ?? [];
    if (docs.length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{docs.length} documents retrieved</p>
          {docs.slice(0, 5).map((d, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-indigo-500">Doc {i + 1}</span>
                {d.score !== undefined && <span className="text-[10px] text-gray-400">score: {d.score?.toFixed(3)}</span>}
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {(d.content ?? d.text ?? JSON.stringify(d)).slice(0, 200)}…
              </p>
            </div>
          ))}
        </div>
      );
    }
  }

  if (['LLMResponse', 'Summarizer', 'StreamingResponse', 'CitationGenerator'].includes(nodeType)) {
    const answer = output.answer ?? output.text ?? output.content ?? JSON.stringify(output);
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Generated Answer</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
      </div>
    );
  }

  return (
    <pre className="text-[11px] text-gray-600 whitespace-pre-wrap break-words font-mono bg-gray-50 rounded-xl p-3 leading-relaxed border border-gray-100">
      {JSON.stringify(output, null, 2).slice(0, 1000)}
    </pre>
  );
};

const StatsView = ({ output, duration }) => {
  const keys = output ? Object.keys(output) : [];
  return (
    <div className="space-y-3">
      {duration && (
        <div className="flex justify-between text-xs py-2 border-b border-gray-100">
          <span className="text-gray-500 font-medium">Duration</span>
          <span className="text-gray-700 font-semibold">{duration}ms</span>
        </div>
      )}
      {Array.isArray(output) && (
        <div className="flex justify-between text-xs py-2 border-b border-gray-100">
          <span className="text-gray-500 font-medium">Items</span>
          <span className="text-gray-700 font-semibold">{output.length}</span>
        </div>
      )}
      {output && typeof output === 'object' && !Array.isArray(output) && (
        <div className="flex justify-between text-xs py-2 border-b border-gray-100">
          <span className="text-gray-500 font-medium">Output keys</span>
          <span className="text-gray-700 font-semibold">{keys.join(', ') || '—'}</span>
        </div>
      )}
      {keys.length === 0 && !Array.isArray(output) && (
        <p className="text-xs text-gray-400 italic text-center py-4">No stats available.</p>
      )}
    </div>
  );
};

const DataPreviewDrawer = ({ nodeType, nodeLabel, outputData, onClose }) => {
  const [tab, setTab] = useState(0);
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  if (!outputData) return null;

  const rawFormatted = JSON.stringify(outputData.output, null, 2) ?? '';

  const copyRaw = () => {
    navigator.clipboard.writeText(rawFormatted).catch(() => {});
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-10 transition-all duration-300 ${drawerExpanded ? 'h-96' : 'h-56'}`}>
      {/* Drawer header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <button onClick={() => setDrawerExpanded(!drawerExpanded)} className="text-gray-400 hover:text-gray-600 transition-colors">
            {drawerExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <span className="text-sm font-semibold text-gray-700">{nodeLabel} — Output Preview</span>
          <span className="text-[11px] text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">{nodeType}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={copyRaw} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Copy raw output">
            <Copy size={13} />
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${tab === i ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: drawerExpanded ? '280px' : '128px' }}>
        {tab === 0 && (
          <pre className="text-[11px] text-gray-600 whitespace-pre-wrap break-words font-mono leading-relaxed">
            {rawFormatted.slice(0, 3000)}
            {rawFormatted.length > 3000 && '\n… (truncated)'}
          </pre>
        )}
        {tab === 1 && <FormattedView nodeType={nodeType} output={outputData.output} />}
        {tab === 2 && <StatsView output={outputData.output} duration={outputData.duration} />}
      </div>
    </div>
  );
};

export default DataPreviewDrawer;
