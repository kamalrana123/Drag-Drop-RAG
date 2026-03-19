"""Build LangChain LLM and embedding objects from provider configuration."""
from typing import Any


def build_chat_llm(
    provider: str,
    model: str,
    api_keys: dict,
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> Any:
    provider = provider.lower()

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model,
            api_key=api_keys.get("OPENAI_API_KEY", ""),
            temperature=temperature,
            max_tokens=max_tokens,
        )

    if provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_keys.get("GOOGLE_API_KEY", ""),
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=model,
            api_key=api_keys.get("ANTHROPIC_API_KEY", ""),
            temperature=temperature,
            max_tokens=max_tokens,
        )

    if provider == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(
            model=model,
            temperature=temperature,
        )

    if provider == "cohere":
        from langchain_cohere import ChatCohere
        return ChatCohere(
            model=model,
            cohere_api_key=api_keys.get("COHERE_API_KEY", ""),
            temperature=temperature,
        )

    if provider == "mistral":
        from langchain_mistralai import ChatMistralAI
        return ChatMistralAI(
            model=model,
            mistral_api_key=api_keys.get("MISTRAL_API_KEY", ""),
            temperature=temperature,
        )

    raise ValueError(f"Unsupported chat provider: {provider}")


def build_embedding(
    provider: str,
    model: str,
    api_keys: dict,
) -> Any:
    provider = provider.lower()

    if provider == "openai":
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(
            model=model,
            api_key=api_keys.get("OPENAI_API_KEY", ""),
        )

    if provider == "google":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(
            model=model,
            google_api_key=api_keys.get("GOOGLE_API_KEY", ""),
        )

    if provider == "cohere":
        from langchain_cohere import CohereEmbeddings
        return CohereEmbeddings(
            model=model,
            cohere_api_key=api_keys.get("COHERE_API_KEY", ""),
        )

    if provider == "huggingface":
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name=model)

    if provider == "ollama":
        from langchain_ollama import OllamaEmbeddings
        return OllamaEmbeddings(model=model)

    raise ValueError(f"Unsupported embedding provider: {provider}")
