# Toast

> Auto-dismissing notification banner displayed at the bottom-center of the screen.

## Overview

`Toast` renders a fixed-position notification that automatically dismisses itself after a configurable duration (default 4 seconds). It supports error, success, and warning visual variants. The entrance uses a slide-up CSS animation defined in `index.css`.

## Location

`src/components/ui/Toast.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | — | Notification text |
| `variant` | `'error' \| 'success' \| 'warning'` | `'info'` | Controls color and icon |
| `duration` | `number` | `4000` | Auto-dismiss delay in milliseconds |
| `onClose` | `() => void` | — | Called when dismissed (auto or manual) |

## Exports

```js
export default Toast;
```

## Variant Styles

| Variant | Background | Icon |
|---|---|---|
| `error` | Red-600 | `XCircle` |
| `success` | Green-600 | `CheckCircle2` |
| `warning` | Amber-500 | `AlertTriangle` |

## Key Behavior

- A `useEffect` sets a `setTimeout` for `duration` ms that calls `onClose`.
- Cleanup cancels the timeout if the component unmounts before it fires.
- Manual close button also calls `onClose` immediately.
- Uses `.animate-slide-up` class (defined in `index.css`) for entrance animation.
- Positioned `fixed bottom-6 left-1/2 -translate-x-1/2` — horizontally centered at the bottom.

## Dependencies

| Import | Source |
|---|---|
| `XCircle`, `CheckCircle2`, `AlertTriangle`, `X` | `lucide-react` |

## Usage Example

```jsx
const [toast, setToast] = useState(null);

{toast && (
  <Toast
    message={toast.message}
    variant={toast.variant}
    onClose={() => setToast(null)}
  />
)}
```

## Notes

- `Toast` does not manage its own visibility — the parent is responsible for mounting/unmounting it. Calling `onClose` should unmount the component.
- Multiple toasts stacking is not supported by default — only one Toast should be rendered at a time.
