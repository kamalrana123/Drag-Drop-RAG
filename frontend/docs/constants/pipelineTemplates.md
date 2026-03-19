# pipelineTemplates

> Five preset RAG pipeline configurations ready to load onto the canvas.

## Overview

`pipelineTemplates.js` exports an array of pre-built pipeline definitions. Each template is a complete serialized pipeline (nodes + edges) that can be loaded directly into the canvas via `WorkflowManager`. Templates demonstrate different RAG architectural patterns.

## Location

`src/constants/pipelineTemplates.js`

## Exports

```js
export const PIPELINE_TEMPLATES; // PipelineTemplate[]
```

## `PipelineTemplate` Shape

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name shown in WorkflowManager |
| `description` | `string` | Short explanation of the pattern |
| `nodeCount` | `number` | Number of nodes (shown in the UI card) |
| `pipeline` | `SerializedPipeline` | Serialized nodes + edges ready for `deserializePipeline()` |

## Available Templates

### 1. `basic-rag`
**Basic RAG Pipeline** — The standard retrieval-augmented generation pattern.

```
FileSource → Chunker → VectorStore → VectorRetriever → Reranker → LLMResponse
```

6 nodes.

---

### 2. `hyde-hybrid`
**HyDE + Hybrid Retrieval** — Uses hypothetical document embeddings with hybrid dense+sparse search.

```
WebSource → Chunker → VectorStore
                  HyDE → HybridRetriever → ContextualCompressor → LLMResponse
```

7 nodes.

---

### 3. `multi-query-fusion`
**Multi-Query Fusion + Cohere Rerank** — Generates multiple query variants and fuses results.

```
FileSource → SemanticSplitter → VectorStore
                MultiQueryExpander → EnsembleRetriever → CohereRerank → CitationGenerator
```

7 nodes.

---

### 4. `agentic-self-rag`
**Agentic Self-RAG** — Adds grading and hallucination checking loops.

```
FileSource → Chunker → VectorStore
                QueryRouter → VectorRetriever + BM25Retriever → DocumentGrader → LLMResponse → HallucinationChecker
```

9 nodes.

---

### 5. `graph-rag`
**Graph RAG** — Extracts a knowledge graph and uses graph-based retrieval.

```
FileSource → DocumentExtraction → Chunker → KnowledgeGraphBuilder → GraphRetriever → LLMResponse
```

6 nodes.

---

## Usage

Templates are loaded in `WorkflowManager`:
```js
const { nodes, edges } = deserializePipeline(template.pipeline);
loadPipeline(nodes, edges);
```

## Notes

- `nodeCount` is a manually set field for display purposes — it should match the actual number of nodes in `pipeline`.
- Templates are static; they are not affected by saved pipeline changes.
- Node positions in templates are pre-calculated for a readable left-to-right layout.
