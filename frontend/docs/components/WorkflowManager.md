# WorkflowManager

> Modal for managing pipeline workflows: loading templates, saving/renaming/deleting named pipelines, and importing/exporting JSON.

## Overview

`WorkflowManager` is a full-screen modal with three tabs. The **Templates** tab shows 5 preset RAG pipeline configurations. The **Saved Pipelines** tab lets users save the current canvas with a name, load/rename/delete/export individual saves. The **Import / Export** tab handles JSON file download and upload.

## Location

`src/components/WorkflowManager.jsx`

## Props

| Prop | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called when backdrop or X is clicked |

## Exports

```js
export default WorkflowManager;
```

## Tabs

### Tab 0 — Templates
Lists all entries from `PIPELINE_TEMPLATES`. Each card shows name, description, and node count. "Load" button calls `handleLoadTemplate(tpl)`.

### Tab 1 — Saved Pipelines
- **Save current**: Input + Save button. Calls `savePipeline(name, serializePipeline(nodes, edges))`.
- **Pipeline list**: Each entry has Load / Rename / Export JSON / Delete actions.
- Inline rename: clicking Edit2 icon replaces the name display with an input field. Enter or checkmark commits via `commitRename`.

### Tab 2 — Import / Export
- **Export**: Downloads current canvas as JSON via `exportToJSON`.
- **Import**: Opens file picker, reads the JSON, deserializes, and loads the pipeline. Errors shown in a `ResultModal`.

## Key State

| State | Type | Description |
|---|---|---|
| `tab` | `number` | Active tab index (0/1/2) |
| `savedList` | `SavedPipeline[]` | Refreshed from `getSavedPipelines()` |
| `saveNameInput` | `string` | Controlled input for saving current pipeline |
| `renamingIdx` | `number \| null` | Index of the entry currently being renamed |
| `renameValue` | `string` | Controlled input for rename |

## Key Functions

| Function | Description |
|---|---|
| `handleLoadTemplate(tpl)` | Deserializes and loads a preset template |
| `handleSaveCurrent()` | Saves current canvas with name from input |
| `handleLoadSaved(entry)` | Loads a saved pipeline from localStorage |
| `handleDelete(name)` | Deletes a pipeline and refreshes list |
| `handleExport(entry)` | Downloads a saved pipeline as JSON |
| `handleExportCurrent()` | Downloads current canvas as JSON |
| `handleImport(e)` | Reads file input, parses JSON, loads pipeline |
| `commitRename(oldName)` | Applies rename and exits rename mode |
| `refresh()` | Re-reads saved pipelines from localStorage |

## Dependencies

| Import | Source |
|---|---|
| `useModal` | `../hooks/useModal` |
| `ResultModal` | `./modals` |
| `ModalPortal` | `./modals/ModalPortal` |
| `useStore` | `../store` |
| `PIPELINE_TEMPLATES` | `../constants/pipelineTemplates` |
| `serializePipeline`, `deserializePipeline`, `exportToJSON`, `importFromJSON` | `../utils/pipelineSerialization` |
| `getSavedPipelines`, `savePipeline`, `deletePipeline`, `renamePipeline` | `../utils/persistence` |

## Notes

- `ResultModal` is rendered as a sibling outside `ModalPortal` (both wrapped in a fragment) — this was required to fix a Vite parse error where JSX siblings needed a wrapper element.
- Saved pipelines list is refreshed after every mutation via `refresh()` → `setSavedList(getSavedPipelines())`.
- Import errors (invalid JSON, schema mismatch) are caught and displayed via the `errorModal` from `useModal`.
