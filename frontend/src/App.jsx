import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {
    if (!file) {
      alert("Please upload a PDF resume.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste a job description.");
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

      console.log(response.data);

      setResult(response.data);
    } catch (error) {
      console.error(error);

      if (error.response) {
        setResult({
          error:
            error.response.data.error ||
            "Backend returned an error.",
        });
      } else {
        setResult({
          error:
            "Cannot connect to backend. Make sure FastAPI is running.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        fontFamily: "Arial",
      }}
    >
      <h1>🤖 AI Resume Analyzer</h1>

      <p>Upload your resume and paste the job description.</p>

      <hr />

      <h3>Resume PDF</h3>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <h3>Job Description</h3>

      <textarea
        rows="10"
        style={{ width: "100%", padding: "10px" }}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste Job Description..."
      />

      <br />
      <br />

      <button
        onClick={analyzeResume}
        style={{
          padding: "12px 30px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Analysis Result</h2>

          {result.error ? (
            <p style={{ color: "red" }}>
              <strong>{result.error}</strong>
            </p>
          ) : (
            <>
              <h3>ATS Match Score</h3>

              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {result.match_score}%
              </p>

              <hr />

              <h3>Matched Keywords</h3>

              <ul>
                {result.matched_keywords?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <hr />

              <h3>Missing Keywords</h3>

              <ul>
                {result.missing_keywords?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <hr />

              <h3>Resume Preview</h3>

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "#f4f4f4",
                  padding: "15px",
                  borderRadius: "5px",
                }}
              >
                {result.resume_preview}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;