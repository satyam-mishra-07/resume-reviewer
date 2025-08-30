import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../utils/axiosInstance";

export default function Review({ isLoading, setIsLoading }) {
  const [inputType, setInputType] = useState("text");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const [formData, setFormData] = useState({
    jd: "",
    resume: null,
    targetRole: "",
    experienceLevel: "Fresher",
  });

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 5 * 1024 * 1024
    ) {
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }));
      toast.success(`PDF selected: ${file.name}`);
    } else {
      toast.error("Please select a PDF file under 5MB");
      e.target.value = "";
    }
  };

  const handleResumeTextChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      resume: e.target.value,
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setFormData((prev) => ({
          ...prev,
          resume: file,
        }));
        toast.success(`PDF uploaded: ${file.name}`);
      } else {
        toast.error("Please drop a PDF file under 5MB");
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setFormData((prev) => ({
      ...prev,
      resume: type === "upload" ? null : "",
    }));
  };

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jd.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    if (!formData.resume) {
      toast.error("Please provide your resume");
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("jd", formData.jd.trim());

      if (inputType === "upload" && formData.resume instanceof File) {
        dataToSend.append("resume", formData.resume);
      } else {
        dataToSend.append("resume", formData.resume.trim());
      }

      const response = await axiosInstance.post(
        "/api/review/analyze",
        dataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Axios automatically parses JSON
      const data = response.data;

      setAnalysis(data.analysis);
      setShowResults(true);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);

      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong during analysis");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    setFormData({
      jd: `We are looking for a Frontend Developer with 2+ years of experience in React.js, JavaScript, HTML, CSS, and modern web development practices. Experience with TypeScript, Node.js, and AWS is a plus.`,
      resume: `John Doe
Frontend Developer
Email: john@example.com

Experience:
- Developed web applications using React and JavaScript
- Worked with HTML, CSS, and Git
- Collaborated with team members

Skills: React, JavaScript, HTML, CSS, Git`,
      targetRole: "Frontend Developer",
      experienceLevel: "2-5 years",
    });
    setInputType("text");
    setShowResults(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getSummaryText = () => {
    if (!analysis) return "";

    return `Resume Analysis Results:
ATS Score: ${analysis.atsScore}/100

Matched Keywords: ${analysis.matchedKeywords?.join(", ") || "None"}

Missing Keywords: ${analysis.missingKeywords?.join(", ") || "None"}

Key Suggestions:
${analysis.keywordSuggestions?.join("\n") || "No suggestions available"}

Improved Bullets:
${
  analysis.improvedBullets?.join("\n\n") || "No bullet improvements available"
}`;
  };

  return (
    <div id="review-page" className="page active">
      <div className="container">
        <div className="review-layout">
          <div className="input-panel">
            <div className="card">
              <div className="card__body">
                <h2>Get Your Resume Reviewed</h2>
                <form onSubmit={handleSubmit} className="review-form">
                  {/* Resume Section */}
                  <div className="input-section">
                    <h3>Resume</h3>
                    <div className="input-toggle">
                      <button
                        type="button"
                        className={`toggle-btn ${
                          inputType === "upload" ? "toggle-btn--active" : ""
                        }`}
                        onClick={() => handleInputTypeChange("upload")}
                      >
                        Upload PDF
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn ${
                          inputType === "text" ? "toggle-btn--active" : ""
                        }`}
                        onClick={() => handleInputTypeChange("text")}
                      >
                        Paste Text
                      </button>
                    </div>

                    {/* Upload Zone */}
                    {inputType === "upload" && (
                      <div
                        className="upload-zone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleBrowseClick}
                      >
                        <div className="upload-content">
                          <div className="upload-icon">📄</div>
                          {formData.resume &&
                          formData.resume instanceof File ? (
                            <p className="upload-text">
                              Selected: {formData.resume.name}
                            </p>
                          ) : (
                            <>
                              <p className="upload-text">
                                Drag & drop your resume here, or{" "}
                                <button type="button" className="upload-link">
                                  browse files
                                </button>
                              </p>
                              <p className="upload-note">
                                PDF files only, max 5MB
                              </p>
                            </>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* Text Input */}
                    {inputType === "text" && (
                      <div className="text-input">
                        <textarea
                          className="form-control"
                          rows="8"
                          placeholder="Paste your resume text here..."
                          value={formData.resume || ""}
                          onChange={handleResumeTextChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Job Description Section */}
                  <div className="input-section">
                    <h3>Job Description</h3>
                    <textarea
                      className="form-control"
                      name="jd"
                      rows="6"
                      placeholder="Paste the job description here..."
                      value={formData.jd}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Advanced Options */}
                  <div className="options-accordion">
                    <button
                      type="button"
                      className="accordion-toggle"
                      onClick={toggleAccordion}
                      aria-expanded={isAccordionOpen}
                    >
                      Advanced Options
                      <span
                        className={`accordion-icon ${
                          isAccordionOpen ? "rotated" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {isAccordionOpen && (
                      <div className="accordion-content">
                        <div className="form-group">
                          <label className="form-label">Target Role</label>
                          <input
                            type="text"
                            className="form-control"
                            name="targetRole"
                            placeholder="e.g., Frontend Developer"
                            value={formData.targetRole}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Experience Level</label>
                          <select
                            className="form-control"
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleInputChange}
                          >
                            <option>Fresher</option>
                            <option>0-1 years</option>
                            <option>1-2 years</option>
                            <option>2-5 years</option>
                            <option>5+ years</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn--primary btn--full-width"
                      disabled={isLoading}
                    >
                      {isLoading ? "Analyzing..." : "Analyze Resume"}
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--full-width"
                      onClick={handleSampleData}
                    >
                      Use Sample Resume & JD
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Results Panel - Keep your existing results display code */}
          <div className="results-panel">
            {!showResults ? (
              <div className="results-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">📊</div>
                  <h3>Upload your resume to get started</h3>
                  <p>Your detailed analysis will appear here</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="results-content">
                {/* Results Panel - COMPLETE RESULTS DISPLAY */}
                <div className="results-panel">
                  {!showResults ? (
                    <div className="results-placeholder">
                      <div className="placeholder-content">
                        <div className="placeholder-icon">📊</div>
                        <h3>Upload your resume to get started</h3>
                        <p>Your detailed analysis will appear here</p>
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="results-content">
                      {/* Summary Card */}
                      <div className="card result-card">
                        <div className="card__body">
                          <div className="result-header">
                            <h3>Analysis Summary</h3>
                            <div className="score-display">
                              <div className="score-badge score-badge--large">
                                {analysis.atsScore}
                              </div>
                              <span className="score-label">ATS Score</span>
                            </div>
                          </div>
                          <div className="quick-tips">
                            <h4>Quick Tips</h4>
                            <ul className="tips-list">
                              {analysis.keywordSuggestions
                                ?.slice(0, 3)
                                .map((tip, i) => <li key={i}>{tip}</li>) || (
                                <li>No specific tips available</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Keywords Card */}
                      <div className="card result-card">
                        <div className="card__body">
                          <h3>Keywords Analysis</h3>
                          <div className="keywords-section">
                            <h4 className="keywords-title">
                              Matched Keywords (
                              {analysis.matchedKeywords?.length || 0})
                            </h4>
                            <div className="keywords-list">
                              {analysis.matchedKeywords?.length > 0 ? (
                                analysis.matchedKeywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="keyword-chip keyword-chip--matched"
                                  >
                                    {kw}
                                  </span>
                                ))
                              ) : (
                                <span>No matched keywords found</span>
                              )}
                            </div>
                          </div>
                          <div className="keywords-section">
                            <h4 className="keywords-title">
                              Missing Keywords (
                              {analysis.missingKeywords?.length || 0})
                            </h4>
                            <div className="keywords-list">
                              {analysis.missingKeywords?.length > 0 ? (
                                analysis.missingKeywords.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="keyword-chip keyword-chip--missing"
                                  >
                                    {kw}
                                  </span>
                                ))
                              ) : (
                                <span>No missing keywords identified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Suggestions Card */}
                      <div className="card result-card">
                        <div className="card__body">
                          <h3>Key Suggestions</h3>
                          <div className="suggestions-list">
                            {analysis.keywordSuggestions?.length > 0 ? (
                              analysis.keywordSuggestions.map(
                                (suggestion, i) => (
                                  <div key={i} className="suggestion-item">
                                    <span className="suggestion-number">
                                      {i + 1}
                                    </span>
                                    <span className="suggestion-text">
                                      {suggestion}
                                    </span>
                                  </div>
                                )
                              )
                            ) : (
                              <p>No specific suggestions available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bullet Rewrites Card */}
                      <div className="card result-card">
                        <div className="card__body">
                          <h3>Improved Bullet Points</h3>
                          <div className="bullet-rewrites">
                            {analysis.improvedBullets?.length > 0 ? (
                              analysis.improvedBullets.map((bullet, i) => (
                                <div key={i} className="bullet-item">
                                  <div className="bullet-improved">
                                    <h4>Suggestion {i + 1}</h4>
                                    <p>{bullet}</p>
                                    <button
                                      className="btn btn--outline btn--sm copy-btn"
                                      onClick={() => handleCopy(bullet)}
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p>No bullet point improvements available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Export Actions */}
                      <div className="export-actions">
                        <button
                          className="btn btn--primary"
                          onClick={() =>
                            toast.success("PDF download coming soon!")
                          }
                        >
                          Download Report (PDF)
                        </button>
                        <button
                          className="btn btn--outline"
                          onClick={() => handleCopy(getSummaryText())}
                        >
                          Copy Summary
                        </button>
                        <button
                          className="btn btn--secondary"
                          onClick={() => setShowResults(false)}
                        >
                          Refine and Re-run
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="error-message">
                      <p>Failed to load analysis results. Please try again.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="error-message">
                <p>Failed to load analysis results. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
