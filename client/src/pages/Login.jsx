import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { axiosInstance } from "../utils/axiosInstance";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use context

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Axios automatically parses JSON, so use response.data
      const data = response.data;

      // Check if login failed (Axios throws for non-2xx status by default)
      if (!data.token || !data.user) {
        throw new Error(data.message || "Login failed");
      }

      // Update global state - this will immediately update navbar
      login(data.token, data.user);

      navigate("/profile");
      console.log("Login successful:", data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login - Coming soon");
  };

  const handleGitHubLogin = () => {
    // TODO: Implement GitHub OAuth
    console.log("GitHub login - Coming soon");
  };

  return (
    <div id="login-page" className="page active">
      <div className="login-container">
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="error-message"
                  style={{
                    color: "red",
                    fontSize: "14px",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--full-width"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="oauth-buttons">
              <button
                className="btn btn--outline btn--full-width oauth-btn"
                onClick={handleGoogleLogin}
                type="button"
                disabled={loading}
              >
                <span className="oauth-icon">G</span>
                Continue with Google
              </button>
              <button
                className="btn btn--outline btn--full-width oauth-btn"
                onClick={handleGitHubLogin}
                type="button"
                disabled={loading}
              >
                <span className="oauth-icon">GH</span>
                Continue with GitHub
              </button>
            </div>

            <div className="login-links">
              <a href="/signup" className="login-link">
                Create an account
              </a>
              <a href="#/forgot" className="login-link">
                Forgot password?
              </a>
            </div>

            <p className="security-note">
              We never store your files without consent.
            </p>
          </div>

          <div className="login-illustration">
            <div className="illustration-placeholder">
              <div className="auth-visual">🔒</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
