"""Graph RAG nodes: KnowledgeGraphBuilder, GraphRetriever."""
import json
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.pipeline.llm_factory import build_chat_llm


async def handle_knowledge_graph_builder(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Extract entities and relationships from chunks and build a NetworkX graph."""
    import networkx as nx

    chunks: list[Document] = inputs.get("chunks", inputs.get("raw_documents", []))
    if not chunks:
        return {"graph": {"nodes": [], "edges": [], "project_id": project_id}}

    llm = build_chat_llm(
        provider=llm_config.get("chat_provider", "openai"),
        model=llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=0.0,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", 'Extract entities and relationships. Return JSON: {"entities": ["A","B"], "relations": [["A","relates_to","B"]]}'),
        ("human", "{text}"),
    ])
    chain = prompt | llm | StrOutputParser()

    G = nx.DiGraph()
    for chunk in chunks[:20]:  # limit to first 20 chunks for performance
        try:
            raw = await chain.ainvoke({"text": chunk.page_content[:800]})
            data = json.loads(raw)
            for entity in data.get("entities", []):
                G.add_node(entity)
            for rel in data.get("relations", []):
                if len(rel) == 3:
                    G.add_edge(rel[0], rel[2], relation=rel[1])
        except Exception:
            continue

    # Serialise for storage
    graph_data = {
        "nodes": list(G.nodes()),
        "edges": [{"source": u, "target": v, "relation": d.get("relation", "")}
                  for u, v, d in G.edges(data=True)],
        "project_id": project_id,
        "_nx_graph": G,
    }
    return {"graph": graph_data}


async def handle_graph_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Retrieve relevant nodes/subgraphs for a query."""
    graph_data: dict = inputs.get("graph", {})
    query: str = inputs.get("query", "")
    k = int(config.get("topK", 5))

    if not graph_data or not query:
        return {"retrieved_docs": []}

    nodes: list[str] = graph_data.get("nodes", [])
    edges: list[dict] = graph_data.get("edges", [])

    # Simple keyword-match retrieval on node names
    query_lower = query.lower()
    relevant_nodes = [n for n in nodes if any(w in n.lower() for w in query_lower.split())][:k]

    # Build context from relevant nodes and their edges
    context_parts = []
    for node in relevant_nodes:
        related = [e for e in edges if e["source"] == node or e["target"] == node]
        for r in related[:3]:
            context_parts.append(f"{r['source']} --[{r['relation']}]--> {r['target']}")

    if not context_parts:
        return {"retrieved_docs": []}

    doc = Document(
        page_content="\n".join(context_parts),
        metadata={"source": "knowledge_graph", "project_id": project_id},
    )
    return {"retrieved_docs": [doc]}
