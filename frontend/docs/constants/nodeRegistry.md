# nodeRegistry

> Master registry of all 33 node type definitions with metadata for display, categorization, and search.

## Overview

`nodeRegistry.js` is the single source of truth for which node types exist in the application. Every node's visual identity (icon, color), category membership, description, and searchable tags are defined here. Both `Sidebar` and `SettingsPanel` read from this registry.

## Location

`src/constants/nodeRegistry.js`

## Exports

```js
export const NODE_REGISTRY;    // Array<NodeDef> — ordered list of all 33 nodes
export const NODE_REGISTRY_MAP; // Record<type, NodeDef> — for O(1) lookup by type
```

## `NodeDef` Shape

| Field | Type | Description |
|---|---|---|
| `type` | `string` | ReactFlow node type identifier (e.g., `'Chunker'`) |
| `label` | `string` | Human-readable display name |
| `icon` | `LucideIcon` | Icon component for the node card and sidebar |
| `color` | `string` | Tailwind color name (e.g., `'amber'`, `'blue'`) |
| `category` | `string` | Category group name shown in Sidebar |
| `categoryOrder` | `number` | Numeric sort order for category groups |
| `description` | `string` | Short description shown in Sidebar and node card |
| `tags` | `string[]` | Search keywords for Sidebar filtering |

## Node Categories

| Category | `categoryOrder` | Nodes |
|---|---|---|
| Data Ingestion | 1 | FileSource, WebSource, S3Source |
| Document Extraction | 2 | DocumentExtraction, OCRProcessor, MarkdownConverter |
| Text Enrichment | 3 | Chunker, MetadataExtractor, SemanticSplitter |
| Vector Storage | 4 | VectorStore, ChromaDBStore |
| Retrieval & Search | 5 | VectorRetriever, HybridRetriever, ParentDocRetriever, BM25Retriever, EnsembleRetriever, ContextualCompressor |
| Rerankers | 6 | Reranker, CohereRerank |
| LLMs & Generation | 7 | LLMResponse, Summarizer, StructuredOutput, StreamingResponse, CitationGenerator |
| Query Transformation | 8 | HyDE, MultiQueryExpander, StepBackPrompt, QueryRewriter |
| Agentic / Self-RAG | 9 | DocumentGrader, AnswerGrader, HallucinationChecker, QueryRouter |
| Graph RAG | 10 | KnowledgeGraphBuilder, GraphRetriever |
| Memory | 11 | ConversationMemory, ChatHistory |

## Usage Example

```js
// Get all nodes in a category
const ingestionNodes = NODE_REGISTRY.filter(n => n.category === 'Data Ingestion');

// Look up a node's icon and color
const { icon: Icon, color } = NODE_REGISTRY_MAP['Chunker'];
```

## Notes

- `NODE_REGISTRY_MAP` is derived from `NODE_REGISTRY` via `Object.fromEntries(NODE_REGISTRY.map(n => [n.type, n]))`.
- The `type` string must exactly match the key used in ReactFlow's `nodeTypes` object in `Flow.jsx`.
- `color` values must be included in the Tailwind safelist in `tailwind.config.js` since they are used in dynamic class names.
