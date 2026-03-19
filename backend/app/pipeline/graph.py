"""DAG builder and topological sort for the visual pipeline."""
from collections import defaultdict, deque
from typing import Any


def topological_sort(nodes: list[dict], edges: list[dict]) -> list[dict]:
    """
    Return nodes in topological order using Kahn's algorithm.
    Raises ValueError if the graph has a cycle.
    """
    # Build: node_id → node dict
    node_map: dict[str, dict] = {n["id"]: n for n in nodes}

    # in-degree and adjacency
    in_degree: dict[str, int] = {n["id"]: 0 for n in nodes}
    adj: dict[str, list[str]] = defaultdict(list)  # source_id → [target_id, ...]

    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        if src in in_degree and tgt in in_degree:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    queue: deque[str] = deque(nid for nid, deg in in_degree.items() if deg == 0)
    sorted_ids: list[str] = []

    while queue:
        nid = queue.popleft()
        sorted_ids.append(nid)
        for neighbour in adj[nid]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    if len(sorted_ids) != len(nodes):
        raise ValueError("Pipeline contains a cycle — cannot execute")

    return [node_map[nid] for nid in sorted_ids]


def build_input_map(edges: list[dict]) -> dict[str, list[dict]]:
    """
    Return a map: target_node_id → list of { source_node_id, source_handle, target_handle }
    Used by the executor to collect upstream outputs.
    """
    result: dict[str, list[dict]] = defaultdict(list)
    for edge in edges:
        result[edge["target"]].append({
            "source_node_id": edge["source"],
            "source_handle": edge.get("sourceHandle", ""),
            "target_handle": edge.get("targetHandle", ""),
        })
    return result


def extract_port_type(handle_id: str) -> str:
    """
    Handle IDs follow the pattern: '<role>-<portType>[-<suffix>]'
    e.g. 'target-raw_documents-0' → 'raw_documents'
         'source-any-fieldName'   → 'any'
    """
    parts = handle_id.split("-")
    if len(parts) < 2:
        return "any"
    # role is parts[0], portType is parts[1], optional suffix follows
    return parts[1]
