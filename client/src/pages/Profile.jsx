import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axiosInstance";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Decode JWT payload for user info
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          firstName: tokenPayload.firstName,
          lastName: tokenPayload.lastName,
          email: tokenPayload.email,
          isAdmin: tokenPayload.isAdmin,
        });

        // Fetch stats and history in parallel for better performance
        const [statsResponse, historyResponse] = await Promise.all([
          axiosInstance.get("/api/review/stats"),
          axiosInstance.get("/api/review/history"),
        ]);

        // Axios gives JSON directly via response.data
        setStats(statsResponse.data.stats);
        setReviews(historyResponse.data.reviews || []);
      } catch (err) {
        console.error("Profile fetch error:", err);

        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleViewReport = (reviewId) => {
    console.log("View report for review:", reviewId);
  };

  const handleRerun = (review) => {
    console.log("Re-run analysis for:", review);
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "score-badge--good";
    if (score >= 60) return "score-badge--medium";
    return "score-badge--poor";
  };

  if (loading) {
    return (
      <div
        id="profile-page"
        className="page active"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="container"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="profile-page"
        className="page active"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="container"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <div style={{ color: "red" }}>Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn--primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="profile-page"
      className="page active"
      style={{ minHeight: "100vh" }}
    >
      <div className="container" style={{ marginTop: "20px" }}>
        {/* Profile Header */}
        <div
          className="profile-header"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div className="profile-info">
            <h1 className="profile-name">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        {/* Combined Content Layout */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Left Column - Overview & Stats */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            {/* Stats Grid */}
            <div className="card" style={{ marginBottom: "2rem" }}>
              <div className="card__body">
                <h3 style={{ marginBottom: "1.5rem" }}>📊 Your Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">
                      {stats?.reviewsCount || 0}
                    </div>
                    <div className="stat-label">Reviews Done</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {stats?.averageScore || 0}
                    </div>
                    <div className="stat-label">Avg ATS Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {stats?.daysSinceLastReview !== null
                        ? stats?.daysSinceLastReview
                        : "-"}
                    </div>
                    <div className="stat-label">Days Since Last Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scores Preview */}
            {reviews.length > 0 && (
              <div className="card">
                <div className="card__body">
                  <h3 style={{ marginBottom: "1rem" }}>🎯 Recent Scores</h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {reviews.slice(0, 8).map((review, index) => (
                      <div key={review.id} style={{ textAlign: "center" }}>
                        <div
                          className={`score-badge ${getScoreBadgeClass(
                            review.atsScore
                          )}`}
                          style={{
                            minWidth: "40px",
                            padding: "8px",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                          }}
                        >
                          {review.atsScore}
                        </div>
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "0.7rem",
                            opacity: "0.7",
                          }}
                        >
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </small>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.9rem", opacity: "0.8" }}>
                    <strong>Best:</strong>{" "}
                    {Math.max(...reviews.map((r) => r.atsScore)) || 0} |
                    <strong> Latest:</strong> {reviews[0]?.atsScore || 0} |
                    <strong> Average:</strong> {stats?.averageScore || 0}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Review History */}
          <div style={{ flex: "2", minWidth: "400px" }}>
            <div className="card">
              <div className="card__body">
                <h3 style={{ marginBottom: "1.5rem" }}>📝 Review History</h3>

                {reviews.length === 0 ? (
                  <div
                    className="empty-state"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      📄
                    </div>
                    <p style={{ marginBottom: "1rem" }}>
                      No resume reviews found yet.
                    </p>
                    <button
                      onClick={() => navigate("/review")}
                      className="btn btn--primary"
                    >
                      Start Your First Review
                    </button>
                  </div>
                ) : (
                  <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                    {reviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="history-item"
                        style={{
                          padding: "1rem",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          marginBottom: "1rem",
                          backgroundColor: "#1a1a2e",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: "1" }}>
                            <h4
                              style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "1.1rem",
                              }}
                            >
                              Review #{reviews.length - index} - Resume Analysis
                            </h4>
                            <p
                              style={{
                                margin: "0 0 0.5rem 0",
                                fontSize: "0.9rem",
                                opacity: "0.8",
                              }}
                            >
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <div style={{ fontSize: "0.8rem", opacity: "0.7" }}>
                              <span style={{ color: "#4CAF50" }}>
                                ✓ {review.matchedKeywords?.length || 0} matched
                              </span>{" "}
                              |
                              <span
                                style={{
                                  color: "#f44336",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                ✗ {review.missingKeywords?.length || 0} missing
                              </span>{" "}
                              keywords
                            </div>
                          </div>

                          <div
                            style={{ textAlign: "center", marginLeft: "1rem" }}
                          >
                            <div
                              className={`score-badge ${getScoreBadgeClass(
                                review.atsScore
                              )}`}
                              style={{
                                fontSize: "1.2rem",
                                padding: "12px 16px",
                                borderRadius: "8px",
                              }}
                            >
                              {review.atsScore}
                            </div>
                            <small
                              style={{
                                display: "block",
                                marginTop: "0.5rem",
                                fontSize: "0.8rem",
                              }}
                            >
                              {review.atsScore >= (stats?.averageScore || 0)
                                ? "Above Avg"
                                : "Below Avg"}
                            </small>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "1rem",
                          }}
                        >
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => handleViewReport(review.id)}
                          >
                            View Report
                          </button>
                          <button
                            className="btn btn--secondary btn--sm"
                            onClick={() => handleRerun(review)}
                          >
                            Re-run
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: "2rem" }}>
          <div className="card__body">
            <h3 style={{ marginBottom: "1rem" }}>🚀 Quick Actions</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/review")}
                className="btn btn--primary"
              >
                📝 New Resume Review
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn--outline"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
