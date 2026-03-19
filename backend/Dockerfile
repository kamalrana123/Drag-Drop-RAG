FROM python:3.11-slim

WORKDIR /app

# Copy uv from its official image — no pip install needed, no version bloat
COPY --from=ghcr.io/astral-sh/uv:0.6 /uv /usr/local/bin/uv

# uv settings: compile .pyc at build time (faster cold starts), use copy mode for Docker layers
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

# System deps for document processing (build-essential removed — uv uses pre-built wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmagic1 \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Separate COPY so this layer is cached until requirements.txt changes
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# Application code
COPY . .

RUN mkdir -p /app/uploads /app/chroma_db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
