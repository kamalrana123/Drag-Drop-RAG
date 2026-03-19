import { useState } from 'react';
import { useStore } from '../store';
import { NODE_REGISTRY_MAP } from '../constants/nodeRegistry';
import { X, Settings, Plus, Minus } from 'lucide-react';

// Shared field components
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all";
const selectCls = `${inputCls} bg-white cursor-pointer`;
const llmModelOptions = (
  <>
    <option value="gpt-4o">GPT-4o</option>
    <option value="gpt-4o-mini">GPT-4o Mini</option>
    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
    <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
  </>
);

const SettingsPanel = () => {
  const { selectedNodeId, setSelectedNodeId, updateNodeData, nodes } = useStore();

  if (!selectedNodeId) return null;
  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const config = node.data.config || {};
  const set = (key, value) => {
    updateNodeData(node.id, { config: { ...config, [key]: value } });
  };

  const reg = NODE_REGISTRY_MAP[node.type];
  const colorCls = reg ? `text-${reg.color}-600 bg-${reg.color}-50` : 'text-gray-600 bg-gray-50';
  const IconComp = reg?.icon ?? Settings;

  const renderConfig = () => {
    switch (node.type) {
      // ── Data Ingestion ────────────────────────────────────────────────
      case 'FileSource':
        return (
          <div className="space-y-4">
            <Field label="File Types">
              <div className="flex flex-wrap gap-2">
                {['.pdf', '.txt', '.docx', '.md', '.csv', '.json'].map((ext) => (
                  <label key={ext} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.extensions || ['.pdf', '.txt']).includes(ext)}
                      onChange={(e) => {
                        const exts = config.extensions || ['.pdf', '.txt'];
                        set('extensions', e.target.checked ? [...exts, ext] : exts.filter((x) => x !== ext));
                      }}
                      className="rounded text-indigo-600 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">{ext}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        );

      case 'WebSource':
        return (
          <div className="space-y-4">
            <Field label="Target URL">
              <input type="text" placeholder="https://example.com" value={config.url || ''} onChange={(e) => set('url', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Max Crawl Depth">
              <input type="number" min={1} max={5} value={config.depth || 1} onChange={(e) => set('depth', parseInt(e.target.value))} className={inputCls} />
            </Field>
          </div>
        );

      case 'S3Source':
        return (
          <div className="space-y-4">
            <Field label="Bucket Name"><input type="text" value={config.bucket || ''} onChange={(e) => set('bucket', e.target.value)} className={inputCls} /></Field>
            <Field label="Prefix / Path"><input type="text" value={config.prefix || ''} onChange={(e) => set('prefix', e.target.value)} className={inputCls} /></Field>
            <Field label="AWS Region"><input type="text" placeholder="us-east-1" value={config.region || ''} onChange={(e) => set('region', e.target.value)} className={inputCls} /></Field>
          </div>
        );

      // ── Document Extraction ───────────────────────────────────────────
      case 'DocumentExtraction':
        return (
          <div className="space-y-4">
            <Field label="Strategy">
              <select value={config.strategy || 'simple'} onChange={(e) => set('strategy', e.target.value)} className={selectCls}>
                <option value="simple">Simple Text</option>
                <option value="layout">Layout-Aware</option>
                <option value="markdown">Markdown</option>
                <option value="ocr">OCR Only</option>
              </select>
            </Field>
          </div>
        );

      case 'OCRProcessor':
        return (
          <div className="space-y-4">
            <Field label="OCR Engine">
              <select value={config.engine || 'tesseract'} onChange={(e) => set('engine', e.target.value)} className={selectCls}>
                <option value="tesseract">Tesseract</option>
                <option value="easyocr">EasyOCR</option>
                <option value="paddle">PaddleOCR</option>
              </select>
            </Field>
            <Field label="Language Code">
              <input type="text" value={config.lang || 'eng'} onChange={(e) => set('lang', e.target.value)} className={inputCls} placeholder="eng, chi_sim, fra…" />
            </Field>
          </div>
        );

      case 'MarkdownConverter':
        return (
          <div className="space-y-4">
            <Field label="Output Format">
              <select value={config.format || 'gfm'} onChange={(e) => set('format', e.target.value)} className={selectCls}>
                <option value="gfm">GitHub Flavored</option>
                <option value="commonmark">CommonMark</option>
                <option value="pandoc">Pandoc</option>
              </select>
            </Field>
            <Field label="Options">
              <div className="space-y-1.5">
                {[['includeTables', 'Include Tables'], ['includeCodeBlocks', 'Include Code Blocks'], ['preserveImages', 'Preserve Image Links']].map(([k, l]) => (
                  <label key={k} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={config[k] ?? true} onChange={(e) => set(k, e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                    <span className="text-xs text-gray-600">{l}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        );

      // ── Text Enrichment ───────────────────────────────────────────────
      case 'Chunker':
        return (
          <div className="space-y-4">
            <Field label="Strategy">
              <select value={config.strategy || 'recursive'} onChange={(e) => set('strategy', e.target.value)} className={selectCls}>
                <option value="recursive">Recursive</option>
                <option value="sentence">Sentence</option>
                <option value="token">Token</option>
                <option value="semantic">Semantic</option>
              </select>
            </Field>
            <Field label="Chunk Size (tokens)">
              <input type="number" value={config.chunkSize || 512} onChange={(e) => set('chunkSize', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Overlap (tokens)">
              <input type="number" value={config.chunkOverlap || 50} onChange={(e) => set('chunkOverlap', parseInt(e.target.value))} className={inputCls} />
            </Field>
          </div>
        );

      case 'MetadataExtractor':
        return (
          <div className="space-y-4">
            <Field label="Extract Fields">
              <div className="flex flex-wrap gap-2">
                {['Title', 'Author', 'Date', 'Keywords', 'Entities', 'Summary'].map((f) => (
                  <label key={f} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.fields || ['Title', 'Keywords']).includes(f)}
                      onChange={(e) => {
                        const fields = config.fields || ['Title', 'Keywords'];
                        set('fields', e.target.checked ? [...fields, f] : fields.filter((x) => x !== f));
                      }}
                      className="rounded text-indigo-600 h-3 w-3"
                    />
                    <span className="text-xs text-gray-600">{f}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o-mini'} onChange={(e) => set('model', e.target.value)} className={selectCls}>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </Field>
            <Field label="Max Summary Length">
              <input type="number" value={config.maxSummaryLen || 200} onChange={(e) => set('maxSummaryLen', parseInt(e.target.value))} className={inputCls} />
            </Field>
          </div>
        );

      case 'SemanticSplitter':
        return (
          <div className="space-y-4">
            <Field label="Embedding Model">
              <select value={config.embedModel || 'text-embedding-3-small'} onChange={(e) => set('embedModel', e.target.value)} className={selectCls}>
                <option value="text-embedding-3-small">OpenAI Small</option>
                <option value="text-embedding-3-large">OpenAI Large</option>
                <option value="bge-large-en">BGE Large EN</option>
              </select>
            </Field>
            <Field label="Buffer Size">
              <input type="number" min={1} max={5} value={config.bufferSize || 1} onChange={(e) => set('bufferSize', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Breakpoint Threshold">
              <input type="range" min="0" max="1" step="0.05" value={config.threshold || 0.7} onChange={(e) => set('threshold', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{config.threshold || 0.7}</div>
            </Field>
          </div>
        );

      // ── Vector Storage ────────────────────────────────────────────────
      case 'VectorStore':
        return (
          <div className="space-y-4">
            <Field label="Collection Name"><input type="text" value={config.collection || 'default'} onChange={(e) => set('collection', e.target.value)} className={inputCls} /></Field>
            <Field label="Qdrant URL"><input type="text" value={config.url || 'http://localhost:6333'} onChange={(e) => set('url', e.target.value)} className={inputCls} /></Field>
            <Field label="Embedding Dimension">
              <select value={config.dim || '1536'} onChange={(e) => set('dim', e.target.value)} className={selectCls}>
                <option value="1536">1536 (OpenAI small)</option>
                <option value="3072">3072 (OpenAI large)</option>
                <option value="768">768 (BGE)</option>
              </select>
            </Field>
          </div>
        );

      case 'ChromaDBStore':
        return (
          <div className="space-y-4">
            <Field label="Collection Name"><input type="text" value={config.collection || 'default'} onChange={(e) => set('collection', e.target.value)} className={inputCls} /></Field>
            <Field label="Persist Directory"><input type="text" value={config.persistDir || './chroma_db'} onChange={(e) => set('persistDir', e.target.value)} className={inputCls} /></Field>
          </div>
        );

      // ── Retrieval ─────────────────────────────────────────────────────
      case 'VectorRetriever':
        return (
          <div className="space-y-4">
            <Field label="Top K"><input type="number" min={1} max={50} value={config.topK || 5} onChange={(e) => set('topK', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Score Threshold">
              <input type="range" min="0" max="1" step="0.05" value={config.scoreThreshold || 0.0} onChange={(e) => set('scoreThreshold', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{config.scoreThreshold || 0}</div>
            </Field>
          </div>
        );

      case 'HybridRetriever':
        return (
          <div className="space-y-4">
            <Field label="Top K"><input type="number" min={1} max={50} value={config.topK || 5} onChange={(e) => set('topK', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Alpha (0=BM25, 1=Vector)">
              <input type="range" min="0" max="1" step="0.1" value={config.alpha || 0.5} onChange={(e) => set('alpha', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{config.alpha || 0.5}</div>
            </Field>
          </div>
        );

      // ── Rerankers ─────────────────────────────────────────────────────
      case 'Reranker':
        return (
          <div className="space-y-4">
            <Field label="Top N"><input type="number" min={1} max={20} value={config.topN || 3} onChange={(e) => set('topN', parseInt(e.target.value))} className={inputCls} /></Field>
          </div>
        );

      case 'CohereRerank':
        return (
          <div className="space-y-4">
            <Field label="Top N"><input type="number" min={1} max={20} value={config.topN || 3} onChange={(e) => set('topN', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Cohere API Key"><input type="password" value={config.apiKey || ''} onChange={(e) => set('apiKey', e.target.value)} placeholder="co-…" className={inputCls} /></Field>
            <Field label="Model">
              <select value={config.model || 'rerank-english-v3.0'} onChange={(e) => set('model', e.target.value)} className={selectCls}>
                <option value="rerank-english-v3.0">English v3.0</option>
                <option value="rerank-multilingual-v3.0">Multilingual v3.0</option>
              </select>
            </Field>
          </div>
        );

      // ── LLMs ─────────────────────────────────────────────────────────
      case 'LLMResponse':
      case 'Summarizer':
        return (
          <div className="space-y-4">
            <Field label="Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Temperature">
              <input type="range" min="0" max="1" step="0.05" value={config.temperature || 0.7} onChange={(e) => set('temperature', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{config.temperature || 0.7}</div>
            </Field>
            {node.type === 'LLMResponse' && (
              <Field label="System Prompt">
                <textarea value={config.systemPrompt || ''} onChange={(e) => set('systemPrompt', e.target.value)} rows={4} className={inputCls} placeholder="You are a helpful assistant…" />
              </Field>
            )}
          </div>
        );

      case 'StructuredOutput':
        return (
          <div className="space-y-4">
            <Field label="Output Format">
              <select value={config.format || 'json'} onChange={(e) => set('format', e.target.value)} className={selectCls}>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="csv">CSV</option>
              </select>
            </Field>
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="JSON Schema">
              <textarea value={config.schema || ''} onChange={(e) => set('schema', e.target.value)} rows={5} placeholder={'{\n  "name": "string",\n  "score": "number"\n}'} className={`${inputCls} font-mono text-xs`} />
            </Field>
            <Field label="Strict Mode">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.strict ?? false} onChange={(e) => set('strict', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Enforce schema strictly</span>
              </label>
            </Field>
          </div>
        );

      // ── Query Transformation ──────────────────────────────────────────
      case 'HyDE':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Hypothetical Docs to Generate">
              <input type="number" min={1} max={5} value={config.numDocs || 3} onChange={(e) => set('numDocs', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Temperature">
              <input type="range" min="0" max="1" step="0.05" value={config.temperature || 0.7} onChange={(e) => set('temperature', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{config.temperature || 0.7}</div>
            </Field>
          </div>
        );

      case 'MultiQueryExpander':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Number of Queries (2–6)">
              <input type="number" min={2} max={6} value={config.numQueries || 3} onChange={(e) => set('numQueries', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Diversity Mode">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.diversity ?? true} onChange={(e) => set('diversity', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Maximize query diversity</span>
              </label>
            </Field>
          </div>
        );

      case 'StepBackPrompt':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Abstraction Steps">
              <input type="number" min={1} max={3} value={config.steps || 1} onChange={(e) => set('steps', parseInt(e.target.value))} className={inputCls} />
            </Field>
          </div>
        );

      case 'QueryRewriter':
        return (
          <div className="space-y-4">
            <Field label="Rewrite Strategy">
              <select value={config.strategy || 'clarity'} onChange={(e) => set('strategy', e.target.value)} className={selectCls}>
                <option value="clarity">Clarity (simplify)</option>
                <option value="hyde">HyDE-inspired</option>
                <option value="condensed">Condensed (keywords)</option>
                <option value="decompose">Decompose to sub-queries</option>
              </select>
            </Field>
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
          </div>
        );

      // ── Agentic / Self-RAG ────────────────────────────────────────────
      case 'DocumentGrader':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Pass Threshold">
              <select value={config.threshold || 'balanced'} onChange={(e) => set('threshold', e.target.value)} className={selectCls}>
                <option value="strict">Strict (high relevance only)</option>
                <option value="balanced">Balanced</option>
                <option value="permissive">Permissive (keep most)</option>
              </select>
            </Field>
            <Field label="Grading Prompt">
              <textarea value={config.gradingPrompt || ''} onChange={(e) => set('gradingPrompt', e.target.value)} rows={3} placeholder="Is this document relevant to the query? Answer yes or no." className={inputCls} />
            </Field>
          </div>
        );

      case 'AnswerGrader':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Scoring Rubric">
              <textarea value={config.rubric || ''} onChange={(e) => set('rubric', e.target.value)} rows={4} placeholder="Evaluate the answer on relevance, accuracy, and completeness…" className={inputCls} />
            </Field>
          </div>
        );

      case 'HallucinationChecker':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Detection Mode">
              <select value={config.mode || 'binary'} onChange={(e) => set('mode', e.target.value)} className={selectCls}>
                <option value="binary">Binary (yes/no)</option>
                <option value="score">Score-based (0–1)</option>
              </select>
            </Field>
            {config.mode === 'score' && (
              <Field label="Hallucination Score Threshold">
                <input type="range" min="0" max="1" step="0.05" value={config.scoreThreshold || 0.5} onChange={(e) => set('scoreThreshold', parseFloat(e.target.value))} className="w-full" />
                <div className="text-xs text-gray-400 text-right">{config.scoreThreshold || 0.5}</div>
              </Field>
            )}
          </div>
        );

      case 'QueryRouter':
        return <QueryRouterConfig config={config} set={set} />;

      // ── Advanced Retrieval ────────────────────────────────────────────
      case 'ParentDocRetriever':
        return (
          <div className="space-y-4">
            <Field label="Child Chunk Size"><input type="number" value={config.childSize || 200} onChange={(e) => set('childSize', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Parent Chunk Size"><input type="number" value={config.parentSize || 1000} onChange={(e) => set('parentSize', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Top K"><input type="number" min={1} max={20} value={config.topK || 5} onChange={(e) => set('topK', parseInt(e.target.value))} className={inputCls} /></Field>
          </div>
        );

      case 'BM25Retriever':
        return (
          <div className="space-y-4">
            <Field label="Top K"><input type="number" min={1} max={50} value={config.topK || 5} onChange={(e) => set('topK', parseInt(e.target.value))} className={inputCls} /></Field>
            <Field label="Language">
              <select value={config.language || 'english'} onChange={(e) => set('language', e.target.value)} className={selectCls}>
                <option value="english">English</option>
                <option value="multilingual">Multilingual</option>
                <option value="chinese">Chinese</option>
              </select>
            </Field>
            <Field label="Stemming">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.stemming ?? true} onChange={(e) => set('stemming', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Enable stemming</span>
              </label>
            </Field>
          </div>
        );

      case 'EnsembleRetriever':
        return <EnsembleRetrieverConfig config={config} set={set} />;

      case 'ContextualCompressor':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Max Tokens per Chunk">
              <input type="number" value={config.maxTokens || 400} onChange={(e) => set('maxTokens', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Compression Ratio Target">
              <input type="range" min="0.1" max="1" step="0.05" value={config.ratio || 0.5} onChange={(e) => set('ratio', parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-gray-400 text-right">{Math.round((config.ratio || 0.5) * 100)}%</div>
            </Field>
          </div>
        );

      // ── Graph RAG ─────────────────────────────────────────────────────
      case 'KnowledgeGraphBuilder':
        return <KGBuilderConfig config={config} set={set} />;

      case 'GraphRetriever':
        return (
          <div className="space-y-4">
            <Field label="Traversal Depth (1–3)">
              <input type="number" min={1} max={3} value={config.depth || 2} onChange={(e) => set('depth', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Top K Entities">
              <input type="number" min={1} max={20} value={config.topK || 5} onChange={(e) => set('topK', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Include Communities">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.includeCommunities ?? false} onChange={(e) => set('includeCommunities', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Include community summaries</span>
              </label>
            </Field>
          </div>
        );

      // ── Memory ────────────────────────────────────────────────────────
      case 'ConversationMemory':
        return (
          <div className="space-y-4">
            <Field label="Memory Type">
              <select value={config.memoryType || 'buffer'} onChange={(e) => set('memoryType', e.target.value)} className={selectCls}>
                <option value="buffer">Buffer (last N messages)</option>
                <option value="summary">Summary (LLM-compressed)</option>
                <option value="token_buffer">Token Buffer</option>
              </select>
            </Field>
            <Field label="Max Messages">
              <input type="number" min={2} max={50} value={config.maxMessages || 10} onChange={(e) => set('maxMessages', parseInt(e.target.value))} className={inputCls} />
            </Field>
          </div>
        );

      case 'ChatHistory':
        return (
          <div className="space-y-4">
            <Field label="Last N Turns">
              <input type="number" min={1} max={20} value={config.lastN || 5} onChange={(e) => set('lastN', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Message Format">
              <select value={config.format || 'chatml'} onChange={(e) => set('format', e.target.value)} className={selectCls}>
                <option value="chatml">ChatML</option>
                <option value="human_ai">Human / AI</option>
                <option value="markdown">Markdown</option>
              </select>
            </Field>
          </div>
        );

      // ── Output ────────────────────────────────────────────────────────
      case 'StreamingResponse':
        return (
          <div className="space-y-4">
            <Field label="LLM Model">
              <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className={selectCls}>{llmModelOptions}</select>
            </Field>
            <Field label="Stream Target">
              <select value={config.target || 'chat_panel'} onChange={(e) => set('target', e.target.value)} className={selectCls}>
                <option value="chat_panel">Chat Panel</option>
                <option value="download">Download as file</option>
              </select>
            </Field>
            <Field label="Include Metadata">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.includeMetadata ?? false} onChange={(e) => set('includeMetadata', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Include source metadata in stream</span>
              </label>
            </Field>
          </div>
        );

      case 'CitationGenerator':
        return (
          <div className="space-y-4">
            <Field label="Citation Style">
              <select value={config.style || 'inline'} onChange={(e) => set('style', e.target.value)} className={selectCls}>
                <option value="inline">Inline [1]</option>
                <option value="apa">APA</option>
                <option value="mla">MLA</option>
                <option value="chicago">Chicago</option>
                <option value="ieee">IEEE</option>
              </select>
            </Field>
            <Field label="Max Citations">
              <input type="number" min={1} max={20} value={config.maxCitations || 5} onChange={(e) => set('maxCitations', parseInt(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Include Page Numbers">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={config.includePageNums ?? false} onChange={(e) => set('includePageNums', e.target.checked)} className="rounded text-indigo-600 h-3.5 w-3.5" />
                <span className="text-xs text-gray-600">Include page numbers</span>
              </label>
            </Field>
          </div>
        );

      default:
        return <p className="text-xs text-gray-500 italic">No configuration needed for {node.type}.</p>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${colorCls}`}>
            <IconComp size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">{node.data.label}</h2>
            <div className="text-[10px] text-gray-400 font-medium">{node.type}</div>
          </div>
        </div>
        <button onClick={() => setSelectedNodeId(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        {reg?.description && (
          <p className="text-xs text-gray-500 italic mb-4 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">{reg.description}</p>
        )}
        <div className="text-[10px] uppercase font-bold text-gray-400 mb-4 tracking-widest border-b border-gray-100 pb-1">
          Configuration
        </div>
        {renderConfig()}
      </div>
    </div>
  );
};

// ── Sub-components for complex configs ───────────────────────────────────────
const QueryRouterConfig = ({ config, set }) => {
  const [routes, setRoutes] = useState(config.routes || ['Vector Search', 'BM25 Search']);
  const updateRoutes = (r) => { setRoutes(r); set('routes', r); };
  return (
    <div className="space-y-4">
      <Field label="Routing Strategy">
        <select value={config.strategy || 'llm'} onChange={(e) => set('strategy', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="llm">LLM-based</option>
          <option value="keyword">Keyword matching</option>
          <option value="embedding">Embedding similarity</option>
        </select>
      </Field>
      <Field label="Route Labels">
        <div className="space-y-2">
          {routes.map((r, i) => (
            <div key={i} className="flex space-x-1.5">
              <input value={r} onChange={(e) => { const n = [...routes]; n[i] = e.target.value; updateRoutes(n); }} className="flex-1 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              {routes.length > 2 && (
                <button onClick={() => updateRoutes(routes.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Minus size={13} /></button>
              )}
            </div>
          ))}
          {routes.length < 4 && (
            <button onClick={() => updateRoutes([...routes, `Route ${routes.length + 1}`])} className="flex items-center space-x-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              <Plus size={13} /><span>Add route</span>
            </button>
          )}
        </div>
      </Field>
    </div>
  );
};

const EnsembleRetrieverConfig = ({ config, set }) => {
  const [weights, setWeights] = useState(config.weights || [0.5, 0.5]);
  const updateWeights = (w) => { setWeights(w); set('weights', w); };
  return (
    <div className="space-y-4">
      <Field label="Combination Method">
        <select value={config.method || 'rrf'} onChange={(e) => set('method', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="rrf">Reciprocal Rank Fusion</option>
          <option value="linear">Linear Combination</option>
        </select>
      </Field>
      <Field label={`Retriever Weights (${weights.length} inputs)`}>
        <div className="space-y-2">
          {weights.map((w, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 w-16">Input {i + 1}</span>
              <input type="range" min="0" max="1" step="0.05" value={w} onChange={(e) => { const n = [...weights]; n[i] = parseFloat(e.target.value); updateWeights(n); }} className="flex-1" />
              <span className="text-xs text-gray-600 w-8 text-right">{w}</span>
            </div>
          ))}
          {weights.length < 4 && (
            <button onClick={() => updateWeights([...weights, 0.5])} className="flex items-center space-x-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
              <Plus size={13} /><span>Add input</span>
            </button>
          )}
        </div>
      </Field>
    </div>
  );
};

const KGBuilderConfig = ({ config, set }) => {
  const [entityTypes, setEntityTypes] = useState(config.entityTypes || ['Person', 'Organization', 'Location']);
  const [relTypes, setRelTypes] = useState(config.relationTypes || ['works_at', 'located_in']);
  const inputCls2 = "flex-1 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";
  return (
    <div className="space-y-4">
      <Field label="LLM Model">
        <select value={config.model || 'gpt-4o'} onChange={(e) => set('model', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
          <option value="gpt-4o">GPT-4o</option><option value="gpt-4o-mini">GPT-4o Mini</option>
        </select>
      </Field>
      <Field label="Entity Types">
        <div className="space-y-1.5">
          {entityTypes.map((t, i) => (
            <div key={i} className="flex space-x-1.5">
              <input value={t} onChange={(e) => { const n=[...entityTypes]; n[i]=e.target.value; setEntityTypes(n); set('entityTypes', n); }} className={inputCls2} />
              <button onClick={() => { const n=entityTypes.filter((_,j)=>j!==i); setEntityTypes(n); set('entityTypes',n); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Minus size={13} /></button>
            </div>
          ))}
          <button onClick={() => { const n=[...entityTypes,'NewType']; setEntityTypes(n); set('entityTypes',n); }} className="flex items-center space-x-1 text-xs text-indigo-500 hover:text-indigo-700"><Plus size={13}/><span>Add type</span></button>
        </div>
      </Field>
      <Field label="Relation Types">
        <div className="space-y-1.5">
          {relTypes.map((t, i) => (
            <div key={i} className="flex space-x-1.5">
              <input value={t} onChange={(e) => { const n=[...relTypes]; n[i]=e.target.value; setRelTypes(n); set('relationTypes', n); }} className={inputCls2} />
              <button onClick={() => { const n=relTypes.filter((_,j)=>j!==i); setRelTypes(n); set('relationTypes',n); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Minus size={13} /></button>
            </div>
          ))}
          <button onClick={() => { const n=[...relTypes,'new_relation']; setRelTypes(n); set('relationTypes',n); }} className="flex items-center space-x-1 text-xs text-indigo-500 hover:text-indigo-700"><Plus size={13}/><span>Add relation</span></button>
        </div>
      </Field>
      <Field label="Max Entities per Doc">
        <input type="number" value={config.maxEntities || 20} onChange={(e) => set('maxEntities', parseInt(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </Field>
    </div>
  );
};

export default SettingsPanel;
