import React from 'react'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#/privacy" className="footer-link">Privacy</a>
            <a href="#/terms" className="footer-link">Terms</a>
            <a href="#/contact" className="footer-link">Contact</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
          <p className="footer-copyright">© 2025 ResumeReviewr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
