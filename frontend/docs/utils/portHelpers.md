# portHelpers

> Utility functions for building ReactFlow handle descriptors and parsing port types from handle IDs.

## Overview

`portHelpers.js` provides two small functions used by `BaseNode` to translate port type arrays (from `NODE_PORT_SPECS`) into the concrete handle descriptor objects that ReactFlow needs to render.

## Location

`src/utils/portHelpers.js`

## Exports

```js
export function buildHandles(portTypeIds, handleType);
export function extractPortType(handleId);
```

---

## `buildHandles(portTypeIds, handleType)`

Converts an array of port type strings into an array of handle descriptor objects.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `portTypeIds` | `string[]` | Array of lowercase port type names (e.g., `['chunks', 'query']`) |
| `handleType` | `'source' \| 'target'` | ReactFlow handle type |

### Returns

`HandleDescriptor[]`:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Handle ID in format `"{handleType}-{portType}-{index}"` |
| `color` | `string` | Hex color from `PORT_TYPES[portType.toUpperCase()].color` |
| `label` | `string` | Human label from `PORT_TYPES[portType.toUpperCase()].label` |

### Example

```js
buildHandles(['chunks', 'query'], 'target')
// Returns:
[
  { id: 'target-chunks-0', color: '#10b981', label: 'Text Chunks' },
  { id: 'target-query-1', color: '#3b82f6', label: 'Query' },
]
```

---

## `extractPortType(handleId)`

Parses the port type segment from a handle ID string.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `handleId` | `string \| null` | Handle ID from a ReactFlow connection event |

### Returns

`string | null` — the port type segment (e.g., `'chunks'`), or `null` if parsing fails.

### Logic

```js
// "source-chunks-0" → parts = ['source', 'chunks', '0']
// removes first (source/target) and last (index), joins middle
parts.slice(1, -1).join('_')
```

Handles multi-word port types like `retrieved_docs` that have underscores in the middle.

---

## Dependencies

| Import | Source |
|---|---|
| `PORT_TYPES` | `../constants/portTypes` |

## Notes

- Falls back to `color: '#9ca3af'` and `label: portType` if the type is not found in `PORT_TYPES`.
- `extractPortType` is also inlined in `store.js` as a local function for use in `onConnect` — the two implementations should stay in sync.
