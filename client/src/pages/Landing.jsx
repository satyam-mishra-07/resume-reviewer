import React from 'react'

export default function Landing() {
  return (
    <>
      {/* Landing Page */}
      <div id="landing-page" className="page active">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">Unlock ATS-ready resumes—tailored to any job description</h1>
                <p className="hero-subtitle">Upload your resume, paste a JD, and get an instant, actionable review.</p>
                <div className="hero-actions">
                  <button className="btn btn--primary btn--lg" id="getReviewBtn"><a href="/review" className="nav-link" data-route="/review">Get Your Review</a></button>
                  <button className="btn btn--outline btn--lg" id="sampleReviewBtn">Try Sample Review</button>
                </div>
                <div className="trust-badges">
                  <span className="trust-badge">✓ Built with AI</span>
                  <span className="trust-badge">✓ ATS Optimized</span>
                  <span className="trust-badge">✓ Industry Tested</span>
                </div>
              </div>
              <div className="hero-illustration">
                <div className="illustration-placeholder">
                  <div className="resume-mockup">
                    <div className="resume-lines"></div>
                    <div className="ai-indicator">AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Why Choose ResumeReviewr?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3 className="feature-title">ATS Match Score</h3>
                <p className="feature-description">See alignment with the job description and get a detailed compatibility score.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3 className="feature-title">Keyword Gaps</h3>
                <p className="feature-description">Find missing skills & recommendations to improve your resume visibility.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✏️</div>
                <h3 className="feature-title">Bullet Improvements</h3>
                <p className="feature-description">Get actionable rewrite suggestions for impactful bullet points.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="steps-section">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <h3 className="step-title">Upload Resume</h3>
                <p className="step-description">Upload your resume file or paste your resume text</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h3 className="step-title">Paste Job Description</h3>
                <p className="step-description">Add the job description you're targeting</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h3 className="step-title">Get Analysis</h3>
                <p className="step-description">Receive detailed report with score, gaps, and improvements</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">What Our Users Say</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p className="testimonial-text">"Helped me land interviews in 2 weeks with better keyword optimization!"</p>
                <div className="testimonial-author">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b9de4a9a?w=48&h=48&fit=crop&crop=face" 
                    alt="Sarah Johnson" 
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">Sarah Johnson</div>
                    <div className="author-role">Software Engineer</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">"The bullet point suggestions transformed my resume completely."</p>
                <div className="testimonial-author">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" 
                    alt="Mike Chen" 
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">Mike Chen</div>
                    <div className="author-role">Product Manager</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="footer-cta-section">
          <div className="container">
            <div className="footer-cta">
              <h2 className="cta-title">Ready to improve your resume?</h2>
              <p className="cta-subtitle">Get started with your first review today</p>
              <button className="btn btn--primary btn--lg" id="footerCTABtn">Review My Resume Now</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
