"""Main pipeline execution engine."""
import asyncio
from typing import Any, AsyncGenerator, Callable

from app.pipeline.graph import build_input_map, extract_port_type, topological_sort

# ── Node handler registry ─────────────────────────────────────────────────────

from app.pipeline.node_handlers import (
    agentic, enrichment, extraction, graph_rag,
    llm, memory, output, query_transform, rerankers, retrieval, sources, vector_store,
)

NODE_HANDLERS: dict[str, Callable] = {
    # Sources
    "FileSource":            sources.handle_file_source,
    "WebSource":             sources.handle_web_source,
    "S3Source":              sources.handle_s3_source,
    # Extraction
    "DocumentExtraction":    extraction.handle_document_extraction,
    "OCRProcessor":          extraction.handle_ocr_processor,
    "MarkdownConverter":     extraction.handle_markdown_converter,
    # Enrichment
    "Chunker":               enrichment.handle_chunker,
    "SemanticSplitter":      enrichment.handle_semantic_splitter,
    "MetadataExtractor":     enrichment.handle_metadata_extractor,
    # Vector Storage
    "ChromaDBStore":         vector_store.handle_chroma_store,
    "VectorStore":           vector_store.handle_vector_store,
    # Retrieval
    "VectorRetriever":       retrieval.handle_vector_retriever,
    "HybridRetriever":       retrieval.handle_hybrid_retriever,
    "BM25Retriever":         retrieval.handle_bm25_retriever,
    "ParentDocRetriever":    retrieval.handle_parent_doc_retriever,
    "EnsembleRetriever":     retrieval.handle_ensemble_retriever,
    "ContextualCompressor":  retrieval.handle_contextual_compressor,
    # Rerankers
    "Reranker":              rerankers.handle_reranker,
    "CohereRerank":          rerankers.handle_cohere_rerank,
    # LLMs
    "LLMResponse":           llm.handle_llm_response,
    "Summarizer":            llm.handle_summarizer,
    "StructuredOutput":      llm.handle_structured_output,
    "PromptNode":            llm.handle_prompt_node,
    "LLMRouter":             llm.handle_llm_router,
    # Query Transformation
    "HyDE":                  query_transform.handle_hyde,
    "MultiQueryExpander":    query_transform.handle_multi_query_expander,
    "StepBackPrompt":        query_transform.handle_step_back_prompt,
    "QueryRewriter":         query_transform.handle_query_rewriter,
    # Agentic
    "DocumentGrader":        agentic.handle_document_grader,
    "AnswerGrader":          agentic.handle_answer_grader,
    "HallucinationChecker":  agentic.handle_hallucination_checker,
    "QueryRouter":           agentic.handle_query_router,
    # Graph RAG
    "KnowledgeGraphBuilder": graph_rag.handle_knowledge_graph_builder,
    "GraphRetriever":        graph_rag.handle_graph_retriever,
    # Memory
    "ConversationMemory":    memory.handle_conversation_memory,
    "ChatHistory":           memory.handle_chat_history,
    # Output
    "StreamingResponse":     output.handle_streaming_response,
    "CitationGenerator":     output.handle_citation_generator,
}


class PipelineExecutor:
    def __init__(self, project_id: str):
        self.project_id = project_id

    def _collect_inputs(
        self,
        node: dict,
        input_map: dict[str, list[dict]],
        context: dict[str, dict],
    ) -> dict:
        """Merge all upstream outputs into a flat inputs dict for this node."""
        merged: dict[str, Any] = {}
        for edge in input_map.get(node["id"], []):
            src_id = edge["source_node_id"]
            src_outputs = context.get(src_id, {})
            src_handle = edge.get("source_handle", "")
            tgt_handle = edge.get("target_handle", "")

            port_type = extract_port_type(src_handle) if src_handle else "any"

            if port_type == "any" or not src_handle:
                merged.update(src_outputs)
            else:
                # Use the target handle's port type as the dict key
                tgt_port = extract_port_type(tgt_handle) if tgt_handle else port_type
                if tgt_port in src_outputs:
                    merged[tgt_port] = src_outputs[tgt_port]
                elif port_type in src_outputs:
                    merged[port_type] = src_outputs[port_type]
                else:
                    merged.update(src_outputs)
        return merged

    async def _run_node(
        self,
        node: dict,
        inputs: dict,
        llm_config: dict,
        on_status: Callable | None = None,
    ) -> dict:
        node_type: str = node.get("data", {}).get("type", node.get("type", ""))
        config: dict = node.get("data", {}).get("config", {})

        handler = NODE_HANDLERS.get(node_type)
        if handler is None:
            return {}

        if on_status:
            on_status(node["id"], "running")

        try:
            result = await handler(config, inputs, llm_config, self.project_id)
            if on_status:
                on_status(node["id"], "done")
            return result
        except Exception as exc:
            if on_status:
                on_status(node["id"], "error")
            raise exc

    async def execute_ingestion(
        self,
        nodes: list,
        edges: list,
        llm_config: dict,
        on_status: Callable | None = None,
    ) -> dict:
        sorted_nodes = topological_sort(nodes, edges)
        input_map = build_input_map(edges)
        context: dict[str, dict] = {}

        for node in sorted_nodes:
            inputs = self._collect_inputs(node, input_map, context)
            outputs = await self._run_node(node, inputs, llm_config, on_status)
            context[node["id"]] = outputs

        return {"status": "done", "node_count": len(sorted_nodes)}

    async def execute_query(
        self,
        nodes: list,
        edges: list,
        query: str,
        llm_config: dict,
        on_status: Callable | None = None,
    ) -> dict:
        sorted_nodes = topological_sort(nodes, edges)
        input_map = build_input_map(edges)
        context: dict[str, dict] = {}

        # Seed any node that has no upstream inputs with the query
        source_node_ids = {e["source"] for e in edges}
        target_node_ids = {e["target"] for e in edges}
        entry_nodes = [n for n in nodes if n["id"] not in target_node_ids]

        # Inject query into entry nodes' context
        for node in entry_nodes:
            context[node["id"]] = {"query": query}

        for node in sorted_nodes:
            inputs = self._collect_inputs(node, input_map, context)
            if "query" not in inputs:
                inputs["query"] = query
            outputs = await self._run_node(node, inputs, llm_config, on_status)
            context[node["id"]] = outputs

        # Extract final answer and sources from the last node's output
        final_outputs = context.get(sorted_nodes[-1]["id"], {}) if sorted_nodes else {}
        answer = final_outputs.get("answer", "No answer produced.")
        sources = final_outputs.get("retrieved_docs", final_outputs.get("ranked_docs", []))

        return {
            "answer": answer,
            "sources": [
                {"content": d.page_content, "metadata": d.metadata}
                for d in (sources or [])
            ],
        }

    async def stream_query(
        self,
        nodes: list,
        edges: list,
        query: str,
        llm_config: dict,
    ) -> AsyncGenerator:
        """Stream query tokens via SSE. Runs all non-LLM nodes first, then streams the final LLM node."""
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        from app.pipeline.llm_factory import build_chat_llm

        # Run full pipeline to get context
        result = await self.execute_query(nodes, edges, query, llm_config)
        # For SSE: re-stream the answer character by character
        answer = result.get("answer", "")
        sources = result.get("sources", [])

        # Stream tokens
        for token in answer.split():
            yield {"type": "token", "content": token + " "}
            await asyncio.sleep(0)  # yield control

        # Send final sources
        yield {"type": "sources", "content": sources}
        yield {"type": "done", "content": ""}
