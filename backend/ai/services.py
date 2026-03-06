import hashlib
import json
import logging
import os
from typing import Any

from ollama import Client

logger = logging.getLogger(__name__)

_CACHE: dict[str, dict[str, Any]] = {}
_CACHE_MAX_SIZE = 50


def _ensure_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    return [str(value)]


def _build_client() -> Client:
    host = os.getenv("OLLAMA_HOST")
    if not host:
        raise ValueError("OLLAMA_HOST is not set")
        
    return Client(host=host)


def _build_prompt(code: str, language: str) -> str:
    return (
        "You are a senior software engineer performing a professional code review.\n"
        "Analyze the following code and provide a detailed review.\n"
        "Return your answer strictly in JSON with the following structure:\n"
        "{\n"
        "  \"summary\": \"...\",\n"
        "  \"security_issues\": [\"...\"],\n"
        "  \"performance_issues\": [\"...\"],\n"
        "  \"style_issues\": [\"...\"],\n"
        "  \"suggestions\": [\"...\"]\n"
        "}\n"
        f"Language: {language}\n"
        "Code:\n"
        f"{code}\n"
    )


def _cache_key(code: str, language: str) -> str:
    h = hashlib.sha256(f"{language}:{code}".encode()).hexdigest()
    return h


def analyze_code(code: str, language: str) -> dict[str, Any]:
    """Analyze code via local Ollama model and return structured review data."""
    key = _cache_key(code, language)
    if key in _CACHE:
        logger.info("Cache hit for analysis")
        return _CACHE[key]

    client = _build_client()
    prompt = _build_prompt(code, language)

    options = {"temperature": 0.0}
    raw = client.generate(
        model="qwen2.5-coder", prompt=prompt, format="json", options=options
    )
    data = raw.response if hasattr(raw, "response") else raw
    try:
        parsed = json.loads(data) if isinstance(data, str) else data
    except json.JSONDecodeError as e:
        logger.error("Ollama returned invalid JSON: %s", e)
        raise ValueError("Model returned invalid JSON. Try again.") from e

    if not isinstance(parsed, dict):
        raise ValueError("Model response is not a JSON object.")

    result = {
        "summary": str(parsed.get("summary", "")),
        "security_issues": _ensure_list(parsed.get("security_issues")),
        "performance_issues": _ensure_list(parsed.get("performance_issues")),
        "style_issues": _ensure_list(parsed.get("style_issues")),
        "suggestions": _ensure_list(parsed.get("suggestions")),
    }

    if len(_CACHE) >= _CACHE_MAX_SIZE:
        _CACHE.pop(next(iter(_CACHE)))
    _CACHE[key] = result

    return result
