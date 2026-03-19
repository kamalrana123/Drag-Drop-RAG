const SCHEMA_VERSION = '1.0';

export function serializePipeline(nodes, edges) {
  return {
    version: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { label: n.data.label, type: n.data.type, config: n.data.config || {} },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      data: e.data ?? {},
    })),
  };
}

export function deserializePipeline(json) {
  if (!json?.version || !Array.isArray(json.nodes) || !Array.isArray(json.edges)) {
    throw new Error('Invalid pipeline file format.');
  }

  const nodes = json.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { label: n.data.label, type: n.data.type, config: n.data.config || {} },
  }));

  const edges = json.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? null,
    targetHandle: e.targetHandle ?? null,
    animated: true,
    style: { strokeWidth: 2, stroke: '#6366f1' },
    data: e.data ?? {},
  }));

  return { nodes, edges };
}

export function exportToJSON(pipeline, filename) {
  const blob = new Blob([JSON.stringify(pipeline, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `rag-pipeline-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch {
        reject(new Error('Invalid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
