"""Source nodes: FileSource, WebSource, S3Source."""
from typing import Any

from langchain_core.documents import Document

from app.core.storage import get_storage


async def handle_file_source(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Load documents from storage using storage_keys stored in config or passed as doc IDs."""
    from langchain_community.document_loaders import (
        PyPDFLoader, TextLoader, UnstructuredFileLoader,
    )
    import os

    storage_keys: list[str] = config.get("storageKeys", [])
    if not storage_keys:
        return {"raw_documents": []}

    storage = get_storage()
    docs: list[Document] = []

    for key in storage_keys:
        local_path = await storage.get_local_path(key)
        ext = os.path.splitext(local_path)[1].lower()
        try:
            if ext == ".pdf":
                loader = PyPDFLoader(local_path)
            elif ext in (".txt", ".md"):
                loader = TextLoader(local_path, encoding="utf-8")
            else:
                loader = UnstructuredFileLoader(local_path)
            docs.extend(loader.load())
        except Exception as e:
            docs.append(Document(
                page_content=f"[Error loading {key}: {e}]",
                metadata={"source": key, "error": str(e)},
            ))

    return {"raw_documents": docs}


async def handle_web_source(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Scrape one or more URLs."""
    from langchain_community.document_loaders import WebBaseLoader

    urls: list[str] = config.get("urls", [])
    if not urls:
        return {"raw_documents": []}

    loader = WebBaseLoader(urls)
    docs = loader.load()
    return {"raw_documents": docs}


async def handle_s3_source(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Load documents from an S3 bucket prefix."""
    from langchain_community.document_loaders import S3FileLoader
    import boto3

    bucket = config.get("bucket", "")
    prefix = config.get("prefix", "")
    if not bucket:
        return {"raw_documents": []}

    s3 = boto3.client("s3")
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    keys = [obj["Key"] for obj in response.get("Contents", [])]

    docs: list[Document] = []
    for key in keys:
        loader = S3FileLoader(bucket, key)
        docs.extend(loader.load())

    return {"raw_documents": docs}
