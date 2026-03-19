# ChatPanel

> Right-side interactive chat interface for querying the RAG pipeline.

## Overview

`ChatPanel` replaces the old `window.prompt()` approach for running queries. It renders a persistent chat UI with message history, an input field, and source citation display. It reads the `_runQuery` handler stored on the Zustand store by `Flow.jsx` and calls it when the user submits a message.

## Location

`src/components/ChatPanel.jsx`

## Props

None — reads state from the Zustand store.

## Exports

```js
export default ChatPanel;
```

## Sub-components

### `UserMessage`
Renders a right-aligned bubble for user messages.

### `AssistantMessage`
Renders a left-aligned bubble for assistant messages. Includes:
- Answer text
- Collapsible **Sources** accordion (if `message.sources` array exists)
- Copy-to-clipboard button

## Key State

| State | Type | Description |
|---|---|---|
| `input` | `string` | Controlled textarea value |
| `isLoading` | `boolean` | True while waiting for API response |

## Key Behavior

### Sending a Message
1. Appends a user message via `addChatMessage({ role: 'user', content: input })`.
2. Calls `store._runQuery(input)` — the handler registered by `Flow.jsx`.
3. Sets `isLoading = true`.
4. On response, appends assistant message with `{ role: 'assistant', content, sources }`.
5. Sets `isLoading = false`.

### Auto-scroll
A `useEffect` on `chatHistory` scrolls `messagesEndRef` into view after each new message.

### Keyboard Handling
- `Enter` → submit (if input not empty and not loading)
- `Shift+Enter` → newline in textarea

### Clear History
A trash icon button calls `clearChatHistory()` from the store.

### Close
An `X` button calls `setChatPanelOpen(false)` from the store, switching back to `SettingsPanel`.

## Dependencies

| Import | Source |
|---|---|
| `useStore` | `../store` |
| `Spinner` | `./ui/Spinner` |
| `Send`, `X`, `Trash2`, `Copy`, `ChevronDown`, `ChevronUp`, `BookOpen` | `lucide-react` |

## Usage Example

```jsx
// In App.jsx
{chatPanelOpen ? <ChatPanel /> : <SettingsPanel />}
```

## Notes

- `_runQuery` is a non-standard store property set by `Flow.jsx` via `useEffect`. It is not a Zustand action — it's a function reference stored as plain state.
- If no pipeline has been run (no `_runQuery` on the store), sending a message will gracefully show an error assistant message.
- Source citations are displayed as a collapsible accordion per message — each source shows its filename and a text excerpt.
