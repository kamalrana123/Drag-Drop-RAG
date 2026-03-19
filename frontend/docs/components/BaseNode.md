# BaseNode

> Shared renderer for all 33 node types — renders the node card, typed port handles, and execution status badge.

## Overview

`BaseNode` is the single component that every node type delegates to. It reads the node's port spec from `NODE_PORT_SPECS`, builds handle descriptors via `buildHandles`, and distributes them evenly down the left (inputs) and right (outputs) sides. It also shows an execution status badge (running/done/error) in the top-right corner.

## Location

`src/components/BaseNode.jsx`

## Props

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | ReactFlow node ID |
| `data` | `object` | Node data: `{ label, type, config }` |
| `icon` | `LucideIcon` | Icon component to display in the header |
| `color` | `string` | Tailwind color name (e.g., `'blue'`, `'emerald'`) — controls border, bg, icon color |
| `description` | `string` | Optional short description shown in the body |

## Exports

```js
export default BaseNode;
```

## Key Behavior

### Typed Port Handles
Reads `NODE_PORT_SPECS[data.type]` for `{ inputs: string[], outputs: string[] }`. Passes each array to `buildHandles()` which returns handle descriptor objects with `id`, `color`, and `label`.

Handles are positioned using inline `top` styles:
```js
top: `${((i + 1) / (inputHandles.length + 1)) * 100}%`
```
This distributes N handles evenly along the node height.

### Execution Status Badge
```js
const statusCfg = STATUS_CONFIG[executionStatus];
```
Reads `nodeExecutionStatus[id]` from the store. Shows a colored badge:
- `running` → blue pill with spinning `Loader2` icon
- `done` → green pill with `CheckCircle2` icon
- `error` → red pill with `XCircle` icon
- `undefined` → no badge

### Config Summary
Renders the first 3 key-value pairs from `data.config` in a small table. Booleans display as "Yes"/"No". Arrays display joined with commas. Shows "Default settings" when config is empty.

### `useUpdateNodeInternals`
Called in a `useEffect` whenever `inputHandles.length` or `outputHandles.length` changes. Required by ReactFlow to re-measure handle positions after dynamic count changes.

## Dependencies

| Import | Source |
|---|---|
| `Handle`, `Position`, `useUpdateNodeInternals` | `reactflow` |
| `CheckCircle2`, `XCircle`, `Loader2` | `lucide-react` |
| `useStore` | `../store` |
| `NODE_PORT_SPECS` | `../constants/portTypes` |
| `buildHandles` | `../utils/portHelpers` |

## Usage Example

```jsx
// Inside a node type component (e.g., ChunkerNode)
const ChunkerNode = (props) => (
  <BaseNode {...props} icon={Scissors} color="amber" description="Splits documents into chunks" />
);
```

## Notes

- The `color` prop uses Tailwind dynamic class patterns like `border-${color}-500`, `bg-${color}-50`, `text-${color}-600`. These are covered by the safelist in `tailwind.config.js`.
- Fallback port spec is `{ inputs: ['any'], outputs: ['any'] }` if the type isn't found in `NODE_PORT_SPECS`.
- `useMemo` deps for handles use `.join()` on the array to create a stable primitive dependency string.
