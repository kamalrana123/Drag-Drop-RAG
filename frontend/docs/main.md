# main

> React application entry point — mounts `App` into the DOM.

## Overview

`main.jsx` is the Vite/React entry file. It imports global styles, then renders `<App />` inside `React.StrictMode` using `createRoot`.

## Location

`src/main.jsx`

## Exports

None — this is a side-effect-only entry module.

## Key Behavior

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Mounts to `<div id="root">` in `index.html`. `StrictMode` runs component effects twice in development to catch side-effect bugs.

## Dependencies

| Import | Source |
|---|---|
| `StrictMode`, `createRoot` | `react`, `react-dom/client` |
| `App` | `./App.jsx` |
| Global styles | `./index.css` |

## Notes

- `#root` is defined in `public/index.html` (Vite default).
- No providers (Router, Theme, etc.) are needed at this level — all global state lives in Zustand.
