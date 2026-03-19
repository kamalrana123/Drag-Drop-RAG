# ValidationBanner

> Floating top-of-canvas banner showing pipeline validation errors and warnings.

## Overview

`ValidationBanner` continuously validates the current pipeline using `validatePipeline` and renders a collapsible banner when there are errors (red) or warnings (amber). It hides completely when the pipeline is valid.

## Location

`src/components/ValidationBanner.jsx`

## Props

None — reads nodes and edges from the Zustand store.

## Exports

```js
export default ValidationBanner;
```

## Key Behavior

### Validation
Calls `validatePipeline(nodes, edges)` on every render (derived from store values). Returns `{ valid, errors[], warnings[] }`.

- If `valid` and no warnings → renders nothing (`return null`)
- If warnings but no errors → amber banner
- If errors → red banner

### Collapsible Detail
A toggle button expands/collapses the list of individual error/warning messages. By default the banner shows only the count summary; click to see details.

### Validation Rules (from `pipelineGraph.js`)
- No cycles (topological sort failure)
- At least one source node (FileSource, WebSource, S3Source)
- At least one output node (LLMResponse, Summarizer, etc.)
- No isolated nodes (nodes with no connections)

## Key State

| State | Type | Description |
|---|---|---|
| `expanded` | `boolean` | Whether the detail list is shown |

## Dependencies

| Import | Source |
|---|---|
| `useStore` | `../store` |
| `validatePipeline` | `../utils/pipelineGraph` |
| `AlertTriangle`, `XCircle`, `ChevronDown`, `ChevronUp` | `lucide-react` |

## Usage Example

```jsx
// In App.jsx, positioned above the Flow canvas
<div className="flex-1 relative h-full">
  <ValidationBanner />
  <Flow />
</div>
```

## Notes

- The banner is positioned `absolute` at the top of its container, overlaying the canvas without pushing it down.
- Validation runs on every render, which is acceptable since `validatePipeline` is fast (Kahn's algorithm, O(V+E)).
- Errors prevent meaningful pipeline execution — `Flow.jsx` also calls `validatePipeline` before submitting to the API.
