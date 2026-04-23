import React from 'react';
import { readJSON, writeJSON, StorageKeys } from '../utils/storage';
import type { RecentReport } from '../types';
import './LandingPage.css';

interface LandingPageProps {
  onUploadClick: () => void;
  onLoadRecent?: (recent: RecentReport) => void;
}

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

const formatSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onUploadClick, onLoadRecent }) => {
  const [recents, setRecents] = React.useState<RecentReport[]>(() =>
    readJSON<RecentReport[]>(StorageKeys.recentReports, [])
  );

  const handleLearnMore = () => {
    document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = recents.filter(r => r.id !== id);
    setRecents(next);
    writeJSON(StorageKeys.recentReports, next);
  };

  const clearAllRecents = () => {
    setRecents([]);
    writeJSON<RecentReport[]>(StorageKeys.recentReports, []);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Animated Background */}
          <div className="hero-bg" aria-hidden="true">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
            <div className="bg-blob blob-3"></div>
          </div>

          {/* Main Hero */}
          <div className="hero-main">
            <div className="hero-badge">
              <span className="badge-icon" aria-hidden="true">✨</span>
              <span className="badge-text">Intelligent Document Analysis</span>
            </div>

            <h1 className="hero-title">
              Helping People <span className="highlight">Read and Access</span>
              <br />
              Technical Reports
            </h1>

            <p className="hero-description">
              Upload any PDF and explore it in seconds. Ask questions, find evidence,
              learn definitions, and understand equations instantly.
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons">
              <button type="button" className="btn btn-primary" onClick={onUploadClick}>
                <span className="btn-icon" aria-hidden="true">📤</span>
                <span>Upload PDF</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleLearnMore}>
                <span>Learn More</span>
                <span className="btn-icon" aria-hidden="true">📖</span>
              </button>
            </div>

            <p className="hero-hint">
              Tip: you can also drag and drop a PDF anywhere on the page.
            </p>

            {/* Recent reports */}
            {recents.length > 0 && (
              <div className="recent-reports" aria-label="Recent reports">
                <div className="recent-reports-header">
                  <h2>Recent reports</h2>
                  <button
                    type="button"
                    className="recent-clear"
                    onClick={clearAllRecents}
                    aria-label="Clear recent reports list"
                  >
                    Clear
                  </button>
                </div>
                <ul className="recent-list">
                  {recents.map(r => (
                    <li
                      key={r.id}
                      className="recent-item"
                      onClick={() => onLoadRecent?.(r)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onLoadRecent?.(r);
                        }
                      }}
                    >
                      <span className="recent-icon" aria-hidden="true">📄</span>
                      <div className="recent-body">
                        <span className="recent-name" title={r.filename}>{r.filename}</span>
                        <span className="recent-meta">
                          {r.total_pages} pages
                          {r.file_size ? ` · ${formatSize(r.file_size)}` : ''}
                          {r.upload_date ? ` · ${formatDate(r.upload_date)}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="recent-remove"
                        onClick={e => removeRecent(r.id, e)}
                        aria-label={`Remove ${r.filename} from recents`}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Static trust stats */}
            <div className="hero-stats-row">
              <div className="hero-stat">
                <span className="hero-stat-value" aria-hidden="true">⚡</span>
                <span className="hero-stat-label">Instant Answers</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value" aria-hidden="true">🔐</span>
                <span className="hero-stat-label">100% Private</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value" aria-hidden="true">🎯</span>
                <span className="hero-stat-label">Precise Results</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value" aria-hidden="true">📐</span>
                <span className="hero-stat-label">8 Smart Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2>Comprehensive Solution Suite</h2>
          <p>Everything you need to understand technical documents</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">💬</span>
              <h3>Chat with PDFs</h3>
            </div>
            <p>Ask any question about your document. Our intelligent system reads the entire PDF and provides instant, accurate answers.</p>
            <div className="feature-badge popular">Most Popular</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">📚</span>
              <h3>Glossary Builder</h3>
            </div>
            <p>Automatically extract and organize technical terms with definitions. Build your personal reference guide.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">📐</span>
              <h3>Equation Analyzer</h3>
            </div>
            <p>Detect, highlight, and get explanations for mathematical equations throughout your document.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">🔍</span>
              <h3>Evidence Tracker</h3>
            </div>
            <p>Find the exact sources and context for any claim. Navigate directly to supporting data and figures.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">🔄</span>
              <h3>Unit Converter</h3>
            </div>
            <p>Convert between any units instantly. Perfect for working with measurements in technical documents.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon" aria-hidden="true">🌍</span>
              <h3>ISA Calculator</h3>
            </div>
            <p>Calculate atmospheric properties at any altitude using International Standard Atmosphere formulas.</p>
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="capabilities-section">
        <div className="capabilities-content">
          <div className="capabilities-text">
            <h2>Built for Engineers &amp; Researchers</h2>
            <p>Whether you're analyzing technical reports, research papers, or engineering specifications, our intelligent system understands the context and nuances of technical documentation.</p>

            <div className="capabilities-list">
              <div className="capability-item">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>Supports up to 50MB PDF files</span>
              </div>
              <div className="capability-item">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>Full document context processing</span>
              </div>
              <div className="capability-item">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>Real-time equation detection</span>
              </div>
              <div className="capability-item">
                <span className="check-icon" aria-hidden="true">✓</span>
                <span>Advanced search &amp; navigation</span>
              </div>
            </div>
          </div>

          <div className="capabilities-visual">
            <div className="visual-card">
              <span className="visual-emoji" aria-hidden="true">⚡</span>
              <p>Lightning Fast</p>
            </div>
            <div className="visual-card">
              <span className="visual-emoji" aria-hidden="true">🔬</span>
              <p>Research Grade</p>
            </div>
            <div className="visual-card">
              <span className="visual-emoji" aria-hidden="true">🎯</span>
              <p>Precision Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to transform your document analysis?</h2>
          <p>Join engineers and researchers who are using advanced automation to understand technical documents faster.</p>
          <button type="button" className="btn btn-primary btn-large" onClick={onUploadClick}>
            <span className="btn-icon" aria-hidden="true">📤</span>
            <span>Upload Your First PDF</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>Powered by advanced language models &amp; intelligent processing</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
