import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

const API_BASE_URL = "https://ai-resume-analyzer-efrt.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [rewrite, setRewrite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);
    return formData;
  };

  const validateInputs = () => {
    if (!file) {
      alert("Please upload a PDF resume.");
      return false;
    }
    if (!jobDescription.trim()) {
      alert("Please paste the job description.");
      return false;
    }
    return true;
  };

  const analyzeResume = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        `${API_BASE_URL}/analyze-resume`,
        buildFormData()
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({
        error:
          error.response?.data?.error ||
          "Backend error while analyzing resume.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!validateInputs()) return;

    try {
      setCoverLoading(true);
      setCoverLetter("");

      const response = await axios.post(
        `${API_BASE_URL}/generate-cover-letter`,
        buildFormData()
      );

      if (response.data.error) {
        setCoverLetter(`Error: ${response.data.error}`);
      } else {
        setCoverLetter(response.data.cover_letter);
      }
    } catch (error) {
      console.error(error);
      setCoverLetter("Error: Backend error while generating cover letter.");
    } finally {
      setCoverLoading(false);
    }
  };

  const rewriteResume = async () => {
    if (!validateInputs()) return;

    try {
      setRewriteLoading(true);
      setRewrite(null);

      const response = await axios.post(
        `${API_BASE_URL}/rewrite-resume`,
        buildFormData()
      );

      setRewrite(response.data);
    } catch (error) {
      console.error(error);
      setRewrite({
        error: "Backend error while rewriting resume.",
      });
    } finally {
      setRewriteLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result || result.error) {
      alert("Please generate a valid analysis first.");
      return;
    }

    const doc = new jsPDF();
    let y = 15;

    const addText = (title, content) => {
      doc.setFontSize(14);
      doc.text(title, 10, y);
      y += 8;

      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content || "", 180);
      doc.text(lines, 10, y);
      y += lines.length * 6 + 8;

      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    };

    doc.setFontSize(18);
    doc.text("AI Resume Analysis Report", 10, y);
    y += 12;

    addText("Match Score", `${result.match_score}%`);
    addText("Overall Summary", result.overall_summary);
    addText("Strong Matches", result.strong_matches?.map((i) => `• ${i}`).join("\n"));
    addText("Missing Skills", result.missing_skills?.map((i) => `• ${i}`).join("\n"));
    addText("Resume Improvements", result.resume_improvements?.map((i) => `• ${i}`).join("\n"));
    addText("Interview Questions", result.interview_questions?.map((i) => `• ${i}`).join("\n"));

    if (coverLetter && !coverLetter.startsWith("Error:")) {
      addText("Generated Cover Letter", coverLetter);
    }

    if (rewrite && !rewrite.error) {
      addText("Optimized Summary", rewrite.optimized_summary);
      addText("Optimized Skills", rewrite.optimized_skills?.map((i) => `• ${i}`).join("\n"));
      addText("Optimized Bullets", rewrite.optimized_bullets?.map((i) => `• ${i}`).join("\n"));
      addText("ATS Keywords to Add", rewrite.ats_keywords_to_add?.map((i) => `• ${i}`).join("\n"));
    }

    doc.save("AI_Resume_Analysis_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🤖 AI Resume Analyzer
        </h1>

        <label className="font-semibold">Upload Resume (PDF)</label>
        <input
          className="border w-full mt-2 p-3 rounded-lg mb-5"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label className="font-semibold">Job Description</label>
        <textarea
          rows="12"
          className="border w-full mt-2 p-3 rounded-lg"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
        />

        <div className="grid grid-cols-4 gap-4 mt-6">
          <button onClick={analyzeResume} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          <button onClick={generateCoverLetter} className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            {coverLoading ? "Generating..." : "Cover Letter"}
          </button>

          <button onClick={rewriteResume} className="bg-orange-600 text-white px-6 py-3 rounded-lg">
            {rewriteLoading ? "Rewriting..." : "Rewrite Resume"}
          </button>

          <button onClick={downloadReport} className="bg-green-600 text-white px-6 py-3 rounded-lg">
            Download PDF
          </button>
        </div>

        {result && (
          <div className="mt-10">
            {result.error ? (
              <div className="bg-red-100 text-red-700 rounded-lg p-5">
                <h2 className="text-xl font-bold">Backend Error</h2>
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-green-100 rounded-lg p-5">
                  <h2 className="text-2xl font-bold">AI Match Score</h2>
                  <h1 className="text-5xl text-green-700 mt-3">
                    {result.match_score}%
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-6">
                  <div className="bg-white border rounded-lg p-5 shadow">
                    <h2 className="text-xl font-bold mb-3">Strong Matches</h2>
                    <ul className="list-disc pl-5">
                      {result.strong_matches?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border rounded-lg p-5 shadow">
                    <h2 className="text-xl font-bold mb-3">Missing Skills</h2>
                    <ul className="list-disc pl-5">
                      {result.missing_skills?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-5 mt-6">
                  <h2 className="text-xl font-bold">Overall Summary</h2>
                  <p className="mt-3">{result.overall_summary}</p>
                </div>
              </>
            )}
          </div>
        )}

        {coverLetter && (
          <div className="bg-white border rounded-lg p-5 shadow mt-8">
            <h2 className="text-2xl font-bold mb-4">Generated Cover Letter</h2>
            <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
          </div>
        )}

        {rewrite && (
          <div className="bg-white border rounded-lg p-5 shadow mt-8">
            {rewrite.error ? (
              <p className="text-red-700 font-bold">{rewrite.error}</p>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Optimized Resume Content</h2>

                <h3 className="font-bold">Optimized Summary</h3>
                <p className="mb-4">{rewrite.optimized_summary}</p>

                <h3 className="font-bold">Optimized Skills</h3>
                <ul className="list-disc pl-5 mb-4">
                  {rewrite.optimized_skills?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="font-bold">Optimized Bullets</h3>
                <ul className="list-disc pl-5 mb-4">
                  {rewrite.optimized_bullets?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="font-bold">ATS Keywords to Add</h3>
                <ul className="list-disc pl-5">
                  {rewrite.ats_keywords_to_add?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}