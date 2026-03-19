# Flow

> The main ReactFlow canvas component — registers all 33 node types, handles drag-drop, runs ingestion/query, and manages execution state.

## Overview

`Flow.jsx` is the core visual canvas. It wraps a `ReactFlowProvider` and an inner `FlowInner` component. `FlowInner` renders the `ReactFlow` canvas with all node types registered, handles drag-over/drop to add nodes, runs pipeline ingestion via the backend API, and orchestrates modal dialogs for confirmations and results.

## Location

`src/components/Flow.jsx`

## Props

None — reads all state from the Zustand store.

## Exports

```js
export default Flow; // Wraps FlowInner in ReactFlowProvider
```

## Registered Node Types

All 33 node types are registered as `nodeTypes` passed to `<ReactFlow>`. Each type maps to a wrapper component that renders `<BaseNode>` with the appropriate `icon`, `color`, and `description` props.

**Data Ingestion**: `FileSource`, `WebSource`, `S3Source`
**Document Extraction**: `DocumentExtraction`, `OCRProcessor`, `MarkdownConverter`
**Text Enrichment**: `Chunker`, `MetadataExtractor`, `SemanticSplitter`
**Vector Storage**: `VectorStore`, `ChromaDBStore`
**Retrieval**: `VectorRetriever`, `HybridRetriever`, `ParentDocRetriever`, `BM25Retriever`, `EnsembleRetriever`, `ContextualCompressor`
**Rerankers**: `Reranker`, `CohereRerank`
**LLMs & Generation**: `LLMResponse`, `Summarizer`, `StructuredOutput`, `StreamingResponse`, `CitationGenerator`
**Query Transformation**: `HyDE`, `MultiQueryExpander`, `StepBackPrompt`, `QueryRewriter`
**Agentic / Self-RAG**: `DocumentGrader`, `AnswerGrader`, `HallucinationChecker`, `QueryRouter`
**Graph RAG**: `KnowledgeGraphBuilder`, `GraphRetriever`
**Memory**: `ConversationMemory`, `ChatHistory`

## Key Functions

### `handleDragOver(e)`
Calls `e.preventDefault()` and sets `dropEffect = 'move'` to enable drops.

### `handleDrop(e)`
Reads the dragged node type from `e.dataTransfer.getData('application/reactflow')`, uses `reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })` to compute the canvas position, creates a new node object, and adds it via `setNodes`.

### `handleRunIngestion()`
- Validates the pipeline; shows `ResultModal` if invalid.
- Serializes the pipeline via `serializePipeline`.
- POSTs to `/api/pipeline/run` with `axios`.
- Updates per-node status via `setNodeStatus` / `setNodeOutput` during the streaming response.

### `handleClearCanvas()`
Opens `ConfirmModal` for confirmation, then calls `setNodes([])` and `setEdges([])`.

## Dependencies

| Import | Source |
|---|---|
| `ReactFlow`, `ReactFlowProvider`, `Background`, `Controls`, `MiniMap` | `reactflow` |
| `useStore` | `../store` |
| `BaseNode` | `./BaseNode` |
| `NODE_REGISTRY` | `../constants/nodeRegistry` |
| `ConfirmModal`, `ResultModal` | `./modals` |
| `Spinner` | `./ui/Spinner` |
| `serializePipeline` | `../utils/pipelineSerialization` |
| `validatePipeline` | `../utils/pipelineGraph` |
| `axios` | `axios` |

## Usage Example

```jsx
// In App.jsx
<div className="flex-1 relative h-full">
  <ValidationBanner />
  <Flow />
</div>
```

## Notes

- `Flow` exports a `ReactFlowProvider` wrapper so that `useReactFlow()` (used for `screenToFlowPosition`) works correctly inside `FlowInner`.
- Drop position uses `screenToFlowPosition()` instead of manual offset math, which correctly handles pan and zoom states.
- The `_runQuery` handler is stored on the Zustand store so `ChatPanel` can invoke it without prop drilling.
