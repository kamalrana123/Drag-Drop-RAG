# portTypes

> Typed port system: port type definitions, compatibility rules, and per-node input/output specifications.

## Overview

`portTypes.js` defines the type system for connections between nodes. Each port has a type (e.g., `CHUNKS`, `QUERY`), a color for visual distinction, and a compatibility set defining which source types can connect to it. Every node type also has a declared list of input and output port types.

## Location

`src/constants/portTypes.js`

## Exports

```js
export const PORT_TYPES;       // Record<name, { label, color }>
export const PORT_COMPATIBILITY; // Record<targetType, Set<sourceType>>
export const NODE_PORT_SPECS;  // Record<nodeType, { inputs: string[], outputs: string[] }>
```

## `PORT_TYPES`

| Key | Label | Color |
|---|---|---|
| `RAW_DOCUMENTS` | Raw Documents | `#f59e0b` (amber) |
| `CHUNKS` | Text Chunks | `#10b981` (emerald) |
| `EMBEDDINGS` | Embeddings | `#6366f1` (indigo) |
| `QUERY` | Query | `#3b82f6` (blue) |
| `QUERY_LIST` | Query List | `#60a5fa` (light blue) |
| `RETRIEVED_DOCS` | Retrieved Docs | `#22c55e` (green) |
| `RANKED_DOCS` | Ranked Docs | `#f97316` (orange) |
| `ANSWER` | Answer | `#a855f7` (purple) |
| `GRAPH` | Knowledge Graph | `#14b8a6` (teal) |
| `MEMORY` | Memory | `#ec4899` (pink) |
| `GRADE` | Grade Signal | `#ef4444` (red) |
| `ANY` | Any | `#9ca3af` (gray) |

## `PORT_COMPATIBILITY`

Defines which source types a given target port type accepts. For example:
```js
PORT_COMPATIBILITY['chunks'] = new Set(['raw_documents', 'chunks'])
PORT_COMPATIBILITY['retrieved_docs'] = new Set(['chunks', 'retrieved_docs', 'ranked_docs'])
PORT_COMPATIBILITY['any'] = new Set([...all types...])
```

## `NODE_PORT_SPECS`

Maps each node type to its `{ inputs, outputs }` arrays of port type strings (lowercase). Examples:

| Node | Inputs | Outputs |
|---|---|---|
| `FileSource` | *(none)* | `['raw_documents']` |
| `Chunker` | `['raw_documents']` | `['chunks']` |
| `VectorStore` | `['chunks']` | `['chunks']` |
| `VectorRetriever` | `['query', 'chunks']` | `['retrieved_docs']` |
| `Reranker` | `['retrieved_docs', 'query']` | `['ranked_docs']` |
| `LLMResponse` | `['ranked_docs', 'query']` | `['answer']` |
| `HyDE` | `['query']` | `['query_list']` |
| `DocumentGrader` | `['retrieved_docs', 'query']` | `['retrieved_docs', 'grade']` |

## How Port Validation Works

1. `Flow.jsx`'s `onConnect(connection)` extracts the source and target port types from handle IDs.
2. Checks `PORT_COMPATIBILITY[targetPortType].has(sourcePortType)`.
3. If incompatible, sets `connectionError` on the store (displayed in-UI) and aborts the connection.

## Handle ID Format

Handle IDs follow the pattern: `"{source|target}-{portType}-{index}"`.

Examples: `"source-chunks-0"`, `"target-query-1"`.

The `extractPortType()` helper in `portHelpers.js` parses these IDs.

## Notes

- Port type strings in `NODE_PORT_SPECS` are lowercase; `PORT_TYPES` keys are UPPERCASE. Both refer to the same types — conversions happen in `onConnect` via `.toUpperCase()`.
- Nodes with `'any'` inputs/outputs accept all port types.
- Adding a new node type requires entries in both `NODE_PORT_SPECS` (here) and `nodeRegistry.js`.
