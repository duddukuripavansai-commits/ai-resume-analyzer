# AI Resume Analyzer

AI-powered full-stack web application that compares resumes with job descriptions using LLMs, provides AI match analysis, generates cover letters, rewrites resumes, and exports PDF reports.

## Live Demo

Frontend: https://ai-resume-analyzer-omega-five.vercel.app  
Backend API: https://ai-resume-analyzer-efrt.onrender.com

## Features

- AI resume-job match analysis
- AI match score
- Strong matches and missing skills
- AI cover letter generator
- AI resume rewrite suggestions
- PDF report download
- React frontend deployed on Vercel
- FastAPI backend deployed on Render
- OpenAI API integration

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios
- jsPDF

**Backend**
- Python
- FastAPI
- Uvicorn
- PyPDF
- OpenAI API
- Render

## How It Works

1. Upload a PDF resume.
2. Paste a job description.
3. The backend extracts resume text.
4. OpenAI analyzes the resume against the job description.
5. The frontend displays:
   - AI match score
   - Strong matches
   - Missing skills
   - Resume improvements
   - Cover letter
   - Resume rewrite
6. User can download the analysis as a PDF report.

## Project Structure

```text
ai-resume-analyzer/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── screenshots/
├── README.md
└── render.yaml