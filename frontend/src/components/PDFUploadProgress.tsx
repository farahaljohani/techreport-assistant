import React, { useState, useEffect } from 'react';
import './PDFUploadProgress.css';

interface PDFUploadProgressProps {
  fileName: string;
  isProcessing: boolean;
  progress: number;
  fileSize?: number;
  pageCount?: number;
}

export const PDFUploadProgress: React.FC<PDFUploadProgressProps> = ({
  fileName,
  isProcessing,
  progress,
  fileSize = 0,
  pageCount = 0,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [processSpeed, setProcessSpeed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    glossary: true,
    explanation: false,
    evidence: false,
    equation: false,
    recalculation: false,
    unitConverter: false,
    askAnything: false,
  });

  useEffect(() => {
    if (progress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  useEffect(() => {
    // Estimate remaining time and calculate speed
    if (progress > 0 && progress < 100) {
      const progressPercentage = progress / 100;
      const totalTime = 30; // estimate 30 seconds total
      const elapsed = totalTime * progressPercentage;
      const remaining = Math.ceil(totalTime - elapsed);
      setEstimatedTime(Math.max(remaining, 1));
      setTimeElapsed(Math.ceil(elapsed));
      
      // Calculate processing speed (MB/s)
      if (fileSize > 0 && elapsed > 0) {
        const speed = (fileSize / 1024 / 1024) / elapsed;
        setProcessSpeed(parseFloat(speed.toFixed(2)));
      }
    }
  }, [progress, fileSize]);

  const getStepIcon = (stepNum: number) => {
    if (displayProgress >= stepNum * 25 + 25) {
      return '✓'; // Checkmark for completed
    }
    switch(stepNum) {
      case 0: return '📤'; // Upload
      case 1: return '📊'; // Analyze
      case 2: return '📚'; // Index
      case 3: return '✨'; // Ready
      default: return stepNum + 1;
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="pdf-upload-progress">
      <div className="progress-container">
        <div className="progress-bg">
          <div className="progress-blob"></div>
          <div className="progress-blob"></div>
          <div className="progress-blob"></div>
        </div>

        <div className="progress-content">
          <div className="progress-icon-wrapper">
            <div className="icon-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            <div className="icon-bg-circle"></div>
            <div className="icon-scan-line"></div>
            <div className="progress-icon">📄</div>
          </div>

          <h2 className="progress-title">Processing Document</h2>
          <p className="progress-subtitle">Preparing your file for analysis</p>

          <p className="progress-filename">{fileName}</p>

          <div className="progress-steps">
            <div className={`step ${displayProgress >= 25 ? 'active' : ''} ${displayProgress >= 50 ? 'completed' : ''}`}>
              <div className="step-number">
                <span className="step-content">{getStepIcon(0)}</span>
              </div>
              <p>Upload</p>
              {displayProgress >= 50 && <span className="step-checkmark">✓</span>}
            </div>
            <div className={`step-divider ${displayProgress >= 50 ? 'active' : ''}`}></div>
            
            <div className={`step ${displayProgress >= 50 ? 'active' : ''} ${displayProgress >= 75 ? 'completed' : ''}`}>
              <div className="step-number">
                <span className="step-content">{getStepIcon(1)}</span>
              </div>
              <p>Analyze</p>
              {displayProgress >= 75 && <span className="step-checkmark">✓</span>}
            </div>
            <div className={`step-divider ${displayProgress >= 75 ? 'active' : ''}`}></div>
            
            <div className={`step ${displayProgress >= 75 ? 'active' : ''} ${displayProgress >= 100 ? 'completed' : ''}`}>
              <div className="step-number">
                <span className="step-content">{getStepIcon(2)}</span>
              </div>
              <p>Index</p>
              {displayProgress >= 100 && <span className="step-checkmark">✓</span>}
            </div>
            <div className={`step-divider ${displayProgress >= 100 ? 'active' : ''}`}></div>
            
            <div className={`step ${displayProgress >= 100 ? 'active' : ''} ${displayProgress >= 100 ? 'completed' : ''}`}>
              <div className="step-number">
                <span className="step-content">{getStepIcon(3)}</span>
              </div>
              <p>Ready</p>
              {displayProgress >= 100 && <span className="step-checkmark">✓</span>}
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar-label">
              <span>Progress</span>
              <span>{displayProgress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${displayProgress}%` }}></div>
            </div>
            <p className="progress-percentage">{displayProgress}% Complete</p>
          </div>

          <p className="progress-message">
            {displayProgress < 25
              ? 'Uploading your document...'
              : displayProgress < 50
              ? 'Analyzing content and structure...'
              : displayProgress < 75
              ? 'Building search index...'
              : displayProgress < 100
              ? 'Finalizing setup...'
              : '✓ Document ready! Redirecting...'}
          </p>

          {isProcessing && displayProgress < 100 && <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>}

          {fileSize > 0 && (
            <div className="accordion-sections">
              {/* Summary Tool */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.summary ? 'expanded' : ''}`}
                  onClick={() => toggleSection('summary')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">✍️</span>
                    <span className="accordion-label">Summary Tool</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.summary ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.summary && (
                  <div className="accordion-content">
                    <div className="tool-description">Auto summary of page/selection</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Bullet-point extraction</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Key takeaways</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Glossary Tool */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.glossary ? 'expanded' : ''}`}
                  onClick={() => toggleSection('glossary')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">📖</span>
                    <span className="accordion-label">Glossary Tool</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.glossary ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.glossary && (
                  <div className="accordion-content">
                    <div className="tool-description">Definitions of highlighted terms</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Term definitions</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Context reference</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation Tool */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.explanation ? 'expanded' : ''}`}
                  onClick={() => toggleSection('explanation')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">🔎</span>
                    <span className="accordion-label">Explanation Tool</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.explanation ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.explanation && (
                  <div className="accordion-content">
                    <div className="tool-description">Explain selected text in simple terms</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Rewrite in simple English</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Real-world examples</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Tracker */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.evidence ? 'expanded' : ''}`}
                  onClick={() => toggleSection('evidence')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">📊</span>
                    <span className="accordion-label">Evidence Tracker</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.evidence ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.evidence && (
                  <div className="accordion-content">
                    <div className="tool-description">How do you know? Sources for claims</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Citation tracking</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Source verification</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Equation Helper */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.equation ? 'expanded' : ''}`}
                  onClick={() => toggleSection('equation')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">∑</span>
                    <span className="accordion-label">Equation Helper</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.equation ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.equation && (
                  <div className="accordion-content">
                    <div className="tool-description">List of all equations with variables</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>View variables & units</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Formula breakdown</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recalculation Panel */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.recalculation ? 'expanded' : ''}`}
                  onClick={() => toggleSection('recalculation')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">🔁</span>
                    <span className="accordion-label">Recalculation Panel</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.recalculation ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.recalculation && (
                  <div className="accordion-content">
                    <div className="tool-description">User inputs & live outputs</div>
                    <div className="input-group">
                      <label className="input-label">Variable Input</label>
                      <input type="number" className="input-field" placeholder="Enter value..." />
                    </div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Live recalculated outputs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Converter */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.unitConverter ? 'expanded' : ''}`}
                  onClick={() => toggleSection('unitConverter')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">🔀</span>
                    <span className="accordion-label">Unit Converter</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.unitConverter ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.unitConverter && (
                  <div className="accordion-content">
                    <div className="tool-description">Auto-detect and convert units</div>
                    <div className="tool-items">
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Auto-detect numbers</span>
                      </div>
                      <div className="tool-item">
                        <span className="tool-bullet">•</span>
                        <span>Convert between units</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ask Anything Box */}
              <div className="accordion-section">
                <button 
                  className={`accordion-header ${expandedSections.askAnything ? 'expanded' : ''}`}
                  onClick={() => toggleSection('askAnything')}
                >
                  <div className="accordion-title">
                    <span className="accordion-icon">💬</span>
                    <span className="accordion-label">Ask Anything</span>
                  </div>
                  <span className={`accordion-toggle ${expandedSections.askAnything ? 'open' : ''}`}>▼</span>
                </button>
                {expandedSections.askAnything && (
                  <div className="accordion-content">
                    <div className="tool-description">User Q&A with report context</div>
                    <div className="input-group">
                      <input type="text" className="input-field" placeholder="Ask a question..." />
                    </div>
                    <button className="tool-button">Send Question</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
