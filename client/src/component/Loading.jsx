import React from 'react'

export default function Loading({ isLoading, message = "Analyzing your resume..." }) {
  if (!isLoading) return null

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  )
}
