# modals/index

> Barrel export for all modal components.

## Overview

`index.js` re-exports all four modal components from a single entry point, so callers can import multiple modals in one line.

## Location

`src/components/modals/index.js`

## Exports

```js
export { default as ModalPortal } from './ModalPortal';
export { default as ConfirmModal } from './ConfirmModal';
export { default as QueryModal } from './QueryModal';
export { default as ResultModal } from './ResultModal';
```

## Usage Example

```js
import { ConfirmModal, ResultModal } from '../components/modals';
```

## Notes

- `ModalPortal` is also exported here for completeness, though most callers import it directly since it wraps the others internally.
- Any new modal added to this folder should also be added to this index.
