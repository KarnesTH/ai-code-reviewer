# AI Code Reviewer

AI Code Reviewer ist ein leichtgewichtiges Developer-Tool, das Quellcode mithilfe eines lokal laufenden Large Language Models analysiert.  
Die Anwendung stellt eine API bereit, über die Code an ein LLM (über Ollama) übergeben wird, um automatisch Hinweise zu Codequalität, Sicherheitsproblemen und möglichen Verbesserungen zu erhalten.

## Ziel des Projekts

Dieses Projekt demonstriert eine einfache, aber saubere Integration von AI-gestützter Analyse in eine Entwickler-Pipeline.  
Der Fokus liegt auf einer klaren API-Architektur, strukturierten AI-Antworten und der Nutzung lokal ausgeführter Modelle.

## Kernfunktionen

- Analyse von Quellcode über eine REST API
- AI-gestützte Code Reviews
- Erkennung möglicher Sicherheits- und Performanceprobleme
- Vorschläge zur Verbesserung von Codequalität und Struktur
- Strukturierte Ausgabe der Analyseergebnisse

## Technologie-Stack

- **Backend:** FastAPI  
- **AI Runtime:** Ollama  
- **Frontend:** React + TypeScript (Vite)  
- **Modelle:** lokale Code-LLMs (z. B. DeepSeek-Coder, CodeLlama)

## Architekturüberblick

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

Die API übernimmt die Kommunikation mit dem Modell, verarbeitet Prompts und stellt die Analyseergebnisse strukturiert für das Frontend bereit.