# DataPreviewDrawer

> Bottom-anchored drawer for previewing a node's execution output data.

## Overview

`DataPreviewDrawer` slides up from the bottom of the canvas when a node with execution output is clicked. It shows the raw JSON output, a formatted view tailored to the node type, and basic statistics. The drawer has two height modes: compact (`h-56`) and expanded (`h-96`).

## Location

`src/components/DataPreviewDrawer.jsx`

## Props

| Prop | Type | Description |
|---|---|---|
| `nodeId` | `string` | ID of the node being previewed |
| `nodeType` | `string` | Type string (e.g., `'Chunker'`) used to select the formatted view |
| `nodeLabel` | `string` | Display name shown in the drawer header |
| `outputData` | `{output, error?, duration?}` | Execution output from the store |
| `onClose` | `() => void` | Called when the X button is clicked |

## Exports

```js
export default DataPreviewDrawer;
```

## Sub-components

### `FormattedView({ nodeType, output })`
Renders a human-readable view based on `nodeType`:

| Node Types | Rendered As |
|---|---|
| `Chunker`, `SemanticSplitter`, `MetadataExtractor` | List of chunks (first 5, with count) |
| `VectorRetriever`, `HybridRetriever`, `ParentDocRetriever`, `BM25Retriever`, `EnsembleRetriever` | List of retrieved docs with score |
| `LLMResponse`, `Summarizer`, `StreamingResponse`, `CitationGenerator` | "Generated Answer" prose block |
| All others | Pretty-printed JSON (first 1000 chars) |

### `StatsView({ output, duration })`
Shows:
- Execution duration in ms
- Array item count (if output is array)
- Output object keys (if output is object)

## Tabs

| Tab | Content |
|---|---|
| Raw Output | Pretty-printed JSON (first 3000 chars, truncated marker shown if longer) |
| Formatted | `FormattedView` — type-aware rendering |
| Stats | `StatsView` — counts and timing |

## Key State

| State | Type | Description |
|---|---|---|
| `tab` | `number` | Active tab index (0/1/2) |
| `drawerExpanded` | `boolean` | Toggles between `h-56` and `h-96` |

## Key Behavior

- Returns `null` if `outputData` is falsy (hides the drawer).
- Copy button calls `navigator.clipboard.writeText(rawFormatted)` for the raw JSON.
- The chevron button toggles expanded/compact height.

## Dependencies

| Import | Source |
|---|---|
| `X`, `ChevronDown`, `ChevronUp`, `Copy` | `lucide-react` |

## Usage Example

```jsx
// In Flow.jsx, rendered conditionally when a node with output is selected
{selectedOutputData && (
  <DataPreviewDrawer
    nodeId={selectedNodeId}
    nodeType={selectedNode.type}
    nodeLabel={selectedNode.data.label}
    outputData={selectedOutputData}
    onClose={() => setSelectedOutputData(null)}
  />
)}
```

## Notes

- The drawer is positioned `absolute bottom-0` within the canvas container, so it overlays the flow without affecting layout.
- Doc score rendering uses optional chaining (`d.score?.toFixed(3)`) to handle missing scores.
- Content areas have explicit `maxHeight` styles instead of Tailwind `max-h` to avoid conflicts with the dynamic height transition.
