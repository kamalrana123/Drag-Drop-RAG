"""Memory nodes: ConversationMemory, ChatHistory."""
from langchain_core.messages import HumanMessage, AIMessage


# Simple in-memory store keyed by project_id (replaced by DB in production)
_memory_store: dict[str, list[dict]] = {}


async def handle_conversation_memory(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Store the latest answer + query in the conversation memory."""
    answer: str = inputs.get("answer", "")
    query: str = inputs.get("query", "")
    max_turns = int(config.get("maxTurns", 10))

    history = _memory_store.setdefault(project_id, [])
    if query:
        history.append({"role": "human", "content": query})
    if answer:
        history.append({"role": "ai", "content": answer})

    # Trim to max_turns (each turn = 2 messages)
    if len(history) > max_turns * 2:
        _memory_store[project_id] = history[-(max_turns * 2):]

    return {"memory": _memory_store[project_id]}


async def handle_chat_history(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Inject conversation history into the query as context."""
    memory: list[dict] = inputs.get("memory", _memory_store.get(project_id, []))
    max_messages = int(config.get("maxMessages", 6))

    recent = memory[-max_messages:]
    history_text = "\n".join(
        f"{'User' if m['role'] == 'human' else 'AI'}: {m['content']}"
        for m in recent
    )
    # Return as an enriched query string
    return {"query": history_text}
