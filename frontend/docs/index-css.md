# index.css

> Global stylesheet: Tailwind import, CSS custom properties, scrollbar styles, and animation definitions.

## Overview

`index.css` is the single global CSS file. It imports Tailwind CSS v4, sets base typography and color scheme on `:root`, and defines custom utility classes used across the app (custom scrollbars, toast slide-up animation, ReactFlow port label styles).

## Location

`src/index.css`

## Exports

None — imported as a side effect in `main.jsx`.

## Key Sections

### Tailwind Import
```css
@import "tailwindcss";
```
Tailwind v4 uses a CSS-native import instead of `@tailwind base/components/utilities`.

### `:root` — Base Typography & Color
- Font: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`
- Color scheme forced to `light` (prevents system dark mode from affecting the app)
- Text color: `#1f2937` (Tailwind gray-800)
- Background: `#ffffff`

### `body` / `#root`
- `body`: `margin: 0`, `min-height: 100vh`
- `#root`: `width: 100%`, `height: 100vh` — makes the app fill the full viewport

### `.custom-scrollbar`
Thin 4px scrollbar used on overflow containers (modals, sidebars, panels). Applied via the `custom-scrollbar` class in Tailwind.

```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
```

### `@keyframes slide-up` / `.animate-slide-up`
Used by `Toast.jsx` for the entrance animation:
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.animate-slide-up { animation: slide-up 0.25s ease-out forwards; }
```

### `.port-label`
Tooltip label that appears on hover over a ReactFlow handle. Positioned absolutely, shows on `.react-flow__handle:hover`.

```css
.port-label {
  position: absolute;
  font-size: 9px;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}
.react-flow__handle:hover .port-label { opacity: 1; }
```

## Notes

- Tailwind's JIT scanner cannot detect dynamic class names like `bg-${color}-500`. The safelist in `tailwind.config.js` handles those.
- The `color-scheme: light` declaration prevents OS-level dark mode from inverting colors; this is intentional as the app has no dark mode implementation.
