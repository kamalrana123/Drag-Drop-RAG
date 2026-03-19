# Spinner

> Minimal animated loading indicator using the `Loader2` icon.

## Overview

`Spinner` is a single-line wrapper around Lucide's `Loader2` icon with `animate-spin` applied. It is used anywhere a loading state needs to be indicated — inside buttons, the ChatPanel input, and node status badges.

## Location

`src/components/ui/Spinner.jsx`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `16` | Icon size in pixels |
| `className` | `string` | `''` | Additional Tailwind classes (e.g., color override) |

## Exports

```js
export default Spinner;
```

## Key Behavior

```jsx
const Spinner = ({ size = 16, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);
```

`animate-spin` is a Tailwind utility that applies `animation: spin 1s linear infinite`.

## Dependencies

| Import | Source |
|---|---|
| `Loader2` | `lucide-react` |

## Usage Example

```jsx
// In a button
<button disabled={isLoading}>
  {isLoading ? <Spinner size={14} className="text-white" /> : <span>Submit</span>}
</button>

// Standalone loading state
{isLoading && <Spinner size={24} className="text-indigo-500 mx-auto" />}
```

## Notes

- For node execution status specifically, `BaseNode` uses `Loader2` directly with `animate-spin` rather than this `Spinner` component — both approaches are equivalent.
- Color defaults to the inherited text color; override with `text-{color}-{shade}` class.
