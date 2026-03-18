import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, Database, Filter, MessageSquare, Play, Settings, Scan, Scissors, Tags } from 'lucide-react';
import { useStore } from '../store';
import BaseNode from './BaseNode';
import axios from 'axios';

const FileSourceNode = (props) => (
  <BaseNode {...props} icon={FileText} color="blue">
    <p className="text-[10px] text-gray-400">PDF, TXT, DOCX</p>
  </BaseNode>
);

const OCREngineNode = (props) => (
  <BaseNode {...props} icon={Scan} color="amber">
    <p className="text-[10px] text-gray-400">Extract text from images/PDFs</p>
  </BaseNode>
);

const ChunkerNode = (props) => (
  <BaseNode {...props} icon={Scissors} color="emerald">
    <p className="text-[10px] text-gray-400">Split text into chunks</p>
  </BaseNode>
);

const MetadataExtractorNode = (props) => (
  <BaseNode {...props} icon={Tags} color="indigo">
    <p className="text-[10px] text-gray-400">Extract summary, tags, etc.</p>
  </BaseNode>
);

const VectorStoreNode = (props) => (
  <BaseNode {...props} icon={Database} color="green">
    <p className="text-[10px] text-gray-400">Store in Qdrant</p>
  </BaseNode>
);

const RerankerNode = (props) => (
  <BaseNode {...props} icon={Filter} color="orange">
    <p className="text-[10px] text-gray-400">FlashRank Reranking</p>
  </BaseNode>
);

const LLMResponseNode = (props) => (
  <BaseNode {...props} icon={MessageSquare} color="purple">
    <p className="text-[10px] text-gray-400">Generate final answer</p>
  </BaseNode>
);

const nodeTypes = {
  FileSource: FileSourceNode,
  OCREngine: OCREngineNode,
  Chunker: ChunkerNode,
  MetadataExtractor: MetadataExtractorNode,
  VectorStore: VectorStoreNode,
  Reranker: RerankerNode,
  LLMResponse: LLMResponseNode,
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

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - 250,
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

  const onRun = useCallback(async () => {
    try {
      console.log('Running pipeline...', { nodes, edges });
      const response = await axios.post('http://localhost:8000/run', {
        nodes,
        edges,
        query: "What is in the document?"
      });
      alert('Response from RAG: ' + response.data.answer);
    } catch (error) {
      console.error('Failed to run pipeline:', error);
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  }, [nodes, edges]);

  return (
    <div className="w-full h-full bg-gray-50">
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
        <Panel position="top-right" className="flex flex-col space-y-2">
          <button
            onClick={onRun}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            <Play size={16} />
            <span>Run Pipeline</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg shadow-md transition-colors"
          >
            <Play size={16} className="text-gray-500 rotate-90" />
            <span>Clear Canvas</span>
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Flow;
