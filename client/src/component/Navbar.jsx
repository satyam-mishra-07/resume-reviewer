import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth(); // Use context

  const handleLogout = async () => {
    try {
      await logout(); // This will update global state
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1 className="logo-text">ResumeReviewr</h1>
          </div>
          
          <nav className="main-nav">
            <a href="/" className="nav-link">Landing</a>
            {isAuthenticated && (
              <a href="/profile" className="nav-link">Profile</a>
            )}
            <a href="/review" className="nav-link">Review</a>
          </nav>
          
          <div className="auth-actions">
            {!isAuthenticated ? (
              <>
                <button className="btn btn--outline btn--sm">
                  <a href="/login" className="nav-link">Login</a>
                </button>
                <button className="btn btn--primary btn--sm">
                  <a href="/signup" className="nav-link">Sign Up</a>
                </button>
              </>
            ) : (
              <div className="user-menu">
                <span className="user-greeting">
                  Hi, {user?.firstName || 'User'}!
                </span>
                <button 
                  className="btn btn--primary btn--sm" 
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
          
          <button className="mobile-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}