from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    filename: str
    mime_type: str | None
    size_bytes: int
    status: str
    error_msg: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    error_msg: str | None

    model_config = {"from_attributes": True}
