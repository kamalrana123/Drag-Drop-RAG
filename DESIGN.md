# Advanced RAG System Design

## Goal
Build a high-performance Retrieval-Augmented Generation (RAG) system with advanced retrieval techniques: Hybrid Search, Query Transformation, and Reranking.

## Core Features
1. **Hybrid Search**: Combine semantic (dense) search with keyword (sparse) search using Qdrant.
2. **Advanced Reranking**: Utilize FlashRank (lightweight, CPU-efficient) to re-score and refine retrieved documents.
3. **Query Expansion/Transformation**: Use LLMs to rewrite user queries for better context matching (Multi-Query or HyDE).
4. **Intelligent Chunking**: Recursive character splitting with overlap to maintain context.
5. **API First**: FastAPI-based backend for easy integration.
6. **Modern Frontend**: React/TypeScript dashboard for document management and chat.

## Tech Stack
- **Framework**: LlamaIndex (Core RAG logic), LangChain (Integration utilities).
- **Vector DB**: Qdrant (Managed or Local Docker).
- **Reranker**: FlashRank (Fast, local reranking).
- **LLM/Embeddings**: OpenAI (GPT-4o, Text-Embedding-3-Large) or Google Gemini.
- **Backend**: FastAPI (Python).
- **Frontend**: React (Vite) + Tailwind CSS.

## Architecture
### 1. Ingestion Pipeline
- Load documents (PDF, MD, Text).
- Split into chunks (RecursiveCharacterTextSplitter).
- Generate embeddings (Dense) and sparse vectors (for Hybrid Search).
- Store in Qdrant with metadata.

### 2. Retrieval & Generation Pipeline
- **Step 1: Query Transformation**: Rewrite the user query into multiple versions.
- **Step 2: Hybrid Retrieval**: Perform both dense and sparse searches in Qdrant; merge results.
- **Step 3: Reranking**: Use FlashRank to re-order the top-K results based on relevance to the original query.
- **Step 4: Synthesis**: Pass the reranked context to the LLM (GPT/Gemini) for the final answer.

## Implementation Plan
1. **Setup**: Initialize `advanced_rag/` with a virtual environment and core dependencies.
2. **Ingestion Service**: Implement document processing and Qdrant indexing.
3. **Retrieval Service**: Implement hybrid search, query transformation, and FlashRank reranking.
4. **API Layer**: Create FastAPI endpoints for `/upload` and `/query`.
5. **Frontend**: Build a simple chat UI to interact with the backend.
6. **Evaluation (Optional)**: Add basic metrics for retrieval quality.
