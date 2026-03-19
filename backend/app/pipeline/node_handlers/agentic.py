"""Agentic nodes: DocumentGrader, AnswerGrader, HallucinationChecker, QueryRouter."""
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.pipeline.llm_factory import build_chat_llm


def _get_llm(llm_config: dict):
    return build_chat_llm(
        provider=llm_config.get("chat_provider", "openai"),
        model=llm_config.get("chat_model", "gpt-4o"),
        api_keys=llm_config.get("api_keys", {}),
        temperature=0.0,
    )


async def handle_document_grader(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Grade each retrieved document for relevance to the query. Filter out irrelevant ones."""
    docs: list[Document] = inputs.get("retrieved_docs", [])
    query: str = inputs.get("query", "")
    if not docs or not query:
        return {"grade": {"score": "no_docs", "relevant_docs": []}}

    llm = _get_llm(llm_config)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Is the following document relevant to the question? Answer 'yes' or 'no'."),
        ("human", "Question: {question}\n\nDocument: {document}"),
    ])
    chain = prompt | llm | StrOutputParser()

    relevant = []
    for doc in docs:
        result = await chain.ainvoke({"question": query, "document": doc.page_content[:1000]})
        if "yes" in result.lower():
            relevant.append(doc)

    return {"grade": {"score": "graded", "relevant_docs": relevant, "original_count": len(docs)}}


async def handle_answer_grader(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Grade whether the answer adequately addresses the question."""
    answer: str = inputs.get("answer", "")
    query: str = inputs.get("query", "")

    llm = _get_llm(llm_config)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Does the following answer adequately address the question? Answer 'yes' or 'no' and explain briefly."),
        ("human", "Question: {question}\n\nAnswer: {answer}"),
    ])
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({"question": query, "answer": answer})
    score = "pass" if "yes" in result.lower() else "fail"
    return {"grade": {"score": score, "explanation": result, "answer": answer}}


async def handle_hallucination_checker(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Check if the answer is grounded in the retrieved documents."""
    answer: str = inputs.get("answer", "")
    docs: list[Document] = inputs.get("retrieved_docs", [])
    context = "\n\n".join(d.page_content for d in docs)

    llm = _get_llm(llm_config)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Is the following answer fully supported by the provided context? Answer 'yes' or 'no'."),
        ("human", "Context:\n{context}\n\nAnswer: {answer}"),
    ])
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({"context": context[:3000], "answer": answer})
    grounded = "yes" in result.lower()
    return {"grade": {"score": "grounded" if grounded else "hallucinated", "explanation": result}}


async def handle_query_router(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Simple keyword/regex-based query router."""
    import re
    query: str = inputs.get("query", "")
    routes: list[dict] = config.get("routes", [])  # [{ "label": "...", "keywords": ["..."] }]

    for route in routes:
        keywords = route.get("keywords", [])
        for kw in keywords:
            if re.search(kw, query, re.IGNORECASE):
                return {"query": query, "_chosen_route": route.get("label", "default")}

    return {"query": query, "_chosen_route": "default"}
