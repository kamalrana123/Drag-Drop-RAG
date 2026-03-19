"""Vector store nodes: ChromaDBStore, VectorStore (Qdrant)."""
from langchain_core.documents import Document

from app.config import settings
from app.pipeline.llm_factory import build_embedding


def _get_embeddings(llm_config: dict):
    return build_embedding(
        provider=llm_config.get("embedding_provider", "openai"),
        model=llm_config.get("embedding_model", "text-embedding-3-small"),
        api_keys=llm_config.get("api_keys", {}),
    )


async def handle_chroma_store(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    from langchain_chroma import Chroma

    chunks: list[Document] = inputs.get("chunks", [])
    if not chunks:
        return {"embeddings": {"type": "chroma", "collection": f"{project_id}_default"}}

    collection = config.get("collectionName", f"{project_id}_default")
    embeddings = _get_embeddings(llm_config)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection,
        persist_directory=settings.chroma_persist_dir,
    )
    # Return a descriptor that retrieval nodes can use
    return {"embeddings": {"type": "chroma", "collection": collection}}


async def handle_vector_store(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """VectorStore node → persists to Qdrant."""
    from langchain_qdrant import QdrantVectorStore
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams

    chunks: list[Document] = inputs.get("chunks", [])
    collection = config.get("collectionName", f"{project_id}_default")
    embeddings = _get_embeddings(llm_config)

    if chunks:
        client = QdrantClient(url=settings.qdrant_url)
        # Ensure collection exists
        try:
            client.get_collection(collection)
        except Exception:
            # Determine vector size from embeddings
            sample = embeddings.embed_query("test")
            client.create_collection(
                collection_name=collection,
                vectors_config=VectorParams(size=len(sample), distance=Distance.COSINE),
            )

        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            url=settings.qdrant_url,
            collection_name=collection,
        )

    return {"embeddings": {"type": "qdrant", "collection": collection}}
