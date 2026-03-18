import React from 'react';
import { Handle, Position } from 'reactflow';

const BaseNode = ({ id, data, icon: Icon, color, children }) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-${color}-500 min-w-[200px]`}>
      <div className="flex items-center space-x-2 border-b pb-2 mb-2">
        <div className={`p-1 bg-${color}-100 rounded`}>
          {Icon && <Icon size={18} className={`text-${color}-600`} />}
        </div>
        <div className="text-sm font-bold text-gray-800">{data.label}</div>
      </div>
      
      <div className="text-xs text-gray-600">
        {children}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`w-2 h-2 !bg-${color}-500`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-2 h-2 !bg-${color}-500`}
      />
    </div>
  );
};

export default BaseNode;
