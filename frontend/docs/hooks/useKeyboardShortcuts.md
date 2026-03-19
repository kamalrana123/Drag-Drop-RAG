# useKeyboardShortcuts

> Custom hook that registers and manages global keyboard shortcuts.

## Overview

`useKeyboardShortcuts` takes an array of shortcut definitions (each with a key combination and handler) and attaches a single `keydown` listener to `window`. Shortcuts are ignored when the user is typing in an `<input>` or `<textarea>`. The listener is re-registered whenever the `shortcuts` array reference changes.

## Location

`src/hooks/useKeyboardShortcuts.js`

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `shortcuts` | `Shortcut[]` | Array of `{ keys: string[], handler: () => void }` objects |

### `Shortcut` object

| Field | Type | Description |
|---|---|---|
| `keys` | `string[]` | Key combination. Lowercase key name (`'z'`, `'s'`) plus optional modifiers: `'ctrl'`, `'shift'`, `'alt'` |
| `handler` | `() => void` | Function to call when the combination is detected |

## Exports

```js
export function useKeyboardShortcuts(shortcuts);
```

## Key Behavior

```js
const handler = (e) => {
  // Skip if user is typing in an input/textarea
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

  for (const shortcut of shortcuts) {
    const needsCtrl  = shortcut.keys.includes('ctrl');
    const needsShift = shortcut.keys.includes('shift');
    const key = shortcut.keys.find(k => !['ctrl','shift','alt'].includes(k));

    if (
      e.key.toLowerCase() === key &&
      e.ctrlKey === needsCtrl &&
      e.shiftKey === needsShift
    ) {
      e.preventDefault();
      shortcut.handler();
    }
  }
};
window.addEventListener('keydown', handler);
return () => window.removeEventListener('keydown', handler);
```

## Usage Example

```jsx
// In App.jsx
const shortcuts = useMemo(() => [
  { keys: ['z', 'ctrl'],          handler: undo },
  { keys: ['z', 'ctrl', 'shift'], handler: redo },
  { keys: ['s', 'ctrl'],          handler: () => setSavePopover(true) },
], [undo, redo]);

useKeyboardShortcuts(shortcuts);
```

## Notes

- The `shortcuts` array should be `useMemo`-ized in the calling component to prevent the `useEffect` from re-running on every render.
- Modifier detection is based on `e.ctrlKey` / `e.shiftKey` directly from the event, not by checking `keys` order.
- Meta key (Cmd on Mac) is not handled — this app targets Windows/Linux only.
- `e.preventDefault()` is called for matched shortcuts to prevent browser defaults (e.g., Ctrl+S saving the page).
