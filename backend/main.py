from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from dotenv import load_dotenv
from openai import OpenAI
import io
import os
import json

from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise Exception(
        "OPENAI_API_KEY not found. Make sure you have a .env file in the backend folder."
    )

print("✅ API Key Loaded:", api_key[:10] + "...")

client = OpenAI(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Resume Analyzer backend is running"}

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are supported right now"}

    contents = await file.read()
    pdf_reader = PdfReader(io.BytesIO(contents))

    resume_text = ""
    for page in pdf_reader.pages:
        resume_text += page.extract_text() or ""

    prompt = f"""
Analyze this resume against the job description.

Return ONLY valid JSON with these fields:
{{
  "match_score": number,
  "overall_summary": "string",
  "strong_matches": ["string"],
  "missing_skills": ["string"],
  "resume_improvements": ["string"],
  "interview_questions": ["string"]
}}

Resume:
{resume_text[:6000]}

Job Description:
{job_description[:4000]}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are an expert ATS resume analyst."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        ai_text = response.choices[0].message.content
        ai_result = json.loads(ai_text)

        return {
            "filename": file.filename,
            "resume_preview": resume_text[:500],
            **ai_result
        }

    except Exception as e:
        return {"error": str(e)}