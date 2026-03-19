/**
 * Central API client — all backend calls go through here.
 * Reads the JWT token from the Zustand store and attaches it to every request.
 * Base URL: VITE_API_URL env var (defaults to /api/v1, proxied by Nginx or Vite).
 */

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

function getToken() {
  // Lazy import to avoid circular dependency with store
  const { useStore } = require('../store');
  return useStore.getState().token;
}

// ── Core request helper ───────────────────────────────────────────────────────

async function request(method, path, body = undefined, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err.detail ?? err.message ?? detail;
    } catch { /* ignore parse errors */ }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)        => request('GET',    path);
const post = (path, body)  => request('POST',   path, body);
const put  = (path, body)  => request('PUT',    path, body);
const del  = (path)        => request('DELETE', path);
const upload = (path, formData) => request('POST', path, formData, true);

// ── Auth ──────────────────────────────────────────────────────────────────────

const auth = {
  register: (email, password) => post('/auth/register', { email, password }),
  login:    (email, password) => post('/auth/login',    { email, password }),
  me:       ()                => get('/auth/me'),
};

// ── Projects ──────────────────────────────────────────────────────────────────

const projects = {
  list:   ()                        => get('/projects'),
  create: (name, description = '')  => post('/projects', { name, description }),
  get:    (id)                      => get(`/projects/${id}`),
  update: (id, data)                => put(`/projects/${id}`, data),
  remove: (id)                      => del(`/projects/${id}`),
};

// ── Documents ─────────────────────────────────────────────────────────────────

const documents = {
  list:   (projectId)        => get(`/projects/${projectId}/documents`),
  upload: (projectId, file)  => {
    const fd = new FormData();
    fd.append('file', file);
    return upload(`/projects/${projectId}/documents`, fd);
  },
  remove: (projectId, docId) => del(`/projects/${projectId}/documents/${docId}`),
  status: (projectId, docId) => get(`/projects/${projectId}/documents/${docId}/status`),
};

// ── Pipelines ─────────────────────────────────────────────────────────────────

const pipelines = {
  list:   (projectId)                         => get(`/projects/${projectId}/pipelines`),
  create: (projectId, data)                   => post(`/projects/${projectId}/pipelines`, data),
  get:    (projectId, pipelineId)             => get(`/projects/${projectId}/pipelines/${pipelineId}`),
  update: (projectId, pipelineId, data)       => put(`/projects/${projectId}/pipelines/${pipelineId}`, data),
  remove: (projectId, pipelineId)             => del(`/projects/${projectId}/pipelines/${pipelineId}`),
};

// ── LLM Config ────────────────────────────────────────────────────────────────

const llmConfig = {
  get:  (projectId)      => get(`/projects/${projectId}/llm-config`),
  save: (projectId, cfg) => put(`/projects/${projectId}/llm-config`, cfg),
};

// ── Execution ─────────────────────────────────────────────────────────────────

const execution = {
  runIngestion: (projectId, payload = {}) =>
    post(`/projects/${projectId}/run-ingestion`, payload),

  getJob: (projectId, jobId) =>
    get(`/projects/${projectId}/jobs/${jobId}`),

  runQuery: (projectId, query, nodes = undefined, edges = undefined, pipelineId = undefined) =>
    post(`/projects/${projectId}/run-query`, { query, pipeline_id: pipelineId, nodes, edges }),

  /**
   * Returns a native EventSource for SSE streaming.
   * The caller is responsible for closing it.
   */
  streamQuery: (projectId, query) => {
    const token = getToken();
    const url = `${API_BASE}/projects/${projectId}/run-query/stream?query=${encodeURIComponent(query)}`;
    // EventSource doesn't support custom headers, so we append token as a query param
    // The backend should accept ?token= as a fallback (or use a cookie)
    return new EventSource(token ? `${url}&token=${encodeURIComponent(token)}` : url);
  },
};

// ── Public API object ─────────────────────────────────────────────────────────

export const api = {
  auth,
  projects,
  documents,
  pipelines,
  llmConfig,
  execution,
};

export default api;
