"""Enrichment nodes: Chunker, MetadataExtractor, SemanticSplitter."""
from langchain_core.documents import Document


async def handle_chunker(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    raw_docs: list[Document] = inputs.get("raw_documents", [])
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=int(config.get("chunkSize", 500)),
        chunk_overlap=int(config.get("chunkOverlap", 50)),
        separators=config.get("separators", ["\n\n", "\n", " ", ""]),
    )
    chunks = splitter.split_documents(raw_docs)
    return {"chunks": chunks}


async def handle_semantic_splitter(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    from langchain_experimental.text_splitter import SemanticChunker
    from app.pipeline.llm_factory import build_embedding

    raw_docs: list[Document] = inputs.get("raw_documents", [])
    embeddings = build_embedding(
        provider=llm_config.get("embedding_provider", "openai"),
        model=llm_config.get("embedding_model", "text-embedding-3-small"),
        api_keys=llm_config.get("api_keys", {}),
    )
    splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type=config.get("breakpointType", "percentile"),
    )
    chunks = splitter.split_documents(raw_docs)
    return {"chunks": chunks}


async def handle_metadata_extractor(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Add or enrich metadata fields on each chunk."""
    chunks: list[Document] = inputs.get("chunks", [])
    extra: dict = config.get("extraMetadata", {})

    enriched = [
        Document(
            page_content=chunk.page_content,
            metadata={**chunk.metadata, **extra, "project_id": project_id},
        )
        for chunk in chunks
    ]
    return {"chunks": enriched}
