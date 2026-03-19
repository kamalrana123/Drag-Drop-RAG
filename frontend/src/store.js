import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { PORT_COMPATIBILITY, PORT_TYPES } from './constants/portTypes';
import api from './utils/api';

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
    currentProject: null,
    activeProjectTab: 'overview', // 'overview' | 'pipeline' | 'documents' | 'settings'

    // ── Pipelines ─────────────────────────────────────────────────────────
    pipelines: [],           // list of { id, name, pipeline_type, description, updated_at }
    currentPipelineId: null,

    setPipelines: (pipelines) => set({ pipelines }),

    setCurrentPipelineId: (id) => set({ currentPipelineId: id }),

    openProject: (project) => {
      set({
        currentProjectId: project.id,
        currentProject: project,
        currentView: 'project',
        activeProjectTab: 'overview',
        pipelines: [],
        currentPipelineId: null,
        nodes: [],
        edges: [],
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
    nodes: [],
    edges: [],

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

// Autosave subscription — debounced API save whenever nodes/edges change
let _saveTimer = null;
useStore.subscribe(
  (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    currentProjectId: state.currentProjectId,
    currentPipelineId: state.currentPipelineId,
  }),
  ({ nodes, edges, currentProjectId, currentPipelineId }) => {
    if (currentProjectId && currentPipelineId) {
      clearTimeout(_saveTimer);
      _saveTimer = setTimeout(() => {
        api.pipelines.update(currentProjectId, currentPipelineId, { nodes, edges }).catch(() => {});
      }, 1500);
    }
  }
);
