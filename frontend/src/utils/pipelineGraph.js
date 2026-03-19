import { NODE_PORT_SPECS } from '../constants/portTypes';

/**
 * Topological sort using Kahn's algorithm (BFS).
 * Returns nodeId[] in execution order, or throws if a cycle is detected.
 */
export function topoSort(nodes, edges) {
  const inDegree = {};
  const adj = {};

  for (const n of nodes) {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  }

  for (const e of edges) {
    if (adj[e.source] !== undefined) {
      adj[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target]++;
    }
  }

  const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
  const result = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    result.push(nodeId);
    for (const neighbor of adj[nodeId] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  if (result.length !== nodes.length) {
    throw new Error('Pipeline contains a cycle — cannot execute.');
  }

  return result;
}

/**
 * Validate a pipeline before execution.
 * Returns { valid: boolean, errors: string[], warnings: string[] }
 */
export function validatePipeline(nodes, edges) {
  const errors = [];
  const warnings = [];

  if (nodes.length === 0) {
    return { valid: false, errors: ['Canvas is empty. Add nodes to build a pipeline.'], warnings };
  }

  // 1. Check for cycles
  try {
    topoSort(nodes, edges);
  } catch {
    errors.push('Pipeline contains a cycle. Remove the circular connection.');
    return { valid: false, errors, warnings };
  }

  // 2. Build edge map: target nodeId → Set of source nodeIds
  const incomingEdges = {};
  const outgoingEdges = {};
  for (const n of nodes) { incomingEdges[n.id] = []; outgoingEdges[n.id] = []; }
  for (const e of edges) {
    incomingEdges[e.target]?.push(e);
    outgoingEdges[e.source]?.push(e);
  }

  // 3. Per-node validations
  for (const n of nodes) {
    const specs = NODE_PORT_SPECS[n.type];
    if (!specs) continue;

    const hasInput = incomingEdges[n.id].length > 0;
    const hasOutput = outgoingEdges[n.id].length > 0;
    const needsInput = specs.inputs.length > 0;

    if (needsInput && !hasInput) {
      errors.push(`"${n.data.label}" (${n.type}) has no incoming connections.`);
    }

    if (specs.outputs.length > 0 && !hasOutput) {
      warnings.push(`"${n.data.label}" (${n.type}) output is not connected to anything.`);
    }
  }

  // 4. Check at least one source node exists
  const sourceTypes = ['FileSource', 'WebSource', 'S3Source'];
  const hasSource = nodes.some((n) => sourceTypes.includes(n.type));
  if (!hasSource) {
    warnings.push('No data source node (File Upload, Web Crawler, S3) found.');
  }

  // 5. Check at least one output node exists
  const outputTypes = ['LLMResponse', 'Summarizer', 'StructuredOutput', 'StreamingResponse', 'CitationGenerator'];
  const hasOutput = nodes.some((n) => outputTypes.includes(n.type));
  if (!hasOutput) {
    warnings.push('No output node (LLM Response, Summarizer, etc.) found.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
