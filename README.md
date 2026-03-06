# AI Code Reviewer

AI Code Reviewer is a lightweight developer tool that analyzes source code using a locally running Large Language Model.  
The application provides an API that forwards code to an LLM (via Ollama) to automatically obtain feedback on code quality, security issues, and potential improvements.

## Project Goal

This project demonstrates a simple yet clean integration of AI-powered analysis into a developer pipeline.  
The focus is on a clear API architecture, structured AI responses, and the use of locally executed models.

## Core Features

- Source code analysis via REST API
- AI-powered code reviews
- Detection of potential security and performance issues
- Suggestions for improving code quality and structure
- Structured output of analysis results

## Technology Stack

- **Backend:** FastAPI
- **AI Runtime:** Ollama
- **Frontend:** React + TypeScript (Vite)
- **Models:** Local code LLMs (e.g. DeepSeek-Coder, CodeLlama, qwen2.5-coder)

## Architecture Overview

```plaintext
Frontend
|
v
FastAPI Backend
|
v
AI Service Layer
|
v
Ollama (Local LLM)
```

The API handles communication with the model, processes prompts, and provides analysis results in a structured format for the frontend.

## Docker

Requires Ollama running on the host (port 11434). The backend connects to it via `host.docker.internal`.

```bash
docker compose up --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000

To use a different host/port, set `OLLAMA_HOST` in the environment (e.g. in a `.env` file or docker-compose override).
