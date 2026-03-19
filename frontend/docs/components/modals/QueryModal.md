# QueryModal

> Replacement for `window.prompt()` — a modal text input for collecting user queries.

## Overview

`QueryModal` presents a modal with a `<textarea>` for entering a query. It supports a loading state (disables submit while pending), Enter-to-submit, and Shift+Enter for multiline input. Used in `Flow.jsx` to collect the RAG query before execution (if not using `ChatPanel`).

## Location

`src/components/modals/QueryModal.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controls visibility |
| `title` | `string` | `'Enter Query'` | Modal heading |
| `placeholder` | `string` | `'Type your question…'` | Textarea placeholder text |
| `submitLabel` | `string` | `'Run'` | Submit button label |
| `isLoading` | `boolean` | `false` | Shows spinner and disables submit when true |
| `onSubmit` | `(value: string) => void` | — | Called with the trimmed query string |
| `onClose` | `() => void` | — | Called on cancel or Escape |

## Exports

```js
export default QueryModal;
```

## Key State

| State | Type | Description |
|---|---|---|
| `value` | `string` | Controlled textarea value, reset to `''` on open |

## Key Behavior

- `useEffect` resets `value` to `''` whenever `isOpen` changes to `true`.
- `useEffect` registers Escape keydown listener while open.
- `handleSubmit()`: trims value, calls `onSubmit(trimmed)` if non-empty, then `onClose()`.
- `onKeyDown` on textarea: `Enter` (without Shift) triggers `handleSubmit()`; `Shift+Enter` inserts a newline normally.
- Submit button is disabled when `value.trim()` is empty or `isLoading` is true.

## Dependencies

| Import | Source |
|---|---|
| `ModalPortal` | `./ModalPortal` |
| `Spinner` | `../ui/Spinner` |
| `X` | `lucide-react` |

## Usage Example

```jsx
const queryModal = useModal();

<QueryModal
  isOpen={queryModal.isOpen}
  title="Run Pipeline Query"
  isLoading={isRunningQuery}
  onSubmit={(q) => runQuery(q)}
  onClose={queryModal.close}
/>
```

## Notes

- The `isLoading` prop is controlled by the caller — `QueryModal` itself does not make any async calls.
- Backdrop click does NOT close the modal while loading (`isLoading` disables `onClose` on backdrop when loading state is active).
