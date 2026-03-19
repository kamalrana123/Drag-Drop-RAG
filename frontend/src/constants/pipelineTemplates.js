// 5 preset pipeline templates as serialized pipeline objects

export const PIPELINE_TEMPLATES = [
  {
    id: 'basic-rag',
    name: 'Basic RAG',
    description: 'Classic RAG pipeline: ingest → chunk → embed → retrieve → rerank → generate',
    nodeCount: 6,
    pipeline: {
      version: '1.0',
      nodes: [
        { id: 't1-1', type: 'FileSource',      position: { x: 50,   y: 200 }, data: { label: 'File Upload',        type: 'FileSource',      config: {} } },
        { id: 't1-2', type: 'Chunker',         position: { x: 300,  y: 200 }, data: { label: 'Text Chunker',       type: 'Chunker',         config: { chunkSize: 512, chunkOverlap: 50 } } },
        { id: 't1-3', type: 'VectorStore',     position: { x: 550,  y: 200 }, data: { label: 'Qdrant DB',          type: 'VectorStore',     config: { collection: 'basic-rag' } } },
        { id: 't1-4', type: 'VectorRetriever', position: { x: 800,  y: 200 }, data: { label: 'Vector Search',      type: 'VectorRetriever', config: { topK: 5 } } },
        { id: 't1-5', type: 'Reranker',        position: { x: 1050, y: 200 }, data: { label: 'FlashRank',          type: 'Reranker',        config: { topN: 3 } } },
        { id: 't1-6', type: 'LLMResponse',     position: { x: 1300, y: 200 }, data: { label: 'LLM Response',       type: 'LLMResponse',     config: { model: 'gpt-4o', temperature: 0.7 } } },
      ],
      edges: [
        { id: 'te1-1', source: 't1-1', target: 't1-2', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te1-2', source: 't1-2', target: 't1-3', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te1-3', source: 't1-3', target: 't1-4', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te1-4', source: 't1-4', target: 't1-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te1-5', source: 't1-5', target: 't1-6', sourceHandle: null, targetHandle: null, data: {} },
      ],
    },
  },

  {
    id: 'hyde-hybrid',
    name: 'HyDE + Hybrid Search',
    description: 'Query transformation via HyDE, hybrid BM25+vector retrieval with contextual compression',
    nodeCount: 7,
    pipeline: {
      version: '1.0',
      nodes: [
        { id: 't2-1', type: 'WebSource',            position: { x: 50,   y: 200 }, data: { label: 'Web Crawler',         type: 'WebSource',           config: {} } },
        { id: 't2-2', type: 'Chunker',              position: { x: 300,  y: 200 }, data: { label: 'Text Chunker',        type: 'Chunker',             config: { chunkSize: 400, chunkOverlap: 80 } } },
        { id: 't2-3', type: 'VectorStore',          position: { x: 550,  y: 200 }, data: { label: 'Qdrant DB',           type: 'VectorStore',         config: { collection: 'hyde-hybrid' } } },
        { id: 't2-4', type: 'HyDE',                 position: { x: 550,  y: 380 }, data: { label: 'HyDE Transform',      type: 'HyDE',                config: { numDocs: 3, model: 'gpt-4o' } } },
        { id: 't2-5', type: 'HybridRetriever',      position: { x: 800,  y: 200 }, data: { label: 'Hybrid Search',       type: 'HybridRetriever',     config: { topK: 8, alpha: 0.5 } } },
        { id: 't2-6', type: 'ContextualCompressor', position: { x: 1050, y: 200 }, data: { label: 'Compressor',          type: 'ContextualCompressor',config: { model: 'gpt-4o-mini', maxTokens: 300 } } },
        { id: 't2-7', type: 'LLMResponse',          position: { x: 1300, y: 200 }, data: { label: 'LLM Response',        type: 'LLMResponse',         config: { model: 'gpt-4o', temperature: 0.3 } } },
      ],
      edges: [
        { id: 'te2-1', source: 't2-1', target: 't2-2', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te2-2', source: 't2-2', target: 't2-3', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te2-3', source: 't2-3', target: 't2-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te2-4', source: 't2-4', target: 't2-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te2-5', source: 't2-5', target: 't2-6', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te2-6', source: 't2-6', target: 't2-7', sourceHandle: null, targetHandle: null, data: {} },
      ],
    },
  },

  {
    id: 'multi-query-fusion',
    name: 'Multi-Query Fusion',
    description: 'Expand single query to N variants, ensemble retrieval, citation-backed answers',
    nodeCount: 7,
    pipeline: {
      version: '1.0',
      nodes: [
        { id: 't3-1', type: 'FileSource',         position: { x: 50,   y: 200 }, data: { label: 'File Upload',       type: 'FileSource',         config: {} } },
        { id: 't3-2', type: 'SemanticSplitter',   position: { x: 300,  y: 200 }, data: { label: 'Semantic Splitter', type: 'SemanticSplitter',   config: { embedModel: 'text-embedding-3-small' } } },
        { id: 't3-3', type: 'VectorStore',        position: { x: 550,  y: 200 }, data: { label: 'Qdrant DB',         type: 'VectorStore',        config: { collection: 'multi-query' } } },
        { id: 't3-4', type: 'MultiQueryExpander', position: { x: 300,  y: 380 }, data: { label: 'Multi-Query Expand',type: 'MultiQueryExpander', config: { numQueries: 4, model: 'gpt-4o' } } },
        { id: 't3-5', type: 'EnsembleRetriever',  position: { x: 800,  y: 200 }, data: { label: 'Ensemble Retriever',type: 'EnsembleRetriever',  config: { method: 'rrf', weights: [0.5, 0.5] } } },
        { id: 't3-6', type: 'CohereRerank',       position: { x: 1050, y: 200 }, data: { label: 'Cohere Rerank',     type: 'CohereRerank',       config: { topN: 5 } } },
        { id: 't3-7', type: 'CitationGenerator',  position: { x: 1300, y: 200 }, data: { label: 'Citations',         type: 'CitationGenerator',  config: { style: 'inline', maxCitations: 5 } } },
      ],
      edges: [
        { id: 'te3-1', source: 't3-1', target: 't3-2', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te3-2', source: 't3-2', target: 't3-3', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te3-3', source: 't3-3', target: 't3-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te3-4', source: 't3-4', target: 't3-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te3-5', source: 't3-5', target: 't3-6', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te3-6', source: 't3-6', target: 't3-7', sourceHandle: null, targetHandle: null, data: {} },
      ],
    },
  },

  {
    id: 'agentic-self-rag',
    name: 'Agentic Self-RAG',
    description: 'Self-corrective RAG with document grading, query routing, and hallucination detection',
    nodeCount: 9,
    pipeline: {
      version: '1.0',
      nodes: [
        { id: 't4-1', type: 'FileSource',           position: { x: 50,   y: 250 }, data: { label: 'File Upload',       type: 'FileSource',          config: {} } },
        { id: 't4-2', type: 'Chunker',              position: { x: 300,  y: 250 }, data: { label: 'Text Chunker',      type: 'Chunker',             config: { chunkSize: 512 } } },
        { id: 't4-3', type: 'VectorStore',          position: { x: 550,  y: 250 }, data: { label: 'Qdrant DB',         type: 'VectorStore',         config: { collection: 'self-rag' } } },
        { id: 't4-4', type: 'QueryRouter',          position: { x: 550,  y: 430 }, data: { label: 'Query Router',      type: 'QueryRouter',         config: { strategy: 'llm', routes: ['Vector Search', 'BM25'] } } },
        { id: 't4-5', type: 'VectorRetriever',      position: { x: 800,  y: 150 }, data: { label: 'Vector Search',     type: 'VectorRetriever',     config: { topK: 8 } } },
        { id: 't4-6', type: 'BM25Retriever',        position: { x: 800,  y: 350 }, data: { label: 'BM25 Retriever',    type: 'BM25Retriever',       config: { topK: 8 } } },
        { id: 't4-7', type: 'DocumentGrader',       position: { x: 1050, y: 250 }, data: { label: 'Document Grader',   type: 'DocumentGrader',      config: { model: 'gpt-4o', threshold: 'balanced' } } },
        { id: 't4-8', type: 'LLMResponse',          position: { x: 1300, y: 250 }, data: { label: 'LLM Response',      type: 'LLMResponse',         config: { model: 'gpt-4o', temperature: 0.3 } } },
        { id: 't4-9', type: 'HallucinationChecker', position: { x: 1550, y: 250 }, data: { label: 'Hallucination Check',type: 'HallucinationChecker',config: { model: 'gpt-4o', mode: 'binary' } } },
      ],
      edges: [
        { id: 'te4-1', source: 't4-1', target: 't4-2', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-2', source: 't4-2', target: 't4-3', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-3', source: 't4-3', target: 't4-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-4', source: 't4-4', target: 't4-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-5', source: 't4-4', target: 't4-6', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-6', source: 't4-5', target: 't4-7', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-7', source: 't4-6', target: 't4-7', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-8', source: 't4-7', target: 't4-8', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te4-9', source: 't4-8', target: 't4-9', sourceHandle: null, targetHandle: null, data: {} },
      ],
    },
  },

  {
    id: 'graph-rag',
    name: 'Graph RAG',
    description: 'Build a knowledge graph from documents and retrieve via graph traversal',
    nodeCount: 6,
    pipeline: {
      version: '1.0',
      nodes: [
        { id: 't5-1', type: 'FileSource',            position: { x: 50,   y: 200 }, data: { label: 'File Upload',       type: 'FileSource',           config: {} } },
        { id: 't5-2', type: 'DocumentExtraction',    position: { x: 300,  y: 200 }, data: { label: 'Unified Extractor', type: 'DocumentExtraction',   config: { strategy: 'layout' } } },
        { id: 't5-3', type: 'Chunker',               position: { x: 550,  y: 200 }, data: { label: 'Text Chunker',      type: 'Chunker',              config: { chunkSize: 1000, chunkOverlap: 100 } } },
        { id: 't5-4', type: 'KnowledgeGraphBuilder', position: { x: 800,  y: 200 }, data: { label: 'Knowledge Graph',   type: 'KnowledgeGraphBuilder',config: { model: 'gpt-4o', maxEntities: 30, entityTypes: ['Person','Organization','Location','Concept'] } } },
        { id: 't5-5', type: 'GraphRetriever',        position: { x: 1050, y: 200 }, data: { label: 'Graph Retriever',   type: 'GraphRetriever',       config: { depth: 2, topK: 8 } } },
        { id: 't5-6', type: 'LLMResponse',           position: { x: 1300, y: 200 }, data: { label: 'LLM Response',      type: 'LLMResponse',          config: { model: 'gpt-4o', temperature: 0.3 } } },
      ],
      edges: [
        { id: 'te5-1', source: 't5-1', target: 't5-2', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te5-2', source: 't5-2', target: 't5-3', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te5-3', source: 't5-3', target: 't5-4', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te5-4', source: 't5-4', target: 't5-5', sourceHandle: null, targetHandle: null, data: {} },
        { id: 'te5-5', source: 't5-5', target: 't5-6', sourceHandle: null, targetHandle: null, data: {} },
      ],
    },
  },
];
