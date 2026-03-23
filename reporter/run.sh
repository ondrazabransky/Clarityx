#!/usr/bin/env bash
# Start the AI Czech SQL Reporter
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ERROR: ANTHROPIC_API_KEY environment variable is not set."
  echo "Export it before running: export ANTHROPIC_API_KEY=your_key_here"
  exit 1
fi

echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Starting AI Czech SQL Reporter on http://localhost:8000"
echo "Open http://localhost:8000 in your browser"
echo ""

uvicorn app:app --host 0.0.0.0 --port 8000 --reload
