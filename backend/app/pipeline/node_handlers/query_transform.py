"""Query transformation nodes: HyDE, MultiQueryExpander, StepBackPrompt, QueryRewriter."""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.pipeline.llm_factory import build_chat_llm


def _get_llm(config: dict, llm_config: dict):
    return build_chat_llm(
        provider=llm_config.get("chat_provider", "openai"),
        model=llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=float(config.get("temperature", 0.7)),
    )


async def handle_hyde(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Hypothetical Document Embeddings — generate a hypothetical answer to improve retrieval."""
    query: str = inputs.get("query", "")
    llm = _get_llm(config, llm_config)
    prompt = ChatPromptTemplate.from_messages([
        ("human", "Write a hypothetical document that answers: {query}")
    ])
    chain = prompt | llm | StrOutputParser()
    hypothesis = await chain.ainvoke({"query": query})
    return {"query_list": [query, hypothesis]}


async def handle_multi_query_expander(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Generate multiple variations of the query."""
    query: str = inputs.get("query", "")
    n = int(config.get("numQueries", 3))
    llm = _get_llm(config, llm_config)

    prompt = ChatPromptTemplate.from_messages([
        ("human", f"Generate {n} different phrasings of this question (one per line):\n{{query}}")
    ])
    chain = prompt | llm | StrOutputParser()
    raw = await chain.ainvoke({"query": query})
    variations = [q.strip() for q in raw.split("\n") if q.strip()]
    return {"query_list": [query] + variations[:n]}


async def handle_step_back_prompt(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Generate a more abstract 'step-back' question."""
    query: str = inputs.get("query", "")
    llm = _get_llm(config, llm_config)

    prompt = ChatPromptTemplate.from_messages([
        ("human", "Rephrase this as a more general, abstract question:\n{query}")
    ])
    chain = prompt | llm | StrOutputParser()
    abstract = await chain.ainvoke({"query": query})
    return {"query": abstract}


async def handle_query_rewriter(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Rewrite the query to be clearer and more retrieval-friendly."""
    query: str = inputs.get("query", "")
    style = config.get("rewriteStyle", "Rewrite this query to be clearer and more search-friendly")
    llm = _get_llm(config, llm_config)

    prompt = ChatPromptTemplate.from_messages([
        ("human", f"{style}:\n{{query}}")
    ])
    chain = prompt | llm | StrOutputParser()
    rewritten = await chain.ainvoke({"query": query})
    return {"query": rewritten.strip()}
