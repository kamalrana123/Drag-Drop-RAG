import React from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ id, data, icon: Icon, color, description, children }) => {
  const config = data.config || {};

  return (
    <div className={`px-4 py-3 shadow-xl rounded-xl bg-white border-2 border-${color}-500 min-w-[220px] transition-all hover:shadow-2xl`}>
      <div className="flex items-center space-x-3 border-b border-gray-100 pb-2 mb-2">
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          {Icon && <Icon size={20} className={`text-${color}-600`} />}
        </div>
        <div>
          <div className="text-[13px] font-bold text-gray-800 tracking-tight">{data.label}</div>
          <div className="text-[10px] text-gray-400 font-medium uppercase">{data.type}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        {description && <p className="text-[10px] text-gray-500 italic mb-2">{description}</p>}
        
        {/* Config Summary */}
        <div className="bg-gray-50 rounded-md p-1.5 space-y-1">
          {Object.entries(config).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-[9px]">
              <span className="text-gray-400 font-medium">{key}:</span>
              <span className="text-gray-600 font-bold truncate max-w-[80px]">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </span>
            </div>
          ))}
          {Object.keys(config).length === 0 && (
            <div className="text-[9px] text-gray-400 italic text-center py-1">Default settings</div>
          )}
        </div>
      </div>

      {children}

      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 !bg-${color}-500 !border-2 !border-white shadow-sm`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 !bg-${color}-500 !border-2 !border-white shadow-sm`}
      />
    </div>
  );
};

export default BaseNode;
