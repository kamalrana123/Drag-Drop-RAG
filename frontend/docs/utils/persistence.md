# persistence

> localStorage utilities for named pipeline saves and autosave.

## Overview

`persistence.js` provides all localStorage read/write operations for pipeline data. It manages two storage keys: one for named saves (user-controlled) and one for the autosave slot (written on every canvas change).

## Location

`src/utils/persistence.js`

## Exports

```js
export function getSavedPipelines();
export function savePipeline(name, pipeline);
export function deletePipeline(name);
export function renamePipeline(oldName, newName);
export function autoSave(pipeline);
export function loadAutosave();
```

---

## Storage Keys

| Key | Purpose |
|---|---|
| `drag-drop-rag:saved-pipelines` | Array of named `{ name, pipeline, savedAt }` objects |
| `drag-drop-rag:autosave` | Single `{ pipeline, savedAt }` object for crash recovery |

---

## Functions

### `getSavedPipelines()`
Returns `SavedPipeline[]` from localStorage, or `[]` if nothing is saved or JSON is invalid.

```js
type SavedPipeline = { name: string, pipeline: SerializedPipeline, savedAt: string }
```

### `savePipeline(name, pipeline)`
Upserts a pipeline by name. If a pipeline with that name already exists, replaces it. Otherwise appends. Updates `savedAt` to current ISO timestamp.

### `deletePipeline(name)`
Filters out the entry with the given name and writes back.

### `renamePipeline(oldName, newName)`
Finds the entry by `oldName` and updates its `name` field. No-ops if `oldName` not found.

### `autoSave(pipeline)`
Writes `{ pipeline, savedAt }` to the autosave key. Called on every store change via the Zustand subscription in `store.js`.

### `loadAutosave()`
Returns `{ pipeline, savedAt }` from the autosave key, or `null` if not found or invalid.

---

## Dependencies

None — only uses `localStorage` (browser API).

## Usage Example

```js
// Save current canvas
savePipeline('My RAG Pipeline', serializePipeline(nodes, edges));

// Load all saves for display
const list = getSavedPipelines();

// Delete a save
deletePipeline('Old Pipeline');

// Rename
renamePipeline('Old Name', 'New Name');

// Autosave (called automatically by store subscription)
autoSave(serializePipeline(nodes, edges));

// Restore on startup
const saved = loadAutosave();
if (saved) {
  const { nodes, edges } = deserializePipeline(saved.pipeline);
}
```

## Notes

- All functions wrap localStorage access in try/catch to handle `QuotaExceededError` and other storage failures gracefully (returning empty defaults).
- `savedAt` is an ISO 8601 string (`new Date().toISOString()`). The `WorkflowManager` renders it with `new Date(entry.savedAt).toLocaleDateString()`.
- Named saves and autosave are independent — clearing autosave does not affect named saves.
- There is no pagination or size limit enforced on named saves — this could eventually hit localStorage's ~5MB limit in large projects.
