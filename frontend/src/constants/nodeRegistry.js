import {
  FileText, Globe, Cloud, Scan, Layout, Hash, Scissors, Tags, BrainCircuit,
  Database, Zap, ListFilter, Filter, Sparkles, MessageSquare, Terminal,
  Lightbulb, GitBranch, ArrowUpLeft, PenLine, ClipboardCheck, CheckCircle2,
  AlertTriangle, GitFork, FolderSearch, AlignLeft, Layers, Minimize2,
  Share2, Network, Brain, History, Radio, BookMarked, DatabaseZap,
  Bot, Waypoints
} from 'lucide-react';

export const NODE_REGISTRY = [
  // ── Data Ingestion ─────────────────────────────────────────────────────
  { type: 'FileSource',            label: 'File Upload',           icon: FileText,       color: 'blue',    category: 'Data Ingestion',       categoryOrder: 0, description: 'Local PDF/TXT/DOCX/MD',        tags: ['source','file','pdf','document','upload'] },
  { type: 'WebSource',             label: 'Web Crawler',           icon: Globe,          color: 'blue',    category: 'Data Ingestion',       categoryOrder: 0, description: 'Crawl and scrape URLs',        tags: ['source','web','url','crawl','scrape'] },
  { type: 'S3Source',              label: 'S3 Storage',            icon: Cloud,          color: 'blue',    category: 'Data Ingestion',       categoryOrder: 0, description: 'AWS S3 bucket files',          tags: ['source','s3','aws','cloud','storage'] },

  // ── Document Extraction ────────────────────────────────────────────────
  { type: 'DocumentExtraction',    label: 'Unified Extractor',     icon: Scan,           color: 'amber',   category: 'Document Extraction',  categoryOrder: 1, description: 'Strategy-based text extract',  tags: ['extract','ocr','layout','parse'] },
  { type: 'OCRProcessor',          label: 'OCR Processor',         icon: Layout,         color: 'amber',   category: 'Document Extraction',  categoryOrder: 1, description: 'Tesseract / EasyOCR / Paddle', tags: ['ocr','image','scan','tesseract'] },
  { type: 'MarkdownConverter',     label: 'MD Converter',          icon: Hash,           color: 'amber',   category: 'Document Extraction',  categoryOrder: 1, description: 'Convert docs to Markdown',     tags: ['markdown','convert','format'] },

  // ── Text Enrichment ────────────────────────────────────────────────────
  { type: 'Chunker',               label: 'Text Chunker',          icon: Scissors,       color: 'emerald', category: 'Text Enrichment',      categoryOrder: 2, description: 'Recursive / sentence / token',  tags: ['chunk','split','text','recursive'] },
  { type: 'MetadataExtractor',     label: 'Metadata Extractor',    icon: Tags,           color: 'emerald', category: 'Text Enrichment',      categoryOrder: 2, description: 'Title, author, entities…',     tags: ['metadata','title','author','entity','keyword'] },
  { type: 'SemanticSplitter',      label: 'Semantic Splitter',     icon: BrainCircuit,   color: 'emerald', category: 'Text Enrichment',      categoryOrder: 2, description: 'Embedding-based splitting',    tags: ['semantic','embed','split','sentence'] },

  // ── Vector Storage ─────────────────────────────────────────────────────
  { type: 'VectorStore',           label: 'Qdrant DB',             icon: Database,       color: 'green',   category: 'Vector Storage',       categoryOrder: 3, description: 'Qdrant vector database',       tags: ['vector','qdrant','store','embed','db'] },
  { type: 'ChromaDBStore',         label: 'ChromaDB',              icon: DatabaseZap,    color: 'green',   category: 'Vector Storage',       categoryOrder: 3, description: 'Local ChromaDB store',         tags: ['vector','chroma','store','embed','local'] },

  // ── Retrieval & Search ─────────────────────────────────────────────────
  { type: 'VectorRetriever',       label: 'Vector Search',         icon: Zap,            color: 'cyan',    category: 'Retrieval & Search',   categoryOrder: 4, description: 'Dense semantic retrieval',     tags: ['retrieve','vector','semantic','search','dense'] },
  { type: 'HybridRetriever',       label: 'Hybrid Search',         icon: ListFilter,     color: 'cyan',    category: 'Retrieval & Search',   categoryOrder: 4, description: 'Dense + sparse BM25 blend',    tags: ['retrieve','hybrid','bm25','dense','sparse'] },

  // ── Rerankers ──────────────────────────────────────────────────────────
  { type: 'Reranker',              label: 'FlashRank',             icon: Filter,         color: 'orange',  category: 'Rerankers',            categoryOrder: 5, description: 'Fast cross-encoder rerank',    tags: ['rerank','flashrank','cross-encoder','order'] },
  { type: 'CohereRerank',          label: 'Cohere Rerank',         icon: Sparkles,       color: 'orange',  category: 'Rerankers',            categoryOrder: 5, description: 'Cohere API reranking',         tags: ['rerank','cohere','api','order'] },

  // ── LLMs & Generation ─────────────────────────────────────────────────
  { type: 'LLMResponse',           label: 'Chat Response',         icon: MessageSquare,  color: 'purple',  category: 'LLMs & Generation',    categoryOrder: 6, description: 'GPT-4o / Gemini generation',  tags: ['llm','gpt','gemini','generate','chat','answer'] },
  { type: 'Summarizer',            label: 'Summarizer',            icon: Zap,            color: 'purple',  category: 'LLMs & Generation',    categoryOrder: 6, description: 'Condense documents to summary', tags: ['llm','summarize','condense','summary'] },
  { type: 'StructuredOutput',      label: 'Structured Output',     icon: Terminal,       color: 'purple',  category: 'LLMs & Generation',    categoryOrder: 6, description: 'Extract JSON / YAML schema',   tags: ['llm','json','schema','structured','output'] },
  { type: 'PromptNode',            label: 'Prompt Step',           icon: Bot,            color: 'purple',  category: 'LLMs & Generation',    categoryOrder: 6, description: 'Custom LLM prompt for decisions', tags: ['llm','prompt','decision','routing','custom','instruction','step','bot'] },

  // ── Query Transformation ───────────────────────────────────────────────
  { type: 'HyDE',                  label: 'HyDE',                  icon: Lightbulb,      color: 'violet',  category: 'Query Transformation', categoryOrder: 7, description: 'Hypothetical Document Embeddings', tags: ['query','hyde','hypothetical','transform','expand'] },
  { type: 'MultiQueryExpander',    label: 'Multi-Query Expand',    icon: GitBranch,      color: 'violet',  category: 'Query Transformation', categoryOrder: 7, description: 'Generate N query variants',    tags: ['query','multi','expand','variants','transform'] },
  { type: 'StepBackPrompt',        label: 'Step-Back Prompt',      icon: ArrowUpLeft,    color: 'violet',  category: 'Query Transformation', categoryOrder: 7, description: 'Abstract to broader question', tags: ['query','stepback','abstract','transform'] },
  { type: 'QueryRewriter',         label: 'Query Rewriter',        icon: PenLine,        color: 'violet',  category: 'Query Transformation', categoryOrder: 7, description: 'Rewrite for better recall',    tags: ['query','rewrite','transform','improve'] },

  // ── Agentic / Self-RAG ────────────────────────────────────────────────
  { type: 'DocumentGrader',        label: 'Document Grader',       icon: ClipboardCheck, color: 'rose',    category: 'Agentic / Self-RAG',   categoryOrder: 8, description: 'Grade document relevance',     tags: ['grade','relevance','agentic','self-rag','filter'] },
  { type: 'AnswerGrader',          label: 'Answer Grader',         icon: CheckCircle2,   color: 'rose',    category: 'Agentic / Self-RAG',   categoryOrder: 8, description: 'Grade answer quality',         tags: ['grade','answer','quality','agentic','self-rag'] },
  { type: 'HallucinationChecker',  label: 'Hallucination Check',   icon: AlertTriangle,  color: 'rose',    category: 'Agentic / Self-RAG',   categoryOrder: 8, description: 'Detect LLM hallucinations',    tags: ['hallucination','detect','grade','agentic','self-rag'] },
  { type: 'QueryRouter',           label: 'Query Router',          icon: GitFork,        color: 'rose',    category: 'Agentic / Self-RAG',   categoryOrder: 8, description: 'Route query to best path',     tags: ['router','route','agentic','branch','conditional'] },
  { type: 'LLMRouter',             label: 'LLM Router',            icon: Waypoints,      color: 'rose',    category: 'Agentic / Self-RAG',   categoryOrder: 8, description: 'LLM-powered multi-path router',  tags: ['router','route','llm','agentic','branch','collection','decision'] },

  // ── Advanced Retrieval ────────────────────────────────────────────────
  { type: 'ParentDocRetriever',    label: 'Parent Doc Retriever',  icon: FolderSearch,   color: 'teal',    category: 'Advanced Retrieval',   categoryOrder: 9, description: 'Retrieve parent + child docs', tags: ['retrieve','parent','child','advanced','hierarchical'] },
  { type: 'BM25Retriever',         label: 'BM25 Retriever',        icon: AlignLeft,      color: 'teal',    category: 'Advanced Retrieval',   categoryOrder: 9, description: 'Sparse keyword BM25 search',   tags: ['retrieve','bm25','sparse','keyword','tfidf'] },
  { type: 'EnsembleRetriever',     label: 'Ensemble Retriever',    icon: Layers,         color: 'teal',    category: 'Advanced Retrieval',   categoryOrder: 9, description: 'Combine multiple retrievers',  tags: ['retrieve','ensemble','combine','fusion','rrf'] },
  { type: 'ContextualCompressor',  label: 'Contextual Compressor', icon: Minimize2,      color: 'teal',    category: 'Advanced Retrieval',   categoryOrder: 9, description: 'Extract relevant passages',    tags: ['compress','context','relevant','passages','advanced'] },

  // ── Graph RAG ─────────────────────────────────────────────────────────
  { type: 'KnowledgeGraphBuilder', label: 'Knowledge Graph',       icon: Share2,         color: 'fuchsia', category: 'Graph RAG',            categoryOrder: 10, description: 'Build entity-relation graph', tags: ['graph','knowledge','entity','relation','graphrag'] },
  { type: 'GraphRetriever',        label: 'Graph Retriever',       icon: Network,        color: 'fuchsia', category: 'Graph RAG',            categoryOrder: 10, description: 'Graph-based traversal retrieval', tags: ['graph','retrieve','traversal','graphrag','neo4j'] },

  // ── Memory ────────────────────────────────────────────────────────────
  { type: 'ConversationMemory',    label: 'Conversation Memory',   icon: Brain,          color: 'sky',     category: 'Memory',               categoryOrder: 11, description: 'Store conversation turns',    tags: ['memory','conversation','history','buffer','chat'] },
  { type: 'ChatHistory',           label: 'Chat History',          icon: History,        color: 'sky',     category: 'Memory',               categoryOrder: 11, description: 'Inject prior chat context',   tags: ['memory','history','chat','context','turns'] },

  // ── Output ────────────────────────────────────────────────────────────
  { type: 'StreamingResponse',     label: 'Streaming Response',    icon: Radio,          color: 'indigo',  category: 'Output',               categoryOrder: 12, description: 'Stream tokens to UI',         tags: ['output','stream','tokens','realtime','sse'] },
  { type: 'CitationGenerator',     label: 'Citation Generator',    icon: BookMarked,     color: 'indigo',  category: 'Output',               categoryOrder: 12, description: 'Inline citation generation',  tags: ['output','citation','source','reference','apa'] },
];

export const NODE_REGISTRY_MAP = Object.fromEntries(NODE_REGISTRY.map(n => [n.type, n]));
