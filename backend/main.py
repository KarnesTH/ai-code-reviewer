import logging
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ai.services import analyze_code

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI()


class Analyze(BaseModel):
    """Analyze code via local Ollama model and return a structured review."""
    code: str
    language: str


class Review(BaseModel):
    """A structured review of the code."""
    summary: str
    security_issues: List[str]
    performance_issues: List[str]
    style_issues: List[str]
    suggestions: List[str]


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "API is running"}


@app.post("/analyse/", response_model=Review)
async def analyze(analyze: Analyze):
    """Analyze code via local Ollama model and return a structured review."""
    try:
        logger.info("Analysis request: language=%s, code_length=%d",
                    analyze.language, len(analyze.code))
        data = analyze_code(analyze.code, analyze.language)
        return Review(**data)
    except ValueError as e:
        logger.warning("Analysis error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Analysis failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=str(e) if str(e) else "Analysis failed. Check logs.",
        )
