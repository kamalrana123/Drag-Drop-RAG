import { useMemo, useState } from 'react';
import { AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store';
import { validatePipeline } from '../utils/pipelineGraph';

const ValidationBanner = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => validatePipeline(nodes, edges), [nodes, edges]);

  // Nothing to show
  if (nodes.length === 0) return null;
  if (result.errors.length === 0 && result.warnings.length === 0) return null;

  const hasErrors = result.errors.length > 0;
  const items = hasErrors ? result.errors : result.warnings;
  const isError = hasErrors;

  return (
    <div
      className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 rounded-xl border shadow-lg max-w-md w-full mx-4 text-sm overflow-hidden transition-all
        ${isError ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-left
          ${isError ? 'text-red-700 hover:bg-red-100' : 'text-amber-700 hover:bg-amber-100'} transition-colors`}
      >
        <div className="flex items-center space-x-2">
          {isError
            ? <XCircle size={15} className="text-red-500 flex-shrink-0" />
            : <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
          }
          <span className="text-xs font-semibold">
            {isError
              ? `${result.errors.length} pipeline error${result.errors.length > 1 ? 's' : ''}`
              : `${result.warnings.length} warning${result.warnings.length > 1 ? 's' : ''}`
            }
            {!expanded && ` — ${items[0]}`}
          </span>
        </div>
        {items.length > 1 && (
          expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />
        )}
      </button>

      {expanded && (
        <ul className={`px-4 pb-3 space-y-1.5 border-t ${isError ? 'border-red-200' : 'border-amber-200'}`}>
          {items.map((msg, i) => (
            <li key={i} className={`text-xs flex items-start space-x-1.5 pt-1.5 ${isError ? 'text-red-700' : 'text-amber-700'}`}>
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ValidationBanner;
