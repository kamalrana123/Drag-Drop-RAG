# ResultModal

> Replacement for `window.alert()` — a modal for displaying results, errors, or informational messages.

## Overview

`ResultModal` shows a read-only modal with a title, content area, and close button. It auto-formats objects/arrays as pretty-printed JSON. It supports `success` and `error` variants for color coding. Includes a clipboard copy button for the content.

## Location

`src/components/modals/ResultModal.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controls visibility |
| `title` | `string` | — | Modal heading |
| `content` | `string \| object` | — | Content to display (objects are JSON.stringify'd) |
| `variant` | `'success' \| 'error' \| 'info'` | `'info'` | Controls header color and icon |
| `onClose` | `() => void` | — | Called on close |

## Exports

```js
export default ResultModal;
```

## Variant Styles

| Variant | Header color | Icon |
|---|---|---|
| `success` | Green | `CheckCircle2` |
| `error` | Red | `XCircle` |
| `info` | Indigo | `Info` |

## Key Behavior

- Content display: if `content` is an object, renders in `<pre>` with `JSON.stringify(content, null, 2)`. Otherwise renders as a `<p>`.
- Copy button writes the content string to the clipboard via `navigator.clipboard.writeText`.
- Escape key and backdrop click both call `onClose`.
- Content area is scrollable with `custom-scrollbar` and `max-h-96`.

## Dependencies

| Import | Source |
|---|---|
| `ModalPortal` | `./ModalPortal` |
| `CheckCircle2`, `XCircle`, `Info`, `X`, `Copy` | `lucide-react` |

## Usage Example

```jsx
const errorModal = useModal();

// Show an error
errorModal.open({
  title: 'Import Failed',
  content: err.message,
  variant: 'error',
});

<ResultModal
  isOpen={errorModal.isOpen}
  {...errorModal.props}
  onClose={errorModal.close}
/>
```

## Notes

- Used in `WorkflowManager` to display import errors and in `Flow.jsx` to display validation failures and API errors.
- No action buttons — this is purely informational. Use `ConfirmModal` for actions that require confirmation.
