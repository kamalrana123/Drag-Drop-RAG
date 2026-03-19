# SettingsPanel

> Right panel configuration UI — renders dynamic configuration forms for whichever node is currently selected.

## Overview

`SettingsPanel` is the right-side panel that shows configuration options for the selected node. When no node is selected, it displays a placeholder. When a node is selected, it renders a form specific to that node type. All config changes are written back to the store via `updateNodeData`.

## Location

`src/components/SettingsPanel.jsx`

## Props

None — derives selected node from `useStore`.

## Exports

```js
export default SettingsPanel;
```

## Key Behavior

### Node Derivation
Reads `selectedNodeId` from the store, then finds the node:
```js
const node = nodes.find(n => n.id === selectedNodeId);
```
This avoids stale object references.

### Icon and Color
Looks up the node's icon and color from `NODE_REGISTRY_MAP[node.type]` so the panel header matches the node card.

### Config Updates
All form inputs call:
```js
updateNodeData(node.id, { config: { ...node.data.config, [key]: value } })
```

### Sub-components

| Component | Used For |
|---|---|
| `QueryRouterConfig` | QueryRouter node — manages routing rules array |
| `EnsembleRetrieverConfig` | EnsembleRetriever — manages retriever weight list |
| `KGBuilderConfig` | KnowledgeGraphBuilder — entity/relation type management |

## Node Config Forms by Type

| Node Type | Configurable Fields |
|---|---|
| `FileSource` | File types (pdf, docx, txt, csv, json) |
| `WebSource` | URL, recursion depth, max pages |
| `S3Source` | Bucket name, prefix, region |
| `OCRProcessor` | Engine (tesseract/paddleocr/easyocr), language, DPI |
| `MarkdownConverter` | Strip HTML, preserve headings |
| `Chunker` | Strategy, chunk size, overlap |
| `MetadataExtractor` | Extract title/author/keywords/summary toggles |
| `SemanticSplitter` | Embedding model, breakpoint threshold |
| `VectorStore` | Backend (qdrant/weaviate/pinecone), collection, dims |
| `ChromaDBStore` | Collection name, distance metric, persist dir |
| `VectorRetriever` | Top-K, search type (similarity/mmr/threshold) |
| `HybridRetriever` | Top-K, alpha (dense vs sparse weight) |
| `BM25Retriever` | Top-K, language, custom stopwords |
| `EnsembleRetriever` | Per-retriever weights |
| `ContextualCompressor` | Compressor model, relevance threshold |
| `ParentDocRetriever` | Parent/child chunk sizes |
| `Reranker` | Model (flashrank/bge), Top-N |
| `CohereRerank` | Model, Top-N, relevance threshold |
| `LLMResponse` | Provider, model, temperature, max tokens, system prompt |
| `Summarizer` | Mode (stuff/map_reduce/refine), max summary length |
| `StreamingResponse` | Chunk size, delay |
| `CitationGenerator` | Format (apa/mla/chicago), include page numbers |
| `StructuredOutput` | Schema fields list |
| `HyDE` | LLM model, num hypothetical docs |
| `MultiQueryExpander` | Num queries, strategy |
| `StepBackPrompt` | Abstraction level |
| `QueryRewriter` | Rewrite strategy |
| `DocumentGrader` | Grader model, relevance threshold |
| `AnswerGrader` | Grading criteria |
| `HallucinationChecker` | Checker model, hallucination threshold |
| `QueryRouter` | Routing rules array |
| `KnowledgeGraphBuilder` | Entity types, relation types, extraction model |
| `GraphRetriever` | Max hops, community detection |
| `ConversationMemory` | Memory type, window size, max tokens |
| `ChatHistory` | Max history length |

## Dependencies

| Import | Source |
|---|---|
| `useStore` | `../store` |
| `NODE_REGISTRY_MAP` | `../constants/nodeRegistry` |
| Various Lucide icons | `lucide-react` |

## Notes

- Forms use controlled inputs bound to `node.data.config` fields.
- The panel shows "Select a node…" when `selectedNodeId` is null or the node isn't found.
- Deleting a node while it is selected causes `node` to be `undefined`; the panel gracefully falls back to the placeholder.
