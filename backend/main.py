from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from dotenv import load_dotenv
from openai import OpenAI
import io
import os
import json

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise Exception("OPENAI_API_KEY not found. Check backend/.env file.")

client = OpenAI(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_pdf_text(file_bytes):
    pdf_reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

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
    resume_text = extract_pdf_text(contents)

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

@app.post("/generate-cover-letter")
async def generate_cover_letter(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are supported right now"}

    contents = await file.read()
    resume_text = extract_pdf_text(contents)

    prompt = f"""
Write a professional, concise cover letter for this job.

Rules:
- Do not invent fake experience.
- Use the resume information only.
- Make it tailored to the job description.
- Keep it under 350 words.
- Use a confident but natural tone.

Resume:
{resume_text[:6000]}

Job Description:
{job_description[:4000]}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are an expert career coach and cover letter writer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )

        cover_letter = response.choices[0].message.content

        return {
            "filename": file.filename,
            "cover_letter": cover_letter
        }

    except Exception as e:
        return {"error": str(e)}

@app.post("/rewrite-resume")
async def rewrite_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are supported right now"}

    contents = await file.read()
    resume_text = extract_pdf_text(contents)

    prompt = f"""
Rewrite and optimize this resume for the job description.

Rules:
- Do not invent fake companies, fake dates, fake degrees, or fake experience.
- Keep the rewritten content based only on the resume.
- Make it ATS-friendly.
- Use strong action verbs.
- Tailor wording to the job description.
- Improve clarity, impact, and keyword alignment.

Return ONLY valid JSON with these fields:
{{
  "optimized_summary": "string",
  "optimized_skills": ["string"],
  "optimized_bullets": ["string"],
  "ats_keywords_to_add": ["string"]
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
                {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        ai_text = response.choices[0].message.content
        rewrite_result = json.loads(ai_text)

        return {
            "filename": file.filename,
            **rewrite_result
        }

    except Exception as e:
        return {"error": str(e)}