import { useEffect } from 'react';

/**
 * Register keyboard shortcuts.
 * @param {Array<{ keys: string[], handler: () => void }>} shortcuts
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      for (const { keys, handler: fn } of shortcuts) {
        const [main, ...mods] = keys;
        const tagName = document.activeElement?.tagName;
        const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);

        if (
          e.key.toLowerCase() === main.toLowerCase() &&
          (!mods.includes('ctrl')  || e.ctrlKey || e.metaKey) &&
          (!mods.includes('shift') || e.shiftKey) &&
          !inInput
        ) {
          e.preventDefault();
          fn();
          break;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
