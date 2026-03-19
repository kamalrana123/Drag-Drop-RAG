# useModal

> Custom hook for managing modal open/close state and props in a single call.

## Overview

`useModal` encapsulates the pattern of tracking whether a modal is open and what props it should receive. It returns an object with `isOpen`, `props`, `open()`, and `close()` — enough to drive any modal component without duplicating state management.

## Location

`src/hooks/useModal.js`

## Parameters

None.

## Returns

| Key | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Whether the modal is currently open |
| `props` | `object` | The props passed to the last `open()` call |
| `open(props)` | `(props: object) => void` | Opens the modal and stores `props` |
| `close()` | `() => void` | Closes the modal and clears props |

## Exports

```js
export function useModal();
```

## Implementation

```js
const [state, setState] = useState({ isOpen: false, props: {} });

return {
  isOpen: state.isOpen,
  props: state.props,
  open: (props) => setState({ isOpen: true, props }),
  close: () => setState({ isOpen: false, props: {} }),
};
```

## Usage Example

```jsx
const confirmModal = useModal();

// Open with specific props
confirmModal.open({
  title: 'Delete Pipeline',
  message: 'This cannot be undone.',
  variant: 'danger',
  onConfirm: () => deletePipeline(name),
});

// Render the modal
<ConfirmModal
  isOpen={confirmModal.isOpen}
  {...confirmModal.props}
  onClose={confirmModal.close}
/>
```

## Notes

- `props` is spread onto the modal component, so the calling code dictates exactly which modal props are set.
- `onConfirm` and similar callbacks should be passed through `open()` as part of the props object — they will be spread onto the modal via `{...confirmModal.props}`.
- Props are cleared on `close()` to avoid stale data if the modal is re-opened with different content.
