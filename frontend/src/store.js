import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { PORT_COMPATIBILITY, PORT_TYPES } from './constants/portTypes';
import { autoSave, loadAutosave, saveProjectPipeline } from './utils/persistence';
import { serializePipeline, deserializePipeline } from './utils/pipelineSerialization';

const MAX_HISTORY = 50;

function extractPortType(handleId) {
  if (!handleId) return null;
  // handle id format: "source-chunks-0" or "target-query-1"
  const parts = handleId.split('-');
  if (parts.length >= 2) {
    // remove first part (source/target) and last part (index)
    return parts.slice(1, -1).join('_');
  }
  return null;
}

// Try to restore from autosave on startup
function getInitialState() {
  try {
    const saved = loadAutosave();
    if (saved?.pipeline) {
      const { nodes, edges } = deserializePipeline(saved.pipeline);
      if (nodes.length > 0) return { nodes, edges };
    }
  } catch { /* ignore */ }
  return null;
}

const initialNodes = [
  {
    id: '1',
    type: 'FileSource',
    data: { label: 'Document Source', type: 'FileSource', config: {} },
    position: { x: 50, y: 200 },
  },
  {
    id: '2',
    type: 'Chunker',
    data: { label: 'Text Chunker', type: 'Chunker', config: {} },
    position: { x: 300, y: 200 },
  },
  {
    id: '3',
    type: 'VectorStore',
    data: { label: 'Vector DB (Qdrant)', type: 'VectorStore', config: {} },
    position: { x: 550, y: 200 },
  },
  {
    id: '4',
    type: 'VectorRetriever',
    data: { label: 'Vector Search', type: 'VectorRetriever', config: {} },
    position: { x: 800, y: 200 },
  },
  {
    id: '5',
    type: 'Reranker',
    data: { label: 'Reranker (FlashRank)', type: 'Reranker', config: {} },
    position: { x: 1050, y: 200 },
  },
  {
    id: '6',
    type: 'LLMResponse',
    data: { label: 'LLM Response', type: 'LLMResponse', config: {} },
    position: { x: 1300, y: 200 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { strokeWidth: 2, stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { strokeWidth: 2, stroke: '#10b981' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { strokeWidth: 2, stroke: '#22c55e' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { strokeWidth: 2, stroke: '#06b6d4' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { strokeWidth: 2, stroke: '#f97316' } },
];

const restored = getInitialState();

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Auth ──────────────────────────────────────────────────────────────
    isAuthenticated: false,
    token: localStorage.getItem('rag_token') ?? null,
    currentUser: null,
    currentView: 'dashboard', // 'dashboard' | 'canvas' | 'project'
    login: () => set({ isAuthenticated: true }),
    logout: () => {
      localStorage.removeItem('rag_token');
      set({ isAuthenticated: false, token: null, currentUser: null, currentView: 'dashboard' });
    },
    setToken: (token) => {
      if (token) localStorage.setItem('rag_token', token);
      else localStorage.removeItem('rag_token');
      set({ token });
    },
    setCurrentUser: (user) => set({ currentUser: user }),
    setView: (view) => set({ currentView: view }),

    // ── Project ───────────────────────────────────────────────────────────
    currentProjectId: null,
    activeProjectTab: 'overview', // 'overview' | 'pipeline' | 'documents' | 'settings'

    openProject: (project) => {
      let nodes = [];
      let edges = [];
      if (project.pipeline) {
        try {
          const result = deserializePipeline(project.pipeline);
          nodes = result.nodes;
          edges = result.edges;
        } catch { /* corrupt pipeline — open blank */ }
      }
      set({
        currentProjectId: project.id,
        currentView: 'project',
        activeProjectTab: 'overview',
        nodes,
        edges,
        history: [],
        future: [],
        selectedNodeId: null,
        nodeExecutionStatus: {},
        nodeExecutionData: {},
        isExecuting: false,
        chatHistory: [],
      });
    },

    setActiveProjectTab: (tab) => set({ activeProjectTab: tab }),

    closeProject: () => set({
      currentProjectId: null,
      currentView: 'dashboard',
      activeProjectTab: 'overview',
    }),

    // ── Core graph state ──────────────────────────────────────────────────
    nodes: restored?.nodes ?? initialNodes,
    edges: restored?.edges ?? initialEdges,

    // ── Selection (ID only — no stale reference bug) ──────────────────────
    selectedNodeId: null,

    // ── Undo / Redo ───────────────────────────────────────────────────────
    history: [],
    future: [],

    // ── Execution state ───────────────────────────────────────────────────
    nodeExecutionStatus: {},  // Record<nodeId, 'idle'|'running'|'done'|'error'>
    nodeExecutionData: {},    // Record<nodeId, { output, error, duration }>
    isExecuting: false,

    // ── Chat history ──────────────────────────────────────────────────────
    chatHistory: [],

    // ── Connection error (replaces alert) ────────────────────────────────
    connectionError: null,

    // ── UI panels ────────────────────────────────────────────────────────
    chatPanelOpen: false,

    // ── ReactFlow handlers ────────────────────────────────────────────────
    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    onNodesDelete: (deleted) => {
      set({ nodes: get().nodes.filter((n) => !deleted.find((d) => d.id === n.id)) });
    },
    onEdgesDelete: (deleted) => {
      set({ edges: get().edges.filter((e) => !deleted.find((d) => d.id === e.id)) });
    },

    onConnect: (connection) => {
      const sourcePortType = extractPortType(connection.sourceHandle);
      const targetPortType = extractPortType(connection.targetHandle);

      // If typed handles are present, validate compatibility
      if (sourcePortType && targetPortType) {
        const compatible = PORT_COMPATIBILITY[targetPortType]?.has(sourcePortType) ?? false;
        if (!compatible) {
          set({
            connectionError: {
              message: `Cannot connect "${sourcePortType}" → "${targetPortType}". Incompatible port types.`,
              timestamp: Date.now(),
            },
          });
          return;
        }
      }

      // Determine edge color from source port type
      const portKey = sourcePortType ? sourcePortType.toUpperCase() : null;
      const edgeColor = portKey && PORT_TYPES[portKey] ? PORT_TYPES[portKey].color : '#6366f1';

      set({
        edges: addEdge(
          {
            ...connection,
            animated: true,
            style: { strokeWidth: 2, stroke: edgeColor },
            data: { sourcePortType, targetPortType },
          },
          get().edges
        ),
        connectionError: null,
      });
    },

    clearConnectionError: () => set({ connectionError: null }),

    // ── Node/edge setters (with history push) ────────────────────────────
    setNodes: (nodes) =>
      set((state) => ({
        nodes,
        history: [...state.history.slice(-MAX_HISTORY + 1), { nodes: state.nodes, edges: state.edges }],
        future: [],
      })),

    setEdges: (edges) =>
      set((state) => ({
        edges,
        history: [...state.history.slice(-MAX_HISTORY + 1), { nodes: state.nodes, edges: state.edges }],
        future: [],
      })),

    // ── Selection ────────────────────────────────────────────────────────
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    // ── Node data update ─────────────────────────────────────────────────
    updateNodeData: (nodeId, newData) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        ),
      });
    },

    // ── Undo / Redo ───────────────────────────────────────────────────────
    undo: () =>
      set((state) => {
        if (state.history.length === 0) return state;
        const prev = state.history[state.history.length - 1];
        return {
          nodes: prev.nodes,
          edges: prev.edges,
          history: state.history.slice(0, -1),
          future: [{ nodes: state.nodes, edges: state.edges }, ...state.future.slice(0, MAX_HISTORY - 1)],
        };
      }),

    redo: () =>
      set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        return {
          nodes: next.nodes,
          edges: next.edges,
          future: state.future.slice(1),
          history: [...state.history.slice(-MAX_HISTORY + 1), { nodes: state.nodes, edges: state.edges }],
        };
      }),

    // ── Execution ─────────────────────────────────────────────────────────
    setNodeStatus: (nodeId, status) =>
      set((state) => ({
        nodeExecutionStatus: { ...state.nodeExecutionStatus, [nodeId]: status },
      })),

    setNodeOutput: (nodeId, output) =>
      set((state) => ({
        nodeExecutionData: { ...state.nodeExecutionData, [nodeId]: output },
      })),

    setIsExecuting: (val) => set({ isExecuting: val }),

    resetExecution: () =>
      set({ nodeExecutionStatus: {}, nodeExecutionData: {}, isExecuting: false }),

    // ── Chat ──────────────────────────────────────────────────────────────
    addChatMessage: (message) =>
      set((state) => ({ chatHistory: [...state.chatHistory, message] })),

    clearChatHistory: () => set({ chatHistory: [] }),

    setChatPanelOpen: (val) => set({ chatPanelOpen: val }),

    // ── Full pipeline replace (for loading templates/imports) ─────────────
    loadPipeline: (nodes, edges) =>
      set((state) => ({
        nodes,
        edges,
        history: [...state.history.slice(-MAX_HISTORY + 1), { nodes: state.nodes, edges: state.edges }],
        future: [],
        selectedNodeId: null,
        nodeExecutionStatus: {},
        nodeExecutionData: {},
      })),
  }))
);

// Autosave subscription — fires whenever nodes, edges, or active project changes
useStore.subscribe(
  (state) => ({ nodes: state.nodes, edges: state.edges, currentProjectId: state.currentProjectId }),
  ({ nodes, edges, currentProjectId }) => {
    const pipeline = serializePipeline(nodes, edges);
    autoSave(pipeline);
    if (currentProjectId) {
      saveProjectPipeline(currentProjectId, pipeline);
    }
  }
);
