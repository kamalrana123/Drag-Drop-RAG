import os
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config import settings


class StorageBackend(ABC):
    @abstractmethod
    async def upload(self, key: str, file: UploadFile) -> str:
        """Save the file and return the storage key."""

    @abstractmethod
    async def get_local_path(self, key: str) -> str:
        """Return a local filesystem path suitable for reading the file."""

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Remove the file from storage."""


# ── Local Disk ────────────────────────────────────────────────────────────────

class LocalStorageBackend(StorageBackend):
    def __init__(self, base_dir: str = settings.upload_dir):
        self.base_dir = Path(base_dir)

    def _full_path(self, key: str) -> Path:
        return self.base_dir / key

    async def upload(self, key: str, file: UploadFile) -> str:
        dest = self._full_path(key)
        dest.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(dest, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                await f.write(chunk)
        return key

    async def get_local_path(self, key: str) -> str:
        return str(self._full_path(key))

    async def delete(self, key: str) -> None:
        path = self._full_path(key)
        if path.exists():
            path.unlink()


# ── AWS S3 ────────────────────────────────────────────────────────────────────

class S3StorageBackend(StorageBackend):
    def __init__(self):
        import boto3
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.s3_region,
        )
        self.bucket = settings.s3_bucket
        self._tmp_dir = Path("/tmp/rag_downloads")
        self._tmp_dir.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, file: UploadFile) -> str:
        content = await file.read()
        self.client.put_object(Bucket=self.bucket, Key=key, Body=content)
        return key

    async def get_local_path(self, key: str) -> str:
        local = self._tmp_dir / key.replace("/", "_")
        local.parent.mkdir(parents=True, exist_ok=True)
        self.client.download_file(self.bucket, key, str(local))
        return str(local)

    async def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)


# ── Azure Blob ────────────────────────────────────────────────────────────────

class AzureStorageBackend(StorageBackend):
    def __init__(self):
        from azure.storage.blob import BlobServiceClient
        self.client = BlobServiceClient.from_connection_string(
            settings.azure_connection_string
        )
        self.container = settings.azure_container
        self._tmp_dir = Path("/tmp/rag_downloads")
        self._tmp_dir.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, file: UploadFile) -> str:
        content = await file.read()
        blob = self.client.get_blob_client(container=self.container, blob=key)
        blob.upload_blob(content, overwrite=True)
        return key

    async def get_local_path(self, key: str) -> str:
        local = self._tmp_dir / key.replace("/", "_")
        blob = self.client.get_blob_client(container=self.container, blob=key)
        with open(local, "wb") as f:
            f.write(blob.download_blob().readall())
        return str(local)

    async def delete(self, key: str) -> None:
        blob = self.client.get_blob_client(container=self.container, blob=key)
        blob.delete_blob()


# ── Factory ───────────────────────────────────────────────────────────────────

def get_storage() -> StorageBackend:
    backend = settings.storage_backend.lower()
    if backend == "s3":
        return S3StorageBackend()
    if backend == "azure":
        return AzureStorageBackend()
    return LocalStorageBackend()


def make_storage_key(user_id: str, project_id: str, filename: str) -> str:
    """Generate a unique storage key for an uploaded file."""
    ext = Path(filename).suffix
    unique = str(uuid.uuid4())
    return f"{user_id}/{project_id}/{unique}{ext}"
