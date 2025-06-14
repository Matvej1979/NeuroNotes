# server.py (FastAPI backend)
from fastapi import FastAPI, UploadFile
import spacy
from pydantic import BaseModel

app = FastAPI()
nlp = spacy.load("ru_core_news_sm")

class LectureRequest(BaseModel):
    text: str

@app.post("/generate-notes")
async def generate_notes(request: LectureRequest):
    doc = nlp(request.text)
    keywords = [token.text for token in doc if token.pos_ in ("NOUN", "PROPN")]
    return {"keywords": keywords, "summary": request.text[:200] + "..."}
