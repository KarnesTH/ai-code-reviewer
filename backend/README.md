## AI Code Reviewer Backend

This backend provides a simple FastAPI service that accepts source code and forwards it directly to a local Ollama model for automated code review.

### Features

- `/` health check endpoint.
- `/analyze/` endpoint that accepts source code and language and returns a structured JSON review.
- Direct integration with an Ollama model (default: `qwen2.5-coder`) via the official Python client.

### Requirements

- Python 3.10 or newer.
- A running Ollama instance accessible from the backend.

### Configuration

Create a `.env` file in the backend directory with at least one of:

- `OLLAMA_HOST=http://localhost:11434`

### Installation

```bash
uv sync
```

### Running the API

```bash
uv run fastapi dev
```

This will start the FastAPI development server. Adjust the command according to your environment if you are not using `uv`.

### Example Request

```bash
curl -X POST "http://localhost:8000/analyze/" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b",
    "language": "python"
  }'
```
