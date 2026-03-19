#!/bin/bash
# start.sh — Quick local dev startup (no Docker)
# Usage: bash start.sh

set -e

echo "==> Checking .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env from .env.example — fill in your API keys."
fi

echo "==> Installing dependencies..."
pip install -r requirements.txt --quiet

echo "==> Starting FastAPI server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
