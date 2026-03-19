"""Extraction nodes: DocumentExtraction, OCRProcessor, MarkdownConverter."""
from langchain_core.documents import Document


async def handle_document_extraction(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Use Unstructured to extract text from raw documents."""
    from langchain_community.document_loaders import UnstructuredFileLoader
    import tempfile, os

    raw_docs: list[Document] = inputs.get("raw_documents", [])
    extracted: list[Document] = []

    for doc in raw_docs:
        source = doc.metadata.get("source", "")
        if source and os.path.exists(source):
            try:
                loader = UnstructuredFileLoader(source, mode="elements")
                extracted.extend(loader.load())
            except Exception:
                extracted.append(doc)
        else:
            extracted.append(doc)

    return {"raw_documents": extracted}


async def handle_ocr_processor(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Run OCR on image-based documents using pytesseract."""
    import pytesseract
    from PIL import Image

    raw_docs: list[Document] = inputs.get("raw_documents", [])
    processed: list[Document] = []

    for doc in raw_docs:
        source = doc.metadata.get("source", "")
        if source and source.lower().endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")):
            try:
                text = pytesseract.image_to_string(Image.open(source))
                processed.append(Document(
                    page_content=text,
                    metadata={**doc.metadata, "ocr": True},
                ))
            except Exception:
                processed.append(doc)
        else:
            processed.append(doc)

    return {"raw_documents": processed}


async def handle_markdown_converter(config: dict, inputs: dict, llm_config: dict, project_id: str) -> dict:
    """Convert HTML content to Markdown."""
    from markdownify import markdownify as md

    raw_docs: list[Document] = inputs.get("raw_documents", [])
    converted = [
        Document(
            page_content=md(doc.page_content),
            metadata=doc.metadata,
        )
        for doc in raw_docs
    ]
    return {"raw_documents": converted}
