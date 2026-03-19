import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  FileText, Database, Filter, MessageSquare, DatabaseZap,
  Scan, Scissors, Tags, Globe, Cloud, Layout, Zap, ListFilter,
  BrainCircuit, Sparkles, Hash, Terminal,
  Lightbulb, GitBranch, ArrowUpLeft, PenLine, ClipboardCheck, CheckCircle2,
  AlertTriangle, GitFork, FolderSearch, AlignLeft, Layers, Minimize2,
  Share2, Network, Brain, History, Radio, BookMarked,
  RotateCcw, RotateCw, MessageCircle, Trash2
} from 'lucide-react';
import { useStore } from '../store';
import BaseNode from './BaseNode';
import axios from 'axios';
import { ConfirmModal, ResultModal } from './modals';
import { useModal } from '../hooks/useModal';
import Toast from './ui/Toast';
import Spinner from './ui/Spinner';
import { NODE_REGISTRY_MAP } from '../constants/nodeRegistry';

// ── Custom Node Components (original 18) ─────────────────────────────────────
const FileSourceNode        = (p) => <BaseNode {...p} icon={FileText}       color="blue"    description="Local PDF/TXT/DOCX" />;
const WebSourceNode         = (p) => <BaseNode {...p} icon={Globe}          color="blue"    description="Crawl URL content" />;
const S3SourceNode          = (p) => <BaseNode {...p} icon={Cloud}          color="blue"    description="AWS S3 bucket" />;
const DocumentExtractionNode= (p) => <BaseNode {...p} icon={Scan}           color="amber"   description="Unified Extraction" />;
const OCRProcessorNode      = (p) => <BaseNode {...p} icon={Layout}         color="amber"   description="OCR for images" />;
const MarkdownConverterNode = (p) => <BaseNode {...p} icon={Hash}           color="amber"   description="Convert to Markdown" />;
const ChunkerNode           = (p) => <BaseNode {...p} icon={Scissors}       color="emerald" description="Split text into chunks" />;
const MetadataExtractorNode = (p) => <BaseNode {...p} icon={Tags}           color="emerald" description="Summary, Entities, etc." />;
const SemanticSplitterNode  = (p) => <BaseNode {...p} icon={BrainCircuit}   color="emerald" description="Embedding-based split" />;
const VectorStoreNode       = (p) => <BaseNode {...p} icon={Database}       color="green"   description="Qdrant Vector DB" />;
const ChromaDBStoreNode     = (p) => <BaseNode {...p} icon={DatabaseZap}    color="green"   description="Local ChromaDB" />;
const VectorRetrieverNode   = (p) => <BaseNode {...p} icon={Zap}            color="cyan"    description="Dense semantic search" />;
const HybridRetrieverNode   = (p) => <BaseNode {...p} icon={ListFilter}     color="cyan"    description="Dense + Sparse Search" />;
const RerankerNode          = (p) => <BaseNode {...p} icon={Filter}         color="orange"  description="FlashRank Reranking" />;
const CohereRerankNode      = (p) => <BaseNode {...p} icon={Sparkles}       color="orange"  description="Cohere API Rerank" />;
const LLMResponseNode       = (p) => <BaseNode {...p} icon={MessageSquare}  color="purple"  description="Generate final answer" />;
const SummarizerNode        = (p) => <BaseNode {...p} icon={Zap}            color="purple"  description="Condense documents" />;
const StructuredOutputNode  = (p) => <BaseNode {...p} icon={Terminal}       color="purple"  description="Extract JSON/Schema" />;

// ── New Advanced RAG Node Components (15) ────────────────────────────────────
const HyDENode               = (p) => <BaseNode {...p} icon={Lightbulb}      color="violet"  description="Hypothetical Doc Embeddings" />;
const MultiQueryExpanderNode = (p) => <BaseNode {...p} icon={GitBranch}      color="violet"  description="Generate N query variants" />;
const StepBackPromptNode     = (p) => <BaseNode {...p} icon={ArrowUpLeft}    color="violet"  description="Abstract to broader question" />;
const QueryRewriterNode      = (p) => <BaseNode {...p} icon={PenLine}        color="violet"  description="Rewrite for better recall" />;
const DocumentGraderNode     = (p) => <BaseNode {...p} icon={ClipboardCheck} color="rose"    description="Grade doc relevance" />;
const AnswerGraderNode       = (p) => <BaseNode {...p} icon={CheckCircle2}   color="rose"    description="Grade answer quality" />;
const HallucinationCheckerNode=(p) => <BaseNode {...p} icon={AlertTriangle}  color="rose"    description="Detect hallucinations" />;
const QueryRouterNode        = (p) => <BaseNode {...p} icon={GitFork}        color="rose"    description="Route to best path" />;
const ParentDocRetrieverNode = (p) => <BaseNode {...p} icon={FolderSearch}   color="teal"    description="Retrieve parent + child docs" />;
const BM25RetrieverNode      = (p) => <BaseNode {...p} icon={AlignLeft}      color="teal"    description="Sparse keyword search" />;
const EnsembleRetrieverNode  = (p) => <BaseNode {...p} icon={Layers}         color="teal"    description="Combine retrievers (RRF)" />;
const ContextualCompressorNode=(p) => <BaseNode {...p} icon={Minimize2}      color="teal"    description="Extract relevant passages" />;
const KnowledgeGraphBuilderNode=(p)=> <BaseNode {...p} icon={Share2}         color="fuchsia" description="Build entity-relation graph" />;
const GraphRetrieverNode     = (p) => <BaseNode {...p} icon={Network}        color="fuchsia" description="Graph-based retrieval" />;
const ConversationMemoryNode = (p) => <BaseNode {...p} icon={Brain}          color="sky"     description="Store conversation turns" />;
const ChatHistoryNode        = (p) => <BaseNode {...p} icon={History}        color="sky"     description="Inject chat context" />;
const StreamingResponseNode  = (p) => <BaseNode {...p} icon={Radio}          color="indigo"  description="Stream tokens to UI" />;
const CitationGeneratorNode  = (p) => <BaseNode {...p} icon={BookMarked}     color="indigo"  description="Generate inline citations" />;

const nodeTypes = {
  FileSource: FileSourceNode, WebSource: WebSourceNode, S3Source: S3SourceNode,
  DocumentExtraction: DocumentExtractionNode, OCRProcessor: OCRProcessorNode,
  MarkdownConverter: MarkdownConverterNode, Chunker: ChunkerNode,
  MetadataExtractor: MetadataExtractorNode, SemanticSplitter: SemanticSplitterNode,
  VectorStore: VectorStoreNode, ChromaDBStore: ChromaDBStoreNode,
  VectorRetriever: VectorRetrieverNode, HybridRetriever: HybridRetrieverNode,
  Reranker: RerankerNode, CohereRerank: CohereRerankNode,
  LLMResponse: LLMResponseNode, Summarizer: SummarizerNode, StructuredOutput: StructuredOutputNode,
  // Advanced
  HyDE: HyDENode, MultiQueryExpander: MultiQueryExpanderNode,
  StepBackPrompt: StepBackPromptNode, QueryRewriter: QueryRewriterNode,
  DocumentGrader: DocumentGraderNode, AnswerGrader: AnswerGraderNode,
  HallucinationChecker: HallucinationCheckerNode, QueryRouter: QueryRouterNode,
  ParentDocRetriever: ParentDocRetrieverNode, BM25Retriever: BM25RetrieverNode,
  EnsembleRetriever: EnsembleRetrieverNode, ContextualCompressor: ContextualCompressorNode,
  KnowledgeGraphBuilder: KnowledgeGraphBuilderNode, GraphRetriever: GraphRetrieverNode,
  ConversationMemory: ConversationMemoryNode, ChatHistory: ChatHistoryNode,
  StreamingResponse: StreamingResponseNode, CitationGenerator: CitationGeneratorNode,
};

// ── Inner Flow (needs useReactFlow inside ReactFlowProvider) ─────────────────
const FlowInner = () => {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    setNodes, setEdges,
    onNodesDelete, onEdgesDelete,
    setSelectedNodeId,
    undo, redo, history, future,
    connectionError, clearConnectionError,
    setChatPanelOpen,
  } = useStore();

  const { screenToFlowPosition } = useReactFlow();

  const [isRunningIngestion, setIsRunningIngestion] = useState(false);
  const [isRunningQuery, setIsRunningQuery]         = useState(false);
  const [toast, setToast] = useState(null);

  const confirmModal  = useModal();
  const resultModal   = useModal();

  // Show connection errors as toasts
  useEffect(() => {
    if (connectionError) {
      setToast({ message: connectionError.message, variant: 'error' });
      clearConnectionError();
    }
  }, [connectionError, clearConnectionError]);

  const showToast = (message, variant = 'error') => setToast({ message, variant });

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const reg = NODE_REGISTRY_MAP[type];
      const label = reg?.label ?? type;

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label, type, config: {} },
      };
      setNodes(nodes.concat(newNode));
    },
    [nodes, setNodes, screenToFlowPosition]
  );

  const onClear = useCallback(() => {
    confirmModal.open({
      title: 'Reset Canvas',
      message: 'This will remove all nodes and edges. This action can be undone with Ctrl+Z.',
      confirmLabel: 'Reset',
      variant: 'danger',
      onConfirm: () => {
        setNodes([]);
        setEdges([]);
        setSelectedNodeId(null);
      },
    });
  }, [confirmModal, setNodes, setEdges, setSelectedNodeId]);

  const onRunIngestion = useCallback(async () => {
    setIsRunningIngestion(true);
    try {
      const response = await axios.post('http://localhost:8000/run-ingestion', { nodes, edges });
      resultModal.open({
        title: 'Ingestion Complete',
        content: response.data,
        variant: 'success',
      });
    } catch (error) {
      resultModal.open({
        title: 'Ingestion Failed',
        content: error.response?.data?.detail || error.message,
        variant: 'error',
      });
    } finally {
      setIsRunningIngestion(false);
    }
  }, [nodes, edges, resultModal]);

  // handleQuerySubmit is called from ChatPanel via the store's nodes/edges
  // We expose it on the store so ChatPanel can trigger it without prop drilling
  useEffect(() => {
    useStore.setState({ _runQuery: async (query) => {
      setIsRunningQuery(true);
      try {
        const { nodes: n, edges: e } = useStore.getState();
        const response = await axios.post('http://localhost:8000/run-query', { nodes: n, edges: e, query });
        useStore.getState().addChatMessage({
          id: Date.now(),
          role: 'assistant',
          content: response.data.answer ?? JSON.stringify(response.data),
          sources: response.data.sources ?? [],
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        showToast('Query failed: ' + (error.response?.data?.detail || error.message), 'error');
      } finally {
        setIsRunningQuery(false);
      }
    }});
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} pannable zoomable />

        <Panel position="top-right" className="flex flex-col space-y-2 mr-3 mt-2">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex flex-col space-y-2">
            <button
              onClick={onRunIngestion}
              disabled={isRunningIngestion}
              className="flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-semibold min-w-[140px]"
            >
              {isRunningIngestion ? <Spinner size={14} className="text-white" /> : <DatabaseZap size={14} />}
              <span>{isRunningIngestion ? 'Running…' : 'Run Ingestion'}</span>
            </button>
            <button
              onClick={() => setChatPanelOpen(true)}
              disabled={isRunningQuery}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-semibold min-w-[140px]"
            >
              <MessageCircle size={14} />
              <span>Run Query</span>
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="bg-white p-1.5 rounded-xl shadow-lg border border-gray-100 flex space-x-1">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={13} /><span>Undo</span>
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              title="Redo (Ctrl+Shift+Z)"
            >
              <RotateCw size={13} /><span>Redo</span>
            </button>
          </div>

          <button
            onClick={onClear}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-xl shadow-sm transition-all text-sm font-medium"
          >
            <Trash2 size={13} />
            <span>Reset Canvas</span>
          </button>
        </Panel>
      </ReactFlow>

      {/* Connection error / general toasts */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Confirm modal (replaces confirm()) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        {...confirmModal.props}
        onClose={confirmModal.close}
      />

      {/* Result modal (replaces alert()) */}
      <ResultModal
        isOpen={resultModal.isOpen}
        {...resultModal.props}
        onClose={resultModal.close}
      />
    </div>
  );
};

// Wrap with ReactFlowProvider so useReactFlow() works inside FlowInner
const Flow = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);

export default Flow;
