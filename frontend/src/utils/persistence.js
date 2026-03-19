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

// ── Project CRUD ──────────────────────────────────────────────────────────────
const PROJECTS_KEY = 'drag-drop-rag:projects';

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
function getProjectList() { return safeGet(PROJECTS_KEY, []); }
function setProjectList(list) { localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); }

export function getProjects() { return getProjectList(); }

export function createProject(name, description = '') {
  const now = new Date().toISOString();
  const project = {
    id: genId('proj'),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    pipeline: { version: '1.0', createdAt: now, nodes: [], edges: [] },
    documents: [],
    llmConfig: {
      chatProvider: 'openai',
      chatModel: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      embeddingProvider: 'openai',
      embeddingModel: 'text-embedding-3-small',
      apiKeys: { openai: '', google: '', anthropic: '', cohere: '', mistral: '' },
    },
  };
  const list = getProjectList();
  list.unshift(project);
  setProjectList(list);
  return project;
}

export function saveProjectPipeline(projectId, pipeline) {
  const list = getProjectList();
  const idx = list.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  list[idx] = { ...list[idx], pipeline, updatedAt: new Date().toISOString() };
  setProjectList(list);
}

export function updateProjectMeta(projectId, name, description) {
  const list = getProjectList();
  const idx = list.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  list[idx] = { ...list[idx], name, description, updatedAt: new Date().toISOString() };
  setProjectList(list);
}

export function addDocumentToProject(projectId, doc) {
  const list = getProjectList();
  const idx = list.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    documents: [...(list[idx].documents ?? []), doc],
    updatedAt: new Date().toISOString(),
  };
  setProjectList(list);
}

export function removeDocumentFromProject(projectId, docId) {
  const list = getProjectList();
  const idx = list.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  list[idx] = {
    ...list[idx],
    documents: list[idx].documents.filter((d) => d.id !== docId),
    updatedAt: new Date().toISOString(),
  };
  setProjectList(list);
}

export function deleteProject(projectId) {
  setProjectList(getProjectList().filter((p) => p.id !== projectId));
}

export function getProject(projectId) {
  return getProjectList().find((p) => p.id === projectId) ?? null;
}

export function updateProjectLLMConfig(projectId, llmConfig) {
  const list = getProjectList();
  const idx = list.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  list[idx] = { ...list[idx], llmConfig, updatedAt: new Date().toISOString() };
  setProjectList(list);
}
