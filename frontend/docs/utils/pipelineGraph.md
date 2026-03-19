# pipelineGraph

> Pipeline graph analysis utilities: topological sort and structural validation.

## Overview

`pipelineGraph.js` provides two functions. `topoSort` implements Kahn's algorithm to topologically sort pipeline nodes and detect cycles. `validatePipeline` uses `topoSort` plus additional structural checks to produce a list of errors and warnings.

## Location

`src/utils/pipelineGraph.js`

## Exports

```js
export function topoSort(nodes, edges);
export function validatePipeline(nodes, edges);
```

---

## `topoSort(nodes, edges)`

Performs a topological sort using Kahn's algorithm (BFS-based).

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `nodes` | `Node[]` | ReactFlow node array |
| `edges` | `Edge[]` | ReactFlow edge array |

### Returns

`string[]` — node IDs in topological order.

### Throws

`Error('Pipeline contains a cycle')` if the graph has a cycle (not a DAG).

### Algorithm

1. Build an adjacency list and in-degree map from edges.
2. Initialize a queue with all nodes that have in-degree 0 (source nodes).
3. Repeatedly dequeue a node, add it to the sorted list, decrement in-degree of its neighbors.
4. Repeat until the queue is empty.
5. If the sorted list length ≠ nodes length, a cycle exists — throw.

---

## `validatePipeline(nodes, edges)`

Runs structural validation on the pipeline.

### Parameters

Same as `topoSort`.

### Returns

```js
{ valid: boolean, errors: string[], warnings: string[] }
```

### Validation Rules

| Check | Type | Rule |
|---|---|---|
| Empty canvas | Error | No nodes at all |
| Cycle detection | Error | `topoSort` throws → cycle exists |
| Missing source node | Error | No node with type in `SOURCE_TYPES` |
| Missing output node | Error | No node with type in `OUTPUT_TYPES` |
| Isolated node | Warning | A node with no edges (neither incoming nor outgoing) |

### Source Types
`FileSource`, `WebSource`, `S3Source`

### Output Types
`LLMResponse`, `Summarizer`, `StructuredOutput`, `StreamingResponse`, `CitationGenerator`

---

## Dependencies

None — pure function, no external imports.

## Usage Example

```js
const { valid, errors, warnings } = validatePipeline(nodes, edges);

if (!valid) {
  // Block execution
  showErrors(errors);
}
```

## Notes

- `validatePipeline` is called in two places: `ValidationBanner` (on every render for real-time feedback) and `Flow.jsx` (before submitting to the backend API).
- Isolated node warnings are non-blocking — the pipeline can still run, but the node will have no effect.
- Port-type compatibility is validated separately in `store.js`'s `onConnect` — `validatePipeline` only checks structural correctness.
