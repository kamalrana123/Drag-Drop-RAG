# ModalPortal

> React portal wrapper that renders modal content directly in `document.body`.

## Overview

`ModalPortal` uses `ReactDOM.createPortal` to render its children outside the normal DOM hierarchy. This prevents `z-index` and `overflow: hidden` from ancestor elements from clipping or hiding modals. While open, it sets `overflow: hidden` on `document.body` to prevent background scroll.

## Location

`src/components/modals/ModalPortal.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Whether to render the portal content |
| `children` | `ReactNode` | — | Modal content to portal into `document.body` |

## Exports

```js
export default ModalPortal;
```

## Key Behavior

```jsx
if (!isOpen) return null;
return createPortal(children, document.body);
```

A `useEffect` manages the `overflow: hidden` style:
```js
useEffect(() => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [isOpen]);
```
The cleanup function restores scroll on unmount.

## Dependencies

| Import | Source |
|---|---|
| `createPortal` | `react-dom` |
| `useEffect` | `react` |

## Usage Example

```jsx
<ModalPortal isOpen={isOpen}>
  <div className="fixed inset-0 z-50 ...">
    {/* modal content */}
  </div>
</ModalPortal>
```

## Notes

- All four modal components (`ConfirmModal`, `QueryModal`, `ResultModal`, `WorkflowManager`) use `ModalPortal`.
- Rendering `null` when `!isOpen` (rather than using CSS `display: none`) ensures the modal's internal state and effects are fully torn down between openings.
