import { PORT_TYPES } from '../constants/portTypes';

/**
 * Build an array of handle descriptors for BaseNode.
 * @param {string[]} portTypeIds - e.g. ['query', 'retrieved_docs']
 * @param {'source'|'target'} handleType
 */
export function buildHandles(portTypeIds, handleType) {
  return portTypeIds.map((typeId, index) => {
    const key = typeId.toUpperCase();
    const pt = PORT_TYPES[key];
    return {
      id: `${handleType}-${typeId}-${index}`,
      portType: typeId,
      label: pt?.label ?? typeId,
      color: pt?.color ?? '#9ca3af',
    };
  });
}

/**
 * Extract the port type string from a handle id like "source-chunks-0" → "chunks"
 */
export function extractPortType(handleId) {
  if (!handleId) return null;
  const parts = handleId.split('-');
  // remove first (source/target) and last (index)
  if (parts.length < 3) return null;
  return parts.slice(1, -1).join('_');
}
