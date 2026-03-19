# ConfirmModal

> Replacement for `window.confirm()` — a styled confirmation dialog with danger/warning/info variants.

## Overview

`ConfirmModal` presents a modal dialog asking the user to confirm or cancel an action. It supports three visual variants and fires `onConfirm` or `onClose` accordingly. Closes on Escape key press or backdrop click.

## Location

`src/components/modals/ConfirmModal.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controls visibility |
| `title` | `string` | — | Dialog heading |
| `message` | `string` | — | Body text explaining the action |
| `confirmLabel` | `string` | `'Confirm'` | Text for the confirm button |
| `cancelLabel` | `string` | `'Cancel'` | Text for the cancel button |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'info'` | Controls colors and icon |
| `onConfirm` | `() => void` | — | Called when user clicks confirm |
| `onClose` | `() => void` | — | Called when user cancels or dismisses |

## Exports

```js
export default ConfirmModal;
```

## Variant Styles

| Variant | Icon | Confirm button color | Icon color |
|---|---|---|---|
| `danger` | `AlertTriangle` | Red | Red |
| `warning` | `AlertTriangle` | Amber | Amber |
| `info` | `Info` | Indigo | Indigo |

## Key Behavior

- Renders inside `ModalPortal`.
- `useEffect` registers an `Escape` keydown listener while open; cleans it up on close.
- Backdrop `<div>` has `onClick={onClose}`.
- Confirm button calls `onConfirm()` then `onClose()`.

## Dependencies

| Import | Source |
|---|---|
| `ModalPortal` | `./ModalPortal` |
| `AlertTriangle`, `Info`, `X` | `lucide-react` |

## Usage Example

```jsx
const confirmModal = useModal();

<button onClick={() => confirmModal.open({
  title: 'Clear Canvas',
  message: 'This will remove all nodes and edges.',
  variant: 'danger',
  confirmLabel: 'Clear',
  onConfirm: () => { setNodes([]); setEdges([]); },
})}>
  Clear
</button>

<ConfirmModal
  isOpen={confirmModal.isOpen}
  {...confirmModal.props}
  onClose={confirmModal.close}
/>
```

## Notes

- `onConfirm` and `onClose` are both called when the user confirms (confirm action + dismiss). If only cancelling, only `onClose` is called.
- No async support — if the confirm action is async, the caller is responsible for showing loading state.
