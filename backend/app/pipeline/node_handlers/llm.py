"""LLM nodes: LLMResponse, Summarizer, StructuredOutput, PromptNode, LLMRouter."""
import json
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.pipeline.llm_factory import build_chat_llm


def _get_llm(config: dict, llm_config: dict, temperature_override: float | None = None):
    return build_chat_llm(
        provider=config.get("useProjectLLM", True) and llm_config.get("chat_provider", "openai") or config.get("provider", llm_config.get("chat_provider", "openai")),
        model=config.get("model") if config.get("useProjectLLM") is False else llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=temperature_override if temperature_override is not None else float(config.get("temperature", llm_config.get("temperature", 0.7))),
        max_tokens=int(config.get("maxTokens", llm_config.get("max_tokens", 2048))),
    )


def _format_context(docs: list[Document]) -> str:
    return "\n\n---\n\n".join(d.page_content for d in docs)


async def handle_llm_response(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    docs: list[Document] = inputs.get("ranked_docs", inputs.get("retrieved_docs", []))
    query: str = inputs.get("query", "")
    system_prompt = config.get("systemPrompt", "You are a helpful assistant. Answer based on the context.")

    context = _format_context(docs)
    llm = _get_llm(config, llm_config)

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Context:\n{context}\n\nQuestion: {question}"),
    ])
    chain = prompt | llm | StrOutputParser()
    answer = await chain.ainvoke({"context": context, "question": query})
    return {"answer": answer}


async def handle_summarizer(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    from langchain.chains.summarize import load_summarize_chain

    docs: list[Document] = inputs.get("retrieved_docs", [])
    if not docs:
        return {"answer": ""}

    llm = _get_llm(config, llm_config)
    chain_type = config.get("chainType", "map_reduce")
    chain = load_summarize_chain(llm, chain_type=chain_type)
    result = await chain.ainvoke({"input_documents": docs})
    return {"answer": result.get("output_text", "")}


async def handle_structured_output(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Return a structured JSON response according to a schema."""
    docs: list[Document] = inputs.get("ranked_docs", inputs.get("retrieved_docs", []))
    query: str = inputs.get("query", "")
    schema_str: str = config.get("outputSchema", "{}")
    context = _format_context(docs)

    llm = _get_llm(config, llm_config, temperature_override=0.0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"Return a JSON object matching this schema:\n{schema_str}\nAnswer based on the context."),
        ("human", "Context:\n{context}\n\nQuestion: {question}"),
    ])
    chain = prompt | llm | StrOutputParser()
    raw = await chain.ainvoke({"context": context, "question": query})
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"raw": raw}
    return {"answer": json.dumps(parsed)}


async def handle_prompt_node(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Flexible prompt template node — text or JSON output."""
    query: str = inputs.get("query", "")
    docs: list[Document] = inputs.get("retrieved_docs", [])
    template: str = config.get("promptTemplate", "Query: {{query}}\nContext: {{context}}")
    output_type: str = config.get("outputType", "text")
    schema_str: str = config.get("jsonSchema", "{}")

    context = _format_context(docs)
    filled = template.replace("{{query}}", query).replace("{{context}}", context)

    llm = _get_llm(config, llm_config)
    prompt = ChatPromptTemplate.from_messages([("human", "{input}")])
    chain = prompt | llm | StrOutputParser()
    raw = await chain.ainvoke({"input": filled})

    if output_type == "json":
        try:
            parsed = json.loads(raw)
            # Return each field as a separate key for dynamic handle routing
            return {k: v for k, v in parsed.items()} | {"query": raw}
        except json.JSONDecodeError:
            pass
    return {"query": raw}


async def handle_llm_router(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """LLM-powered multi-path router — decides which route label to follow."""
    query: str = inputs.get("query", "")
    routes: list[str] = config.get("routes", ["route_1", "route_2"])
    routing_prompt: str = config.get("routingPrompt",
        "Given the following query, decide which route to take: {routes}\nQuery: {query}\nRespond with only the route name.")

    llm = _get_llm(config, llm_config, temperature_override=0.0)
    prompt_str = routing_prompt.replace("{routes}", ", ".join(routes)).replace("{query}", query)
    prompt = ChatPromptTemplate.from_messages([("human", "{input}")])
    chain = prompt | llm | StrOutputParser()
    chosen = (await chain.ainvoke({"input": prompt_str})).strip()

    # Return query on all output ports, but tag which route was chosen
    result: dict = {"query": query, "_chosen_route": chosen}
    for i, route in enumerate(routes):
        result[f"query_{i}"] = query if chosen.lower() == route.lower() else ""
    return result
