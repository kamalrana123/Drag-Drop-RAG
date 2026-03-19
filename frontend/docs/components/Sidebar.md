# Sidebar

> Left panel node palette — searchable, collapsible category list of all 33 draggable node types.

## Overview

`Sidebar` renders the left-side panel with a search input and a categorized list of all nodes from `NODE_REGISTRY`. Categories are collapsible. Nodes are draggable onto the `Flow` canvas. The first 7 categories are expanded by default; advanced categories start collapsed.

## Location

`src/components/Sidebar.jsx`

## Props

None — reads from `NODE_REGISTRY` constant directly.

## Exports

```js
export default Sidebar;
```

## Key State

| State | Type | Default | Description |
|---|---|---|---|
| `searchTerm` | `string` | `''` | Filters nodes across label, type, description, and tags |
| `collapsedCategories` | `Set<string>` | Advanced categories closed | Tracks which category sections are collapsed |

## Key Behavior

### Search Filtering
When `searchTerm` is non-empty, all categories are flattened and nodes are filtered by:
```js
node.label.toLowerCase().includes(term)
|| node.type.toLowerCase().includes(term)
|| node.description?.toLowerCase().includes(term)
|| node.tags?.some(t => t.includes(term))
```
If no results match, an empty state with a "Clear search" button is shown.

### Category Groups
Nodes are grouped by `node.category` preserving the order defined by `node.categoryOrder`. Each group has a toggle button to expand/collapse.

### Drag-and-Drop
Each node item sets `dataTransfer` on `dragStart`:
```js
e.dataTransfer.setData('application/reactflow', node.type);
e.dataTransfer.effectAllowed = 'move';
```
`Flow.jsx` reads this type on `drop`.

### Node Count Badge
Each category header shows the count of nodes it contains.

## Dependencies

| Import | Source |
|---|---|
| `NODE_REGISTRY` | `../constants/nodeRegistry` |
| `ChevronDown`, `ChevronRight`, `Search`, `X` | `lucide-react` |

## Usage Example

```jsx
// In App.jsx
<main className="flex-1 relative overflow-hidden flex">
  <Sidebar />
  ...
</main>
```

## Notes

- When `searchTerm` is active, the collapsed/expanded state of categories is ignored and all matching nodes are shown in a flat list.
- The "Quick tip" footer at the bottom of the sidebar reminds users to drag nodes onto the canvas.
