import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  FileText, Database, Filter, MessageSquare, Play, 
  Settings, Scan, Scissors, Tags, Globe, Cloud, 
  Layout, Zap, ListFilter, BrainCircuit, Sparkles, Hash,
  Terminal, DatabaseZap
} from 'lucide-react';
import { useStore } from '../store';
import BaseNode from './BaseNode';
import axios from 'axios';

// --- Custom Node Components ---

const FileSourceNode = (props) => <BaseNode {...props} icon={FileText} color="blue" description="Local PDF/TXT/DOCX" />;
const WebSourceNode = (props) => <BaseNode {...props} icon={Globe} color="blue" description="Crawl URL content" />;
const S3SourceNode = (props) => <BaseNode {...props} icon={Cloud} color="blue" description="AWS S3 bucket" />;

const DocumentExtractionNode = (props) => <BaseNode {...props} icon={Scan} color="amber" description="Unified Extraction" />;
const OCRProcessorNode = (props) => <BaseNode {...props} icon={Layout} color="amber" description="OCR for images" />;
const MarkdownConverterNode = (props) => <BaseNode {...props} icon={Hash} color="amber" description="Convert to Markdown" />;

const ChunkerNode = (props) => <BaseNode {...props} icon={Scissors} color="emerald" description="Split text into chunks" />;
const MetadataExtractorNode = (props) => <BaseNode {...props} icon={Tags} color="emerald" description="Summary, Entities, etc." />;
const SemanticSplitterNode = (props) => <BaseNode {...props} icon={BrainCircuit} color="emerald" description="Embedding-based split" />;

const VectorStoreNode = (props) => <BaseNode {...props} icon={Database} color="green" description="Qdrant Vector DB" />;
const ChromaDBStoreNode = (props) => <BaseNode {...props} icon={Database} color="green" description="Local ChromaDB" />;

const VectorRetrieverNode = (props) => <BaseNode {...props} icon={Zap} color="cyan" description="Dense semantic search" />;
const HybridRetrieverNode = (props) => <BaseNode {...props} icon={ListFilter} color="cyan" description="Dense + Sparse Search" />;

const RerankerNode = (props) => <BaseNode {...props} icon={Filter} color="orange" description="FlashRank Reranking" />;
const CohereRerankNode = (props) => <BaseNode {...props} icon={Sparkles} color="orange" description="Cohere API Rerank" />;

const LLMResponseNode = (props) => <BaseNode {...props} icon={MessageSquare} color="purple" description="Generate final answer" />;
const SummarizerNode = (props) => <BaseNode {...props} icon={Zap} color="purple" description="Condense documents" />;
const StructuredOutputNode = (props) => <BaseNode {...props} icon={Terminal} color="purple" description="Extract JSON/Schema" />;

const nodeTypes = {
  FileSource: FileSourceNode,
  WebSource: WebSourceNode,
  S3Source: S3SourceNode,
  DocumentExtraction: DocumentExtractionNode,
  OCRProcessor: OCRProcessorNode,
  MarkdownConverter: MarkdownConverterNode,
  Chunker: ChunkerNode,
  MetadataExtractor: MetadataExtractorNode,
  SemanticSplitter: SemanticSplitterNode,
  VectorStore: VectorStoreNode,
  ChromaDBStore: ChromaDBStoreNode,
  VectorRetriever: VectorRetrieverNode,
  HybridRetriever: HybridRetrieverNode,
  Reranker: RerankerNode,
  CohereRerank: CohereRerankNode,
  LLMResponse: LLMResponseNode,
  Summarizer: SummarizerNode,
  StructuredOutput: StructuredOutputNode,
};

const Flow = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setNodes, 
    onNodesDelete, 
    onEdgesDelete, 
    setEdges,
    setSelectedNode
  } = useStore();

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = {
        x: event.clientX - 350,
        y: event.clientY - 100,
      };
      
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type}`, type, config: {} },
      };

      setNodes(nodes.concat(newNode));
    },
    [nodes, setNodes]
  );

  const onClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, setSelectedNode]);

  const onRunIngestion = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:8000/run-ingestion', { nodes, edges });
      alert('Ingestion Complete: ' + JSON.stringify(response.data.result));
    } catch (error) {
      alert('Ingestion Failed: ' + (error.response?.data?.detail || error.message));
    }
  }, [nodes, edges]);

  const onRunQuery = useCallback(async () => {
    try {
      const query = prompt("Enter your query:", "What is the summary of these documents?");
      if (!query) return;
      const response = await axios.post('http://localhost:8000/run-query', { nodes, edges, query });
      alert('RAG Answer: ' + response.data.answer);
    } catch (error) {
      alert('Query Failed: ' + (error.response?.data?.detail || error.message));
    }
  }, [nodes, edges]);

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden">
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
        <MiniMap />
        <Panel position="top-right" className="flex flex-col space-y-3 mr-4">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex flex-col space-y-2">
            <button
              onClick={onRunIngestion}
              className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-semibold"
            >
              <DatabaseZap size={16} />
              <span>Run Ingestion</span>
            </button>
            <button
              onClick={onRunQuery}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-semibold"
            >
              <MessageSquare size={16} />
              <span>Run Query</span>
            </button>
          </div>
          <button
            onClick={onClear}
            className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
          >
            <Hash size={14} className="rotate-90" />
            <span>Reset Canvas</span>
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Flow;
