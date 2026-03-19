import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

const initialNodes = [
  {
    id: '1',
    type: 'FileSource',
    data: { label: 'Document Source', type: 'FileSource', config: {} },
    position: { x: 50, y: 50 },
  },
  {
    id: '2',
    type: 'VectorStore',
    data: { label: 'Vector DB (Qdrant)', type: 'VectorStore', config: {} },
    position: { x: 300, y: 50 },
  },
  {
    id: '3',
    type: 'Reranker',
    data: { label: 'Reranker (FlashRank)', type: 'Reranker', config: {} },
    position: { x: 550, y: 50 },
  },
  {
    id: '4',
    type: 'LLMResponse',
    data: { label: 'LLM Response', type: 'LLMResponse', config: {} },
    position: { x: 800, y: 50 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { strokeWidth: 2 } },
];

export const useStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onNodesDelete: (deleted) => {
    set({
      nodes: get().nodes.filter((node) => !deleted.find((d) => d.id === node.id)),
    });
  },
  onEdgesDelete: (deleted) => {
    set({
      edges: get().edges.filter((edge) => !deleted.find((d) => d.id === edge.id)),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, get().edges),
    });
  },
  setSelectedNode: (node) => set({ selectedNode: node }),
  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
