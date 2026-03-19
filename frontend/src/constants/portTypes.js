export const PORT_TYPES = {
  RAW_DOCUMENTS:  { id: 'raw_documents',  label: 'Raw Docs',  color: '#3b82f6' },
  CHUNKS:         { id: 'chunks',         label: 'Chunks',    color: '#10b981' },
  EMBEDDINGS:     { id: 'embeddings',     label: 'Vectors',   color: '#22c55e' },
  QUERY:          { id: 'query',          label: 'Query',     color: '#8b5cf6' },
  QUERY_LIST:     { id: 'query_list',     label: 'Queries',   color: '#7c3aed' },
  RETRIEVED_DOCS: { id: 'retrieved_docs', label: 'Retrieved', color: '#06b6d4' },
  RANKED_DOCS:    { id: 'ranked_docs',    label: 'Ranked',    color: '#f97316' },
  ANSWER:         { id: 'answer',         label: 'Answer',    color: '#a855f7' },
  GRAPH:          { id: 'graph',          label: 'Graph',     color: '#d946ef' },
  MEMORY:         { id: 'memory',         label: 'Memory',    color: '#0ea5e9' },
  GRADE:          { id: 'grade',          label: 'Grade',     color: '#ec4899' },
  ANY:            { id: 'any',            label: 'Any',       color: '#9ca3af' },
};

// Which source port types are allowed to connect to a given target port type
export const PORT_COMPATIBILITY = {
  raw_documents:  new Set(['raw_documents']),
  chunks:         new Set(['raw_documents', 'chunks']),
  embeddings:     new Set(['chunks']),
  retrieved_docs: new Set(['embeddings', 'query', 'memory', 'retrieved_docs']),
  ranked_docs:    new Set(['retrieved_docs']),
  answer:         new Set(['ranked_docs', 'retrieved_docs', 'query', 'answer']),
  query_list:     new Set(['query']),
  query:          new Set(['query', 'query_list', 'grade', 'memory']),
  graph:          new Set(['chunks', 'raw_documents']),
  grade:          new Set(['retrieved_docs', 'answer']),
  memory:         new Set(['answer', 'query']),
  any:            new Set(Object.values(PORT_TYPES).map(p => p.id)),
};

export const NODE_PORT_SPECS = {
  // Sources
  FileSource:            { inputs: [],                                outputs: ['raw_documents'] },
  WebSource:             { inputs: [],                                outputs: ['raw_documents'] },
  S3Source:              { inputs: [],                                outputs: ['raw_documents'] },
  // Extraction
  DocumentExtraction:    { inputs: ['raw_documents'],                 outputs: ['raw_documents'] },
  OCRProcessor:          { inputs: ['raw_documents'],                 outputs: ['raw_documents'] },
  MarkdownConverter:     { inputs: ['raw_documents'],                 outputs: ['raw_documents'] },
  // Enrichment
  Chunker:               { inputs: ['raw_documents'],                 outputs: ['chunks'] },
  MetadataExtractor:     { inputs: ['chunks'],                        outputs: ['chunks'] },
  SemanticSplitter:      { inputs: ['raw_documents'],                 outputs: ['chunks'] },
  // Vector Storage
  VectorStore:           { inputs: ['chunks'],                        outputs: ['embeddings'] },
  ChromaDBStore:         { inputs: ['chunks'],                        outputs: ['embeddings'] },
  // Retrieval
  VectorRetriever:       { inputs: ['embeddings', 'query'],           outputs: ['retrieved_docs'] },
  HybridRetriever:       { inputs: ['embeddings', 'query'],           outputs: ['retrieved_docs'] },
  // Rerankers
  Reranker:              { inputs: ['retrieved_docs', 'query'],       outputs: ['ranked_docs'] },
  CohereRerank:          { inputs: ['retrieved_docs', 'query'],       outputs: ['ranked_docs'] },
  // LLMs
  LLMResponse:           { inputs: ['ranked_docs', 'query'],          outputs: ['answer'] },
  Summarizer:            { inputs: ['retrieved_docs'],                 outputs: ['answer'] },
  StructuredOutput:      { inputs: ['ranked_docs', 'query'],          outputs: ['answer'] },
  // Query Transformation
  HyDE:                  { inputs: ['query'],                         outputs: ['query_list'] },
  MultiQueryExpander:    { inputs: ['query'],                         outputs: ['query_list'] },
  StepBackPrompt:        { inputs: ['query'],                         outputs: ['query'] },
  QueryRewriter:         { inputs: ['query'],                         outputs: ['query'] },
  // Agentic
  DocumentGrader:        { inputs: ['retrieved_docs', 'query'],       outputs: ['grade'] },
  AnswerGrader:          { inputs: ['answer', 'query'],               outputs: ['grade'] },
  HallucinationChecker:  { inputs: ['answer', 'retrieved_docs'],      outputs: ['grade'] },
  QueryRouter:           { inputs: ['query'],                         outputs: ['query', 'query'] },
  // Advanced Retrieval
  ParentDocRetriever:    { inputs: ['embeddings', 'query'],           outputs: ['retrieved_docs'] },
  BM25Retriever:         { inputs: ['query'],                         outputs: ['retrieved_docs'] },
  EnsembleRetriever:     { inputs: ['retrieved_docs', 'retrieved_docs'], outputs: ['retrieved_docs'] },
  ContextualCompressor:  { inputs: ['retrieved_docs', 'query'],       outputs: ['retrieved_docs'] },
  // Graph RAG
  KnowledgeGraphBuilder: { inputs: ['chunks'],                        outputs: ['graph'] },
  GraphRetriever:        { inputs: ['graph', 'query'],                outputs: ['retrieved_docs'] },
  // Memory
  ConversationMemory:    { inputs: ['answer', 'query'],               outputs: ['memory'] },
  ChatHistory:           { inputs: ['memory'],                        outputs: ['query'] },
  // Output
  StreamingResponse:     { inputs: ['ranked_docs', 'query'],          outputs: ['answer'] },
  CitationGenerator:     { inputs: ['answer', 'retrieved_docs'],      outputs: ['answer'] },
};
