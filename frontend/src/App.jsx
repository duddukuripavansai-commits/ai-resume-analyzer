import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

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
        "http://127.0.0.1:8000/analyze-resume",
        buildFormData()
      );

      setResult(response.data);
    } catch (err) {
      alert("Backend error while analyzing resume.");
      console.log(err);
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
        "http://127.0.0.1:8000/generate-cover-letter",
        buildFormData()
      );

      if (response.data.error) {
        alert(response.data.error);
      } else {
        setCoverLetter(response.data.cover_letter);
      }
    } catch (err) {
      alert("Backend error while generating cover letter.");
      console.log(err);
    } finally {
      setCoverLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          🤖 AI Resume Analyzer
        </h1>

        <div className="mb-5">
          <label className="font-semibold">Upload Resume (PDF)</label>
          <input
            className="border w-full mt-2 p-3 rounded-lg"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div>
          <label className="font-semibold">Job Description</label>
          <textarea
            rows="12"
            className="border w-full mt-2 p-3 rounded-lg"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={analyzeResume}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          <button
            onClick={generateCoverLetter}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            {coverLoading ? "Generating..." : "Generate Cover Letter"}
          </button>
        </div>

        {result && (
          <div className="mt-10">
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

            <div className="bg-white shadow rounded-lg p-5 mt-6">
              <h2 className="text-xl font-bold">Resume Improvements</h2>
              <ul className="list-disc pl-5 mt-3">
                {result.resume_improvements?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white shadow rounded-lg p-5 mt-6">
              <h2 className="text-xl font-bold">Interview Questions</h2>
              <ul className="list-disc pl-5 mt-3">
                {result.interview_questions?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {coverLetter && (
          <div className="bg-white border rounded-lg p-5 shadow mt-8">
            <h2 className="text-2xl font-bold mb-4">Generated Cover Letter</h2>
            <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
          </div>
        )}
      </div>
    </div>
  );
}