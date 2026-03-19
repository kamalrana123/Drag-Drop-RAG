import { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { NODE_PORT_SPECS } from '../constants/portTypes';
import { buildHandles } from '../utils/portHelpers';

const STATUS_CONFIG = {
  running: { icon: Loader2, bg: 'bg-blue-100',  text: 'text-blue-600',  label: 'Running', spin: true },
  done:    { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
  error:   { icon: XCircle, bg: 'bg-red-100',   text: 'text-red-700',   label: 'Error' },
};

const BaseNode = ({ id, data, icon: Icon, color, description }) => {
  const config = data.config || {};
  const executionStatus = useStore((s) => s.nodeExecutionStatus[id]);
  const updateNodeInternals = useUpdateNodeInternals();

  const specs = NODE_PORT_SPECS[data.type] ?? { inputs: ['any'], outputs: ['any'] };

  const inputHandles = buildHandles(specs.inputs, 'target');

  // For PromptNode in JSON mode — generate one output handle per schema field
  const outputHandles = (() => {
    if (data.type === 'PromptNode' && config.outputType === 'json' && config.jsonSchema) {
      try {
        const fields = Object.keys(JSON.parse(config.jsonSchema));
        if (fields.length > 0) {
          return fields.map((field) => ({
            id: `source-any-${field}`,
            portType: 'any',
            label: field,
            color: '#9ca3af',
          }));
        }
      } catch { /* invalid JSON — fall through to static spec */ }
    }
    return buildHandles(specs.outputs, 'source');
  })();

  const outputHandleIds = outputHandles.map((h) => h.id).join(',');

  // Tell ReactFlow to re-measure handles when dynamic count / IDs change
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, outputHandleIds, inputHandles.length, updateNodeInternals]);

  const statusCfg = STATUS_CONFIG[executionStatus];
  const StatusIcon = statusCfg?.icon;

  return (
    <div className={`relative px-4 py-3 shadow-xl rounded-xl bg-white border-2 border-${color}-500 min-w-[220px] transition-all hover:shadow-2xl`}>
      {/* Execution status badge */}
      {statusCfg && (
        <div className={`absolute -top-2 -right-2 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${statusCfg.bg} ${statusCfg.text} border border-white shadow-sm`}>
          <StatusIcon size={10} className={statusCfg.spin ? 'animate-spin' : ''} />
          <span>{statusCfg.label}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-gray-100 pb-2 mb-2">
        <div className={`p-2 bg-${color}-50 rounded-lg flex-shrink-0`}>
          {Icon && <Icon size={18} className={`text-${color}-600`} />}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-gray-800 tracking-tight truncate">{data.label}</div>
          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{data.type}</div>
        </div>
      </div>

      {/* Config Summary */}
      <div className="space-y-1">
        {description && <p className="text-[10px] text-gray-500 italic mb-1.5 leading-tight">{description}</p>}
        <div className="bg-gray-50 rounded-md p-1.5 space-y-1">
          {Object.entries(config).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-[9px]">
              <span className="text-gray-400 font-medium truncate max-w-[80px]">{key}:</span>
              <span className="text-gray-600 font-bold truncate max-w-[90px]">
                {Array.isArray(value)
                  ? value.join(', ')
                  : typeof value === 'boolean'
                  ? (value ? 'Yes' : 'No')
                  : String(value)}
              </span>
            </div>
          ))}
          {Object.keys(config).length === 0 && (
            <div className="text-[9px] text-gray-400 italic text-center py-1">Default settings</div>
          )}
        </div>
      </div>

      {/* Input handles (left side) */}
      {inputHandles.map((h, i) => (
        <Handle
          key={h.id}
          id={h.id}
          type="target"
          position={Position.Left}
          style={{
            top: `${((i + 1) / (inputHandles.length + 1)) * 100}%`,
            background: h.color,
            width: 10,
            height: 10,
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          title={`Input: ${h.label}`}
        />
      ))}

      {/* Output handles (right side) */}
      {outputHandles.map((h, i) => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={Position.Right}
          style={{
            top: `${((i + 1) / (outputHandles.length + 1)) * 100}%`,
            background: h.color,
            width: 10,
            height: 10,
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
          title={`Output: ${h.label}`}
        />
      ))}

      {/* Field-name labels for JSON schema outputs */}
      {data.type === 'PromptNode' && config.outputType === 'json' && outputHandles.length > 0 && (
        outputHandles.map((h, i) => (
          <div
            key={`lbl-${h.id}`}
            className="absolute pointer-events-none"
            style={{
              top: `${((i + 1) / (outputHandles.length + 1)) * 100}%`,
              right: '14px',
              transform: 'translateY(-50%)',
            }}
          >
            <span className="text-[8px] font-mono font-semibold text-gray-400 bg-gray-50 px-1 rounded">
              {h.label}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default BaseNode;
