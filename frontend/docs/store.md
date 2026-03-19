# store

> Central Zustand state store for the entire application: nodes, edges, history, execution, chat, and UI state.

## Overview

`store.js` creates the single Zustand store that all components read from and write to. It manages the ReactFlow graph state, undo/redo history, execution status per node, chat message history, connection error messages, and UI panel visibility. It also subscribes to node/edge changes to trigger autosave.

## Location

`src/store.js`

## Exports

```js
export const useStore; // Zustand hook — call in any component
```

## State Shape

### Graph State
| Key | Type | Description |
|---|---|---|
| `nodes` | `Node[]` | ReactFlow node array |
| `edges` | `Edge[]` | ReactFlow edge array |

### Selection
| Key | Type | Description |
|---|---|---|
| `selectedNodeId` | `string \| null` | ID of selected node (not the object — avoids stale refs) |

### History (Undo/Redo)
| Key | Type | Description |
|---|---|---|
| `history` | `{nodes, edges}[]` | Past snapshots (max 50) |
| `future` | `{nodes, edges}[]` | Redo stack (max 50) |

### Execution
| Key | Type | Description |
|---|---|---|
| `nodeExecutionStatus` | `Record<id, 'running'\|'done'\|'error'>` | Per-node run status |
| `nodeExecutionData` | `Record<id, {output, error, duration}>` | Per-node output data |
| `isExecuting` | `boolean` | True while a pipeline run is in progress |

### Chat
| Key | Type | Description |
|---|---|---|
| `chatHistory` | `{role, content, sources?}[]` | Conversation messages |

### UI
| Key | Type | Description |
|---|---|---|
| `connectionError` | `{message, timestamp} \| null` | Last port-type mismatch error |
| `chatPanelOpen` | `boolean` | Switches right panel to ChatPanel |

## Actions

### ReactFlow Handlers
| Action | Description |
|---|---|
| `onNodesChange(changes)` | Applies ReactFlow node change events |
| `onEdgesChange(changes)` | Applies ReactFlow edge change events |
| `onNodesDelete(deleted)` | Filters out deleted nodes |
| `onEdgesDelete(deleted)` | Filters out deleted edges |
| `onConnect(connection)` | Validates port compatibility, adds edge with color, or sets `connectionError` |

### Graph Mutations
| Action | Description |
|---|---|
| `setNodes(nodes)` | Replaces nodes and pushes a history snapshot |
| `setEdges(edges)` | Replaces edges and pushes a history snapshot |
| `updateNodeData(nodeId, newData)` | Merges `newData` into `node.data` for a specific node |
| `loadPipeline(nodes, edges)` | Replaces entire graph, clears execution state, pushes history |

### Selection
| Action | Description |
|---|---|
| `setSelectedNodeId(id)` | Sets selected node ID |

### Undo / Redo
| Action | Description |
|---|---|
| `undo()` | Pops from history, pushes to future |
| `redo()` | Pops from future, pushes to history |

### Execution
| Action | Description |
|---|---|
| `setNodeStatus(nodeId, status)` | Sets execution status for one node |
| `setNodeOutput(nodeId, output)` | Stores output/error/duration for one node |
| `setIsExecuting(val)` | Sets global executing flag |
| `resetExecution()` | Clears all execution state |

### Chat
| Action | Description |
|---|---|
| `addChatMessage(message)` | Appends message to `chatHistory` |
| `clearChatHistory()` | Empties chat history |
| `setChatPanelOpen(val)` | Opens/closes chat panel |

### Connection Errors
| Action | Description |
|---|---|
| `clearConnectionError()` | Clears the `connectionError` state |

## Startup Behavior

On module load, `getInitialState()` attempts to restore from the `drag-drop-rag:autosave` localStorage key. If valid nodes are found, they replace the hardcoded `initialNodes`/`initialEdges`.

## Autosave Subscription

```js
useStore.subscribe(
  (state) => ({ nodes: state.nodes, edges: state.edges }),
  ({ nodes, edges }) => { autoSave(serializePipeline(nodes, edges)); }
);
```

Fires on every nodes or edges change using the `subscribeWithSelector` middleware.

## Dependencies

| Import | Source |
|---|---|
| `create`, `subscribeWithSelector` | `zustand`, `zustand/middleware` |
| `addEdge`, `applyNodeChanges`, `applyEdgeChanges` | `reactflow` |
| `PORT_COMPATIBILITY`, `PORT_TYPES` | `./constants/portTypes` |
| `autoSave`, `loadAutosave` | `./utils/persistence` |
| `serializePipeline`, `deserializePipeline` | `./utils/pipelineSerialization` |

## Notes

- `selectedNodeId` stores only the ID string. Components derive the node object via `nodes.find(n => n.id === selectedNodeId)`. This prevents stale object references when `updateNodeData` runs.
- History max is capped at 50 snapshots (`MAX_HISTORY = 50`) via `slice(-MAX_HISTORY + 1)`.
- Port type for edge coloring is derived from `sourcePortType.toUpperCase()` looked up in `PORT_TYPES`. Falls back to `#6366f1` (indigo).
- `extractPortType()` parses handle IDs of the format `"source-chunks-0"` → `"chunks"`.
