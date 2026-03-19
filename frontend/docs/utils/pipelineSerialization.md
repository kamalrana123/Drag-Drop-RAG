# pipelineSerialization

> Serialize, deserialize, export, and import pipeline data as JSON.

## Overview

`pipelineSerialization.js` converts between the live ReactFlow node/edge arrays and a portable JSON format (schema v1.0). It also handles browser file download (export) and file reading (import).

## Location

`src/utils/pipelineSerialization.js`

## Exports

```js
export function serializePipeline(nodes, edges);
export function deserializePipeline(data);
export function exportToJSON(data, filename?);
export function importFromJSON(file);
```

---

## `serializePipeline(nodes, edges)`

Converts the live canvas to a plain JSON-safe object.

### Returns

```js
{
  version: '1.0',
  exportedAt: '<ISO timestamp>',
  nodes: Node[],   // stripped of runtime-only fields
  edges: Edge[],   // stripped of animation/style for compactness
}
```

### Stripping Logic
Removes `selected`, `dragging` from nodes. Retains `id`, `type`, `data`, `position`.
Retains `id`, `source`, `target`, `sourceHandle`, `targetHandle`, `data` from edges.

---

## `deserializePipeline(data)`

Converts serialized JSON back to live ReactFlow arrays.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `data` | `SerializedPipeline \| string` | Serialized object or JSON string |

### Returns

```js
{ nodes: Node[], edges: Edge[] }
```

### Post-processing
Re-applies `animated: true` and default `style: { strokeWidth: 2 }` to all edges (stripped during export to save space).

### Throws

`Error('Invalid pipeline data')` if `data.nodes` is missing or not an array.

---

## `exportToJSON(data, filename?)`

Triggers a browser file download of the serialized pipeline.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `data` | `SerializedPipeline` | — | Serialized pipeline object |
| `filename` | `string` | `'pipeline.json'` | Download filename |

### Mechanism

Creates an object URL from a `Blob`, triggers click on a temporary `<a>` element, then revokes the URL.

---

## `importFromJSON(file)`

Reads a `File` object and parses its contents as JSON.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `file` | `File` | File from `<input type="file">` |

### Returns

`Promise<SerializedPipeline>` — resolves with the parsed pipeline object.

### Throws

Rejects with `Error('Invalid JSON file')` if parsing fails.

---

## Dependencies

None — pure functions, no external imports.

## Usage Example

```js
// Save
const serialized = serializePipeline(nodes, edges);
savePipeline('My Pipeline', serialized);

// Load
const { nodes, edges } = deserializePipeline(saved.pipeline);
loadPipeline(nodes, edges);

// Export to file
exportToJSON(serializePipeline(nodes, edges), 'my-pipeline.json');

// Import from file input
const json = await importFromJSON(fileInputEvent.target.files[0]);
const { nodes, edges } = deserializePipeline(json);
```

## Notes

- Schema version `'1.0'` is included in serialized output for future migration support.
- The `exportedAt` timestamp is informational only — not used during deserialization.
- `importFromJSON` returns the raw parsed object — callers must pass it to `deserializePipeline` to get usable nodes/edges.
