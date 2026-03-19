import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { NODE_REGISTRY } from '../constants/nodeRegistry';

const SidebarItem = ({ type, label, icon: IconComponent, color, description }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex items-center space-x-3 p-2.5 bg-white border border-gray-100 rounded-lg cursor-grab hover:border-indigo-400 hover:shadow-sm transition-all group"
      onDragStart={onDragStart}
      draggable
      title={description}
    >
      <div className={`p-1.5 rounded bg-${color}-50 group-hover:bg-${color}-100 transition-colors flex-shrink-0`}>
        {React.createElement(IconComponent, { size: 15, className: `text-${color}-600` })}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-gray-700 truncate">{label}</div>
        <div className="text-[10px] text-gray-400 truncate leading-tight">{description}</div>
      </div>
    </div>
  );
};

const Category = ({ title, items, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-1 py-1 mb-2 text-left group"
      >
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
          {title}
          <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">({items.length})</span>
        </h3>
        {isOpen
          ? <ChevronDown size={13} className="text-gray-300 group-hover:text-gray-500" />
          : <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500" />
        }
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 gap-1.5">
          {items.map((item) => (
            <SidebarItem key={item.type} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return NODE_REGISTRY;
    return NODE_REGISTRY.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q))
    );
  }, [searchTerm]);

  const grouped = useMemo(() => {
    const map = {};
    for (const node of filtered) {
      if (!map[node.category]) {
        map[node.category] = { title: node.category, order: node.categoryOrder, items: [] };
      }
      map[node.category].items.push(node);
    }
    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [filtered]);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search nodes…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="mt-2 text-[11px] text-gray-400 text-right">
          {filtered.length} of {NODE_REGISTRY.length} nodes
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {grouped.length === 0 ? (
          <div className="text-center py-10">
            <Search size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No nodes match "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-xs text-indigo-500 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          grouped.map((group) => (
            <Category
              key={group.title}
              title={group.title}
              items={group.items}
              defaultOpen={group.order < 7}
            />
          ))
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-indigo-600 mb-1">
          <HelpCircle size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Quick Tip</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Drag nodes onto the canvas and connect handles to build your RAG pipeline.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
