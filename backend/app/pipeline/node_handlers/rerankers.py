"""Reranker nodes: Reranker (FlashRank), CohereRerank."""
from langchain_core.documents import Document


async def handle_reranker(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """FlashRank cross-encoder reranker."""
    from flashrank import Ranker, RerankRequest

    docs: list[Document] = inputs.get("retrieved_docs", [])
    query: str = inputs.get("query", "")
    top_n = int(config.get("topN", 3))

    if not docs or not query:
        return {"ranked_docs": docs}

    model = config.get("model", "ms-marco-MiniLM-L-12-v2")
    ranker = Ranker(model_name=model)
    passages = [{"id": i, "text": doc.page_content} for i, doc in enumerate(docs)]
    request = RerankRequest(query=query, passages=passages)
    results = ranker.rerank(request)

    ranked = sorted(results, key=lambda r: r["score"], reverse=True)[:top_n]
    ranked_docs = [docs[r["id"]] for r in ranked]
    return {"ranked_docs": ranked_docs}


async def handle_cohere_rerank(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Cohere reranking API."""
    import cohere

    docs: list[Document] = inputs.get("retrieved_docs", [])
    query: str = inputs.get("query", "")
    top_n = int(config.get("topN", 3))

    if not docs or not query:
        return {"ranked_docs": docs}

    api_key = llm_config.get("api_keys", {}).get("COHERE_API_KEY", "")
    co = cohere.Client(api_key)
    texts = [doc.page_content for doc in docs]
    model = config.get("model", "rerank-english-v3.0")

    response = co.rerank(query=query, documents=texts, model=model, top_n=top_n)
    ranked_docs = [docs[r.index] for r in response.results]
    return {"ranked_docs": ranked_docs}
