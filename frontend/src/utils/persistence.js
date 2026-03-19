const SAVED_KEY   = 'drag-drop-rag:saved-pipelines';
const AUTOSAVE_KEY = 'drag-drop-rag:autosave';

function safeGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function getSavedPipelines() { return safeGet(SAVED_KEY, []); }

export function savePipeline(name, pipeline) {
  const list = getSavedPipelines();
  const idx  = list.findIndex((p) => p.name === name);
  const entry = { name, pipeline, savedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function deletePipeline(name) {
  const list = getSavedPipelines().filter((p) => p.name !== name);
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function renamePipeline(oldName, newName) {
  const list = getSavedPipelines().map((p) =>
    p.name === oldName ? { ...p, name: newName } : p
  );
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function autoSave(pipeline) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ pipeline, savedAt: Date.now() }));
  } catch { /* quota exceeded — ignore */ }
}

export function loadAutosave() { return safeGet(AUTOSAVE_KEY, null); }
