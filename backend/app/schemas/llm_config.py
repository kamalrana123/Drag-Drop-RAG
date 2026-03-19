from pydantic import BaseModel


class LLMConfigSchema(BaseModel):
    chat_provider: str = "openai"
    chat_model: str = "gpt-4o"
    embedding_provider: str = "openai"
    embedding_model: str = "text-embedding-3-small"
    temperature: float = 0.7
    max_tokens: int = 2048
    # Plain-text API keys (accepted on write, never returned on read)
    api_keys: dict[str, str] | None = None

    model_config = {"from_attributes": True}


class LLMConfigResponse(BaseModel):
    chat_provider: str
    chat_model: str
    embedding_provider: str
    embedding_model: str
    temperature: float
    max_tokens: int
    # We never expose raw keys — just which ones are set
    configured_keys: list[str] = []

    model_config = {"from_attributes": True}
