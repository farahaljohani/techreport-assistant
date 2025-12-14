import React, { useState } from 'react';
import { reportService } from '../services/api';
import './TopBar.css';

interface TopBarProps {
  onReportUpload: (data: any) => void;
  onSearch: (query: string) => void;
  reportData?: any;
}

export const TopBar: React.FC<TopBarProps> = ({ onReportUpload, onSearch, reportData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !reportData) {
      alert('Please upload a PDF first');
      return;
    }

    setLoading(true);
    try {
      const result = await reportService.askQuestion(question, reportData.text);
      setAnswer(result.answer);
      setShowAnswer(true);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('❌ Error getting answer. Please try again.');
      setShowAnswer(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topbar">
      {/* Enhanced Logo with Status */}
      <div className="topbar-logo">
        <div className="logo-container">
          <span className="logo-icon">✨</span>
          {reportData && <span className="status-indicator">●</span>}
        </div>
        <div className="logo-info">
          <span className="logo-text">TechReport</span>
          <span className="logo-subtitle">
            {reportData ? `${reportData.filename || 'Document loaded'}` : 'Assistant'}
          </span>
        </div>
      </div>

      {/* Enhanced Ask Box */}
      <form className="ask-form" onSubmit={handleAskQuestion}>
        <div className="input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={reportData ? "Ask anything about your PDF..." : "Upload a PDF to get started"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!reportData || loading}
            className="ask-input"
          />
          {question && (
            <button 
              type="button" 
              className="clear-input-btn"
              onClick={() => setQuestion('')}
            >
              ✕
            </button>
          )}
        </div>
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </form>

      {/* Answer Popup */}
      {showAnswer && answer && (
        <div className="answer-popup">
          <div className="answer-content">
            <button 
              className="close-btn"
              onClick={() => setShowAnswer(false)}
            >
              ✕
            </button>
            <h3>💡 Answer</h3>
            <p>{answer}</p>
          </div>
        </div>
      )}

      {/* Enhanced Upload and Actions */}
      <div className="topbar-actions">
        {reportData && (
          <div className="quick-stats-bar">
            <div className="stat-badge">
              <span className="stat-icon">📄</span>
              <span className="stat-text">{reportData.total_pages || 0} pages</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">📐</span>
              <span className="stat-text">{reportData.equations?.length || 0} equations</span>
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
