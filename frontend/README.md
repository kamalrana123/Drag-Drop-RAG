# Advanced Visual RAG Builder — Frontend

> A drag-and-drop visual pipeline builder for Retrieval-Augmented Generation (RAG) workflows.

## Overview

This is the frontend for the Drag-Drop-RAG project. It lets you visually compose RAG pipelines by dragging nodes onto a canvas, connecting them with typed edges, configuring each node, and running ingestion or query workflows — all without writing code.

The UI is built with React 19 + ReactFlow 11, styled with Tailwind CSS v4, and uses Zustand 5 for state management.

---

## Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.4 | UI framework |
| ReactFlow | ^11.11.4 | Node-based visual canvas |
| Zustand | ^5.0.12 | Global state management |
| Tailwind CSS | ^4.2.2 | Utility-first styling |
| Vite | ^8.0.0 | Dev server & bundler |
| Lucide React | ^0.577.0 | Icon library |
| Axios | ^1.13.6 | HTTP client for API calls |

---

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Requires Node.js 18+. If using `nvs`:
```bash
nvs use node/24.0.0/x64
```

---

## Folder Structure

```
frontend/
├── src/
│   ├── App.jsx                   # Root layout, header toolbar, keyboard shortcuts
│   ├── main.jsx                  # React entry point
│   ├── store.js                  # Zustand store (nodes, edges, history, execution)
│   ├── index.css                 # Global styles, Tailwind import, animations
│   │
│   ├── components/
│   │   ├── Flow.jsx              # ReactFlow canvas with all 33 node types
│   │   ├── BaseNode.jsx          # Shared node renderer with typed port handles
│   │   ├── Sidebar.jsx           # Left panel: searchable, draggable node palette
│   │   ├── SettingsPanel.jsx     # Right panel: per-node configuration forms
│   │   ├── ValidationBanner.jsx  # Top-of-canvas pipeline validation indicator
│   │   ├── ChatPanel.jsx         # Right panel: interactive query chat interface
│   │   ├── DataPreviewDrawer.jsx # Bottom drawer: node output data preview
│   │   ├── WorkflowManager.jsx   # Modal: templates, saved pipelines, import/export
│   │   │
│   │   ├── modals/
│   │   │   ├── ModalPortal.jsx   # createPortal wrapper for all modals
│   │   │   ├── ConfirmModal.jsx  # Replaces window.confirm()
│   │   │   ├── QueryModal.jsx    # Replaces window.prompt()
│   │   │   ├── ResultModal.jsx   # Replaces window.alert()
│   │   │   └── index.js          # Barrel export
│   │   │
│   │   └── ui/
│   │       ├── Toast.jsx         # Auto-dismiss toast notifications
│   │       └── Spinner.jsx       # Loading spinner (Loader2 icon)
│   │
│   ├── hooks/
│   │   ├── useModal.js           # Modal open/close/props state hook
│   │   └── useKeyboardShortcuts.js # Keyboard shortcut binding hook
│   │
│   ├── constants/
│   │   ├── nodeRegistry.js       # All 33 node definitions (type, icon, color, category)
│   │   ├── portTypes.js          # 12 port types, compatibility rules, node port specs
│   │   └── pipelineTemplates.js  # 5 preset pipeline templates
│   │
│   └── utils/
│       ├── portHelpers.js        # buildHandles() and extractPortType()
│       ├── pipelineGraph.js      # Topological sort + pipeline validation
│       ├── pipelineSerialization.js # serialize/deserialize/export/import pipeline JSON
│       └── persistence.js        # localStorage save/load/autosave utilities
│
├── docs/                         # Documentation for every source file
│   ├── App.md
│   ├── store.md
│   ├── main.md
│   ├── index-css.md
│   ├── components/
│   ├── hooks/
│   ├── constants/
│   └── utils/
│
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Key Concepts

### Node System
There are 33 node types across 13 categories. Every node uses `BaseNode` as its renderer. Configuration is handled in `SettingsPanel`. Node metadata (icon, color, category) lives in `nodeRegistry.js`.

### Typed Port System
Connections between nodes are validated by port type. Each node has defined input/output port types (e.g., `CHUNKS`, `QUERY`, `RETRIEVED_DOCS`). Incompatible connections are rejected with an in-UI error. Port specs live in `portTypes.js`.

### Pipeline State
The full canvas state (nodes + edges) is managed in `store.js` via Zustand. Every change is autosaved to `localStorage`. Named saves are stored separately. Undo/redo history is maintained as a stack of snapshots (max 50).

### Execution
Clicking **Run Ingestion** posts the serialized pipeline to the backend API. Node statuses update in real-time. Clicking **Run Query** opens `ChatPanel` for interactive Q&A.

### Validation
`ValidationBanner` continuously validates the pipeline using Kahn's algorithm (cycle detection) and structural rules. Errors and warnings are shown inline above the canvas.

---

## Documentation

Each source file has a corresponding `.md` in `frontend/docs/`:

- [App.md](docs/App.md) · [store.md](docs/store.md) · [main.md](docs/main.md) · [index-css.md](docs/index-css.md)
- [components/Flow.md](docs/components/Flow.md) · [BaseNode.md](docs/components/BaseNode.md) · [Sidebar.md](docs/components/Sidebar.md)
- [components/SettingsPanel.md](docs/components/SettingsPanel.md) · [ChatPanel.md](docs/components/ChatPanel.md) · [WorkflowManager.md](docs/components/WorkflowManager.md)
- [components/ValidationBanner.md](docs/components/ValidationBanner.md) · [DataPreviewDrawer.md](docs/components/DataPreviewDrawer.md)
- [modals/ModalPortal.md](docs/components/modals/ModalPortal.md) · [ConfirmModal.md](docs/components/modals/ConfirmModal.md) · [QueryModal.md](docs/components/modals/QueryModal.md) · [ResultModal.md](docs/components/modals/ResultModal.md)
- [ui/Toast.md](docs/components/ui/Toast.md) · [ui/Spinner.md](docs/components/ui/Spinner.md)
- [hooks/useModal.md](docs/hooks/useModal.md) · [hooks/useKeyboardShortcuts.md](docs/hooks/useKeyboardShortcuts.md)
- [constants/nodeRegistry.md](docs/constants/nodeRegistry.md) · [constants/portTypes.md](docs/constants/portTypes.md) · [constants/pipelineTemplates.md](docs/constants/pipelineTemplates.md)
- [utils/portHelpers.md](docs/utils/portHelpers.md) · [utils/pipelineGraph.md](docs/utils/pipelineGraph.md) · [utils/pipelineSerialization.md](docs/utils/pipelineSerialization.md) · [utils/persistence.md](docs/utils/persistence.md)
