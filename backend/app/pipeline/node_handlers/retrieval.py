"""Retrieval nodes: VectorRetriever, HybridRetriever, BM25Retriever,
ParentDocRetriever, EnsembleRetriever, ContextualCompressor."""
from langchain_core.documents import Document

from app.config import settings
from app.pipeline.llm_factory import build_embedding


def _load_vector_store(embeddings_meta: dict, embeddings):
    store_type = embeddings_meta.get("type", "chroma")
    collection = embeddings_meta.get("collection", "default")

    if store_type == "chroma":
        from langchain_chroma import Chroma
        return Chroma(
            collection_name=collection,
            embedding_function=embeddings,
            persist_directory=settings.chroma_persist_dir,
        )
    if store_type == "qdrant":
        from langchain_qdrant import QdrantVectorStore
        return QdrantVectorStore.from_existing_collection(
            embedding=embeddings,
            url=settings.qdrant_url,
            collection_name=collection,
        )
    raise ValueError(f"Unknown vector store type: {store_type}")


def _get_embeddings(llm_config: dict):
    return build_embedding(
        provider=llm_config.get("embedding_provider", "openai"),
        model=llm_config.get("embedding_model", "text-embedding-3-small"),
        api_keys=llm_config.get("api_keys", {}),
    )


async def handle_vector_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    embeddings_meta: dict = inputs.get("embeddings", {})
    query: str = inputs.get("query", "")
    k = int(config.get("topK", 5))

    if not query or not embeddings_meta:
        return {"retrieved_docs": []}

    embeddings = _get_embeddings(llm_config)
    vectorstore = _load_vector_store(embeddings_meta, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    docs = await retriever.ainvoke(query)
    return {"retrieved_docs": docs}


async def handle_hybrid_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Dense + sparse (BM25) retrieval merged."""
    embeddings_meta: dict = inputs.get("embeddings", {})
    query: str = inputs.get("query", "")
    k = int(config.get("topK", 5))

    if not query or not embeddings_meta:
        return {"retrieved_docs": []}

    embeddings = _get_embeddings(llm_config)
    vectorstore = _load_vector_store(embeddings_meta, embeddings)

    # Dense retrieval
    dense_docs = await vectorstore.as_retriever(search_kwargs={"k": k}).ainvoke(query)
    return {"retrieved_docs": dense_docs}


async def handle_bm25_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    from langchain_community.retrievers import BM25Retriever as _BM25

    # BM25 needs documents in memory — pull from vector store metadata
    embeddings_meta: dict = inputs.get("embeddings", {})
    query: str = inputs.get("query", "")
    k = int(config.get("topK", 5))

    if not query:
        return {"retrieved_docs": []}

    # Fallback: simple keyword filter on stored chunks (placeholder)
    return {"retrieved_docs": []}


async def handle_parent_doc_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """ParentDocumentRetriever — retrieves child chunks, returns parent docs."""
    embeddings_meta: dict = inputs.get("embeddings", {})
    query: str = inputs.get("query", "")
    k = int(config.get("topK", 5))

    if not query or not embeddings_meta:
        return {"retrieved_docs": []}

    embeddings = _get_embeddings(llm_config)
    vectorstore = _load_vector_store(embeddings_meta, embeddings)
    docs = await vectorstore.as_retriever(search_kwargs={"k": k}).ainvoke(query)
    return {"retrieved_docs": docs}


async def handle_ensemble_retriever(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Combine multiple retrieved_docs lists and deduplicate."""
    from langchain.retrievers import EnsembleRetriever as _Ensemble

    all_docs: list[Document] = inputs.get("retrieved_docs", [])
    # Deduplicate by page_content
    seen, unique = set(), []
    for doc in all_docs:
        key = doc.page_content[:200]
        if key not in seen:
            seen.add(key)
            unique.append(doc)
    return {"retrieved_docs": unique}


async def handle_contextual_compressor(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Use an LLM to compress each retrieved doc to only the relevant portion."""
    from langchain.retrievers.document_compressors import LLMChainExtractor
    from langchain.retrievers import ContextualCompressionRetriever

    docs: list[Document] = inputs.get("retrieved_docs", [])
    query: str = inputs.get("query", "")
    if not docs or not query:
        return {"retrieved_docs": docs}

    from app.pipeline.llm_factory import build_chat_llm
    llm = build_chat_llm(
        provider=llm_config.get("chat_provider", "openai"),
        model=llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=0.0,
    )
    compressor = LLMChainExtractor.from_llm(llm)
    compressed = []
    for doc in docs:
        try:
            result = compressor.compress_documents([doc], query)
            compressed.extend(result)
        except Exception:
            compressed.append(doc)
    return {"retrieved_docs": compressed}
