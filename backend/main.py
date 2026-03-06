from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from ai.services import analyze_code

load_dotenv()

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


@app.post("/analyze/", response_model=Review)
async def analyze(analyze: Analyze):
    """Analyze code via local Ollama model and return a structured review."""
    data = analyze_code(analyze.code, analyze.language)
    return Review(**data)
