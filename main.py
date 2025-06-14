# main.py
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import time
from typing import List, Optional
import uuid
import os

# Настройка логгера
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Auto Lecture Notes Generator")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LectureRequest(BaseModel):
    text: str
    format: str = "pdf"  # pdf | html | md
    theme: str = "light"  # light | dark

class LectureResponse(BaseModel):
    id: str
    status: str
    download_url: Optional[str] = None

# Глобальный "кэш" для демонстрации (в продакшене — Redis)
notes_cache = {}

@app.post("/api/generate", response_model=LectureResponse)
async def generate_notes(request: LectureRequest):
    try:
        note_id = str(uuid.uuid4())
        notes_cache[note_id] = {"status": "processing", "text": request.text}
        
        # Асинхронная обработка
        generate_task(note_id, request.text, request.format)
        
        return LectureResponse(
            id=note_id,
            status="started",
            download_url=f"/api/download/{note_id}"
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_task(note_id: str, text: str, format: str):
    """Фоновая задача для генерации конспекта."""
    time.sleep(2)  # Имитация обработки
    notes_cache[note_id]["status"] = "completed"
    notes_cache[note_id]["download_url"] = f"/downloads/{note_id}.{format}"

@app.get("/api/status/{note_id}", response_model=LectureResponse)
async def check_status(note_id: str):
    if note_id not in notes_cache:
        raise HTTPException(status_code=404, detail="Note not found")
    return notes_cache[note_id]

@app.get("/api/download/{note_id}")
async def download_note(note_id: str):
    if note_id not in notes_cache or notes_cache[note_id]["status"] != "completed":
        raise HTTPException(status_code=404, detail="Note not ready")
    return {"url": notes_cache[note_id]["download_url"]}
