"""Output nodes: StreamingResponse, CitationGenerator."""
from langchain_core.documents import Document


async def handle_streaming_response(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Passthrough node — actual streaming is handled by the executor's stream path."""
    docs: list[Document] = inputs.get("ranked_docs", inputs.get("retrieved_docs", []))
    query: str = inputs.get("query", "")
    from app.pipeline.llm_factory import build_chat_llm
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser

    context = "\n\n".join(d.page_content for d in docs)
    llm = build_chat_llm(
        provider=llm_config.get("chat_provider", "openai"),
        model=llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=float(config.get("temperature", 0.7)),
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer based on the context."),
        ("human", "Context:\n{context}\n\nQuestion: {question}"),
    ])
    chain = prompt | llm | StrOutputParser()
    answer = await chain.ainvoke({"context": context, "question": query})
    return {"answer": answer}


async def handle_citation_generator(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Append inline source citations to the answer."""
    answer: str = inputs.get("answer", "")
    docs: list[Document] = inputs.get("retrieved_docs", [])

    citations = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", f"Source {i}")
        page = doc.metadata.get("page", "")
        ref = f"[{i}] {source}" + (f", page {page}" if page else "")
        citations.append(ref)

    if citations:
        answer = answer.rstrip() + "\n\n**Sources:**\n" + "\n".join(citations)

    return {"answer": answer}
