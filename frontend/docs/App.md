# App

> Root application shell: layout, header toolbar, keyboard shortcuts, and panel routing.

## Overview

`App` is the top-level component that composes the entire UI. It renders the header toolbar (undo/redo, workflows, save), the three-column main layout (Sidebar | Canvas | Right Panel), and the `WorkflowManager` modal. It also wires up keyboard shortcuts via `useKeyboardShortcuts`.

## Location

`src/App.jsx`

## Props / Parameters

None — this is the root component mounted by `main.jsx`.

## Exports

```js
export default App;
```

## Key State

| State | Type | Default | Description |
|---|---|---|---|
| `workflowOpen` | `boolean` | `false` | Controls `WorkflowManager` modal visibility |
| `savePopover` | `boolean` | `false` | Controls the inline "Save Pipeline" popover |
| `saveName` | `string` | `''` | Controlled input for pipeline save name |

## Zustand Store Reads

| Value | Purpose |
|---|---|
| `undo` | Bound to Ctrl+Z and Undo button |
| `redo` | Bound to Ctrl+Shift+Z and Redo button |
| `history` | Disables Undo button when empty |
| `future` | Disables Redo button when empty |
| `nodes`, `edges` | Serialized when saving a pipeline |
| `chatPanelOpen` | Switches right panel between `ChatPanel` and `SettingsPanel` |

## Key Functions

### `handleSave()`
Reads `saveName`, calls `savePipeline(name, serializePipeline(nodes, edges))`, then resets and closes the popover. No-ops if name is blank.

## Dependencies

| Import | Source |
|---|---|
| `Flow` | `./components/Flow` |
| `Sidebar` | `./components/Sidebar` |
| `SettingsPanel` | `./components/SettingsPanel` |
| `ValidationBanner` | `./components/ValidationBanner` |
| `WorkflowManager` | `./components/WorkflowManager` |
| `ChatPanel` | `./components/ChatPanel` |
| `useStore` | `./store` |
| `useKeyboardShortcuts` | `./hooks/useKeyboardShortcuts` |
| `savePipeline` | `./utils/persistence` |
| `serializePipeline` | `./utils/pipelineSerialization` |

## Layout Structure

```
<div> (full screen flex column)
  <header>              ← Logo + toolbar (undo/redo/workflows/save)
  <main> (flex row)
    <Sidebar />         ← Left: node palette
    <div>               ← Center: canvas area
      <ValidationBanner />
      <Flow />
    </div>
    <ChatPanel />       ← Right (when chatPanelOpen)
    OR
    <SettingsPanel />   ← Right (when !chatPanelOpen)
  </main>
  <WorkflowManager />   ← Modal overlay
```

## Usage Example

```jsx
// main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
```

## Notes

- The shortcuts array is `useMemo`-ized to avoid re-registering listeners on every render.
- The save popover closes on `Escape` (handled by the input's `onKeyDown` checking Enter, but Escape dismissal is handled by clicking outside — close button must be used explicitly).
- `chatPanelOpen` is driven entirely from the Zustand store; `App` does not own that toggle directly.
