from fastapi import FastAPI, UploadFile, File, Form
from pypdf import PdfReader
import io
import re

app = FastAPI()

stop_words = {
    "the", "and", "to", "a", "of", "in", "with", "for", "or", "as",
    "this", "our", "you", "will", "at", "on", "by", "is", "are", "be",
    "an", "we", "your", "from", "that", "it", "into", "across"
}

def clean_words(text):
    words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.-]*\b", text.lower())
    return set(word for word in words if word not in stop_words and len(word) > 2)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Resume Analyzer backend is running"}

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    contents = await file.read()
    pdf_reader = PdfReader(io.BytesIO(contents))

    resume_text = ""
    for page in pdf_reader.pages:
        resume_text += page.extract_text() or ""

    jd_words = clean_words(job_description)
    resume_words = clean_words(resume_text)

    matched_keywords = sorted(list(jd_words.intersection(resume_words)))
    missing_keywords = sorted(list(jd_words.difference(resume_words)))

    match_score = round((len(matched_keywords) / max(len(jd_words), 1)) * 100, 2)

    return {
        "filename": file.filename,
        "match_score": match_score,
        "matched_keywords": matched_keywords[:40],
        "missing_keywords": missing_keywords[:40],
        "resume_preview": resume_text[:500]
    }