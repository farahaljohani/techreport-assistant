import React, { useState } from 'react';
import { reportService } from '../services/api';
import { describeApiError } from '../utils/errors';
import type { ReportData } from '../types';
import './TopBar.css';

interface TopBarProps {
  onReportUpload: (data: ReportData) => void;
  onSearch: (query: string) => void;
  onGoHome?: () => void;
  reportData?: ReportData | null;
  equationsCount?: number;
}

const MAX_FILE_MB = 50;

export const TopBar: React.FC<TopBarProps> = ({
  onReportUpload,
  onGoHome,
  reportData,
  equationsCount = 0,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_FILE_MB} MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const data = (await reportService.uploadReport(file, pct => setProgress(pct))) as ReportData;
      onReportUpload(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Upload failed:', error);
      setUploadError(describeApiError(error, 'upload'));
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = '';
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
          <span className="logo-text">Read &amp; Access</span>
          <span className="logo-subtitle">
            {reportData ? 'Click to go home' : 'Technical Reports'}
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
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="upload-input"
              disabled={uploading}
            />
            <span className={`upload-btn ${uploading ? 'uploading' : ''}`}>
              <span className="btn-icon">{uploading ? '⏳' : '📤'}</span>
              <span className="btn-text">
                {uploading
                  ? progress >= 100
                    ? 'Processing…'
                    : `Uploading ${progress}%`
                  : reportData ? 'Change PDF' : 'Upload PDF'}
              </span>
            </span>
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="upload-error" role="alert">
          <span className="upload-error-icon">⚠️</span>
          <span className="upload-error-text">{uploadError}</span>
          <button
            className="upload-error-close"
            onClick={() => setUploadError(null)}
            aria-label="Dismiss"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
