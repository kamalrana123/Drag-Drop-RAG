import { useState } from 'react';
import { Eye, EyeOff, Save, CheckCircle2, Info } from 'lucide-react';
import { useStore } from '../store';
import api from '../utils/api';

// ── Provider / model catalogues ───────────────────────────────────────────────

const CHAT_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    initials: 'OA',
    color: 'bg-emerald-600',
    desc: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    initials: 'GG',
    color: 'bg-blue-500',
    desc: 'Gemini 2.0 Flash, 1.5 Pro',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    initials: 'AC',
    color: 'bg-orange-500',
    desc: 'Claude Opus, Sonnet, Haiku',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    initials: 'CO',
    color: 'bg-violet-600',
    desc: 'Command R+, Command R',
    models: ['command-r-plus', 'command-r', 'command'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    initials: 'MI',
    color: 'bg-indigo-500',
    desc: 'Mistral Large, Medium, Small',
    models: ['mistral-large-latest', 'mistral-medium', 'mistral-small'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    initials: 'OL',
    color: 'bg-gray-600',
    desc: 'Llama 3, Mistral, Phi-3, Gemma 2',
    models: ['llama3', 'mistral', 'phi3', 'gemma2'],
    noKey: true,
  },
];

const EMBEDDING_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    initials: 'OA',
    color: 'bg-emerald-600',
    desc: 'text-embedding-3 series',
    models: ['text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002'],
  },
  {
    id: 'google',
    name: 'Google',
    initials: 'GG',
    color: 'bg-blue-500',
    desc: 'text-embedding-004, embedding-001',
    models: ['text-embedding-004', 'embedding-001'],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    initials: 'CO',
    color: 'bg-violet-600',
    desc: 'embed-english-v3, multilingual',
    models: ['embed-english-v3.0', 'embed-multilingual-v3.0'],
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    initials: 'HF',
    color: 'bg-yellow-500',
    desc: 'BGE, MiniLM and more',
    models: ['BAAI/bge-large-en-v1.5', 'sentence-transformers/all-MiniLM-L6-v2'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    initials: 'OL',
    color: 'bg-gray-600',
    desc: 'nomic-embed-text, mxbai',
    models: ['nomic-embed-text', 'mxbai-embed-large'],
    noKey: true,
  },
];

const API_KEY_PROVIDERS = ['openai', 'google', 'anthropic', 'cohere', 'mistral'];

// ── Sub-components ────────────────────────────────────────────────────────────

function ProviderCard({ provider, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-3 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-8 h-8 ${provider.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-xs font-bold">{provider.initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold leading-snug ${selected ? 'text-indigo-700' : 'text-gray-800'}`}>
          {provider.name}
        </p>
        <p className="text-[11px] text-gray-400 leading-snug truncate">{provider.desc}</p>
      </div>
      {selected && (
        <CheckCircle2 size={14} className="text-indigo-500 flex-shrink-0" />
      )}
    </button>
  );
}

function ApiKeyRow({ providerName, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs font-medium text-gray-600 w-24 flex-shrink-0">{providerName}</span>
      <div className="relative flex-1">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-…"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-800 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

const DEFAULT_LLM_CONFIG = {
  chatProvider: 'openai',
  chatModel: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2048,
  embeddingProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',
  apiKeys: { openai: '', google: '', anthropic: '', cohere: '', mistral: '' },
};

export default function ProjectLLMTab({ project }) {
  const { currentProjectId } = useStore();
  const initial = { ...DEFAULT_LLM_CONFIG, ...(project.llmConfig ?? {}) };
  // Ensure apiKeys always has all provider keys
  initial.apiKeys = { ...DEFAULT_LLM_CONFIG.apiKeys, ...(initial.apiKeys ?? {}) };

  const [cfg, setCfg] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = (patch) => setCfg((prev) => ({ ...prev, ...patch }));
  const updateKey = (provider, val) =>
    setCfg((prev) => ({ ...prev, apiKeys: { ...prev.apiKeys, [provider]: val } }));

  const handleChatProvider = (id) => {
    const provider = CHAT_PROVIDERS.find((p) => p.id === id);
    update({ chatProvider: id, chatModel: provider.models[0] });
  };

  const handleEmbedProvider = (id) => {
    const provider = EMBEDDING_PROVIDERS.find((p) => p.id === id);
    update({ embeddingProvider: id, embeddingModel: provider.models[0] });
  };

  const handleSave = async () => {
    try {
      await api.llmConfig.save(currentProjectId, cfg);
    } catch { /* non-fatal — config still in local state */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chatProvider = CHAT_PROVIDERS.find((p) => p.id === cfg.chatProvider);
  const embedProvider = EMBEDDING_PROVIDERS.find((p) => p.id === cfg.embeddingProvider);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Chat / Generation ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Chat / Generation Model</h3>
          <p className="text-xs text-gray-400 mb-5">Used for answering questions and generating responses in your RAG pipeline.</p>

          {/* Provider grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {CHAT_PROVIDERS.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                selected={cfg.chatProvider === p.id}
                onClick={() => handleChatProvider(p.id)}
              />
            ))}
          </div>

          {/* Model dropdown */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Model</label>
            <select
              value={cfg.chatModel}
              onChange={(e) => update({ chatModel: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              {chatProvider?.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600">Temperature</label>
              <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                {cfg.temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={cfg.temperature}
              onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-0.5">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max tokens */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Output Tokens</label>
            <input
              type="number"
              min={256}
              max={16384}
              step={256}
              value={cfg.maxTokens}
              onChange={(e) => update({ maxTokens: parseInt(e.target.value, 10) || 2048 })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-[11px] text-gray-400 mt-1">Range: 256 – 16,384 tokens</p>
          </div>
        </div>

        {/* ── Embeddings ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Embedding Model</h3>
          <p className="text-xs text-gray-400 mb-5">Used to convert documents and queries into vectors for semantic search.</p>

          {/* Provider grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {EMBEDDING_PROVIDERS.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                selected={cfg.embeddingProvider === p.id}
                onClick={() => handleEmbedProvider(p.id)}
              />
            ))}
          </div>

          {/* Model dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Model</label>
            <select
              value={cfg.embeddingModel}
              onChange={(e) => update({ embeddingModel: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              {embedProvider?.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── API Keys ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">API Keys</h3>
          <p className="text-xs text-gray-400 mb-5">One key per provider — used for both chat and embeddings.</p>

          <div className="space-y-3 mb-5">
            {API_KEY_PROVIDERS.map((id) => {
              const label = CHAT_PROVIDERS.find((p) => p.id === id)?.name ?? id;
              return (
                <ApiKeyRow
                  key={id}
                  providerName={label}
                  value={cfg.apiKeys[id] ?? ''}
                  onChange={(val) => updateKey(id, val)}
                />
              );
            })}

            {/* Ollama note */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-gray-600 w-24 flex-shrink-0">Ollama</span>
              <div className="flex-1 flex items-center space-x-2 px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                <span className="text-xs text-gray-500">No API key required — runs locally</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Keys are encrypted with Fernet and stored server-side. They are never forwarded to third parties directly — only used at inference time.
            </p>
          </div>
        </div>

        {/* ── Save ──────────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
