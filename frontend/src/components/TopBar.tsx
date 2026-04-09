import React from 'react';
import { reportService } from '../services/api';
import './TopBar.css';

interface TopBarProps {
  onReportUpload: (data: any) => void;
  onSearch: (query: string) => void;
  onGoHome?: () => void;
  reportData?: any;
  equationsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onReportUpload, onGoHome, reportData, equationsCount = 0 }) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await reportService.uploadReport(file);
      onReportUpload(data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-logo" onClick={reportData ? onGoHome : undefined} style={reportData ? { cursor: 'pointer' } : {}}>
        <div className="logo-container">
          <span className="logo-icon">✨</span>
          {reportData && <span className="status-indicator">●</span>}
        </div>
        <div className="logo-info">
          <span className="logo-text">TechReport</span>
          <span className="logo-subtitle">
            {reportData ? 'Click to go home' : 'Assistant'}
          </span>
        </div>
      </div>
      {reportData && (
        <button className="home-btn" onClick={onGoHome} title="Back to Home">
          ← Home
        </button>
      )}

      {reportData ? (
        <div className="topbar-doc-center">
          <span className="topbar-doc-icon">📄</span>
          <span className="topbar-doc-name">{reportData.filename || 'Document'}</span>
        </div>
      ) : (
        <div className="topbar-spacer" />
      )}

      <div className="topbar-actions">
        {reportData && (
          <div className="quick-stats-bar">
            <div className="stat-badge">
              <span className="stat-icon">📄</span>
              <span className="stat-text">{reportData.total_pages || 0} pages</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">📐</span>
              <span className="stat-text">{equationsCount} eq</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">💾</span>
              <span className="stat-text">{reportData.file_size ? `${(reportData.file_size / 1024).toFixed(0)} KB` : '—'}</span>
            </div>
          </div>
        )}

        <div className="topbar-upload">
          <label className="upload-label">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="upload-input"
            />
            <span className="upload-btn">
              <span className="btn-icon">📤</span>
              <span className="btn-text">{reportData ? 'Change PDF' : 'Upload PDF'}</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
