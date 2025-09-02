import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { axiosInstance } from "../utils/axiosInstance";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Add missing state variables for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/signup", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Axios automatically parses JSON, so directly access data
      const data = response.data;

      // Update global state - this will immediately update navbar
      login(data.token, data.user);

      navigate("/profile");
      console.log("Registration successful:", data.user);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log("Google signup - Coming soon");
  };

  const handleGitHubSignup = () => {
    // TODO: Implement GitHub OAuth
    console.log("GitHub signup - Coming soon");
  };

  return (
    <div id="register-page" className="page active">
      <div className="login-container">
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <h2 className="login-title">Create your account</h2>
              <p className="login-subtitle">Sign up to get started</p>
            </div>

            {error && (
              <div
                className="error-message"
                style={{
                  color: "red",
                  fontSize: "14px",
                  marginBottom: "1rem",
                  textAlign: "center",
                  padding: "0.5rem",
                  backgroundColor: "#ffebee",
                  border: "1px solid #ffcdd2",
                  borderRadius: "4px",
                }}
              >
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="form-control"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="form-control"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

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
                    placeholder="Create a password"
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

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={loading}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full-width"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="oauth-buttons">
              <button
                className="btn btn--outline btn--full-width oauth-btn"
                onClick={handleGoogleSignup}
                type="button"
                disabled={loading}
              >
                <span className="oauth-icon">G</span>
                Continue with Google
              </button>
              <button
                className="btn btn--outline btn--full-width oauth-btn"
                onClick={handleGitHubSignup}
                type="button"
                disabled={loading}
              >
                <span className="oauth-icon">GH</span>
                Continue with GitHub
              </button>
            </div>

            <div className="login-links">
              <a href="/login" className="login-link">
                Already have an account?
              </a>
              <a href="#/terms" className="login-link">
                Terms of Service
              </a>
            </div>

            <p className="security-note">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>

          <div className="login-illustration">
            <div className="illustration-placeholder">
              <div className="auth-visual">👤</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}