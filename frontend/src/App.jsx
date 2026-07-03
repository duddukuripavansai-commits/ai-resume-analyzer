import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!file) {
      alert("Upload PDF resume");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Paste job description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        "http://127.0.0.1:8000/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({
        error: "Something went wrong. Check backend terminal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>🤖 AI Resume Analyzer</h1>
      <p>Upload your resume and paste a job description.</p>

      <h3>Resume PDF</h3>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <h3>Job Description</h3>
      <textarea
        rows="10"
        style={{ width: "100%", padding: "10px" }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
      />

      <br />
      <br />

      <button
        onClick={analyzeResume}
        disabled={loading}
        style={{ padding: "12px 30px", fontSize: "18px", cursor: "pointer" }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc" }}>
          {result.error ? (
            <h3 style={{ color: "red" }}>{result.error}</h3>
          ) : (
            <>
              <h2>AI Analysis Result</h2>

              <h3>Match Score: {result.match_score}%</h3>

              <h3>Overall Summary</h3>
              <p>{result.overall_summary}</p>

              <h3>Strong Matches</h3>
              <ul>
                {result.strong_matches?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3>Missing Skills</h3>
              <ul>
                {result.missing_skills?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3>Resume Improvements</h3>
              <ul>
                {result.resume_improvements?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3>Interview Questions</h3>
              <ul>
                {result.interview_questions?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;