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
    code: str
    language: str


class Review(BaseModel):
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
        logger.warning("Configuration error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Analysis failed")
        raise HTTPException(
            status_code=500, detail="Analysis failed. Check logs.")
