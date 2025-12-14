import React, { useEffect } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onUploadClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onUploadClick }) => {
  useEffect(() => {
    const pauseBtn = document.getElementById('pauseBtn');
    const carousel = document.querySelector('.quick-stats-carousel') as HTMLElement;
    
    if (pauseBtn && carousel) {
      const handlePauseClick = () => {
        const isPaused = carousel.classList.contains('paused');
        
        if (isPaused) {
          // Resume animation
          carousel.classList.remove('paused');
          pauseBtn.classList.remove('paused');
          pauseBtn.textContent = '⏸';
        } else {
          // Pause animation
          carousel.classList.add('paused');
          pauseBtn.classList.add('paused');
          pauseBtn.textContent = '▶';
        }
      };
      
      pauseBtn.addEventListener('click', handlePauseClick);
      
      // Cleanup
      return () => {
        pauseBtn.removeEventListener('click', handlePauseClick);
      };
    }
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Animated Background */}
          <div className="hero-bg">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
            <div className="bg-blob blob-3"></div>
          </div>

          {/* Main Hero */}
          <div className="hero-main">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">Intelligent Document Analysis</span>
            </div>

            <h1 className="hero-title">
              Your <span className="highlight">Smart Assistant</span>
              <br />
              for Technical Documents
            </h1>

            <p className="hero-description">
              Upload any PDF and chat with our AI. Ask questions, find evidence, 
              learn definitions, and understand equations instantly.
            </p>

            {/* CTA Buttons */}
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={onUploadClick}>
                <span className="btn-icon">📤</span>
                <span>Upload PDF</span>
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn btn-secondary">
                <span>Learn More</span>
                <span className="btn-icon">📖</span>
              </button>
            </div>

            {/* Quick Stats - Scrolling Carousel */}
            <div className="quick-stats-container">
              <div className="quick-stats-label">Trusted by engineers & researchers</div>
              <div className="quick-stats-wrapper">
                <div className="quick-stats-carousel">
                  <div className="stat-item">
                    <span className="stat-icon">⚡</span>
                    <span>Instant Answers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🧠</span>
                    <span>Full Context</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔐</span>
                    <span>100% Private</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span>Real-time Analysis</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span>Precise Results</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⚙️</span>
                    <span>Advanced Tools</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🚀</span>
                    <span>Lightning Fast</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💡</span>
                    <span>Smart Insights</span>
                  </div>
                  
                  {/* Duplicate for seamless loop */}
                  <div className="stat-item">
                    <span className="stat-icon">⚡</span>
                    <span>Instant Answers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🧠</span>
                    <span>Full Context</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔐</span>
                    <span>100% Private</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span>Real-time Analysis</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span>Precise Results</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⚙️</span>
                    <span>Advanced Tools</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🚀</span>
                    <span>Lightning Fast</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💡</span>
                    <span>Smart Insights</span>
                  </div>
                </div>
                <button className="carousel-pause-btn" id="pauseBtn" title="Pause">⏸</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <section className="carousel-section testimonials-section">
        <div className="carousel-label">What Engineers & Researchers Say</div>
        <div className="carousel-wrapper">
          <div className="testimonials-carousel">
            <div className="testimonial-card">
              <p className="testimonial-quote">"This tool saved me hours of research. The AI understands technical documents like no other solution."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div>
                  <p className="author-name">Dr. John Smith</p>
                  <p className="author-title">Mechanical Engineer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"The equation analyzer is incredible. Finally, a tool that explains complex math in seconds."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🔬</div>
                <div>
                  <p className="author-name">Dr. Sarah Johnson</p>
                  <p className="author-title">Physics Researcher</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"The glossary feature helps our team stay on the same page. Highly recommended!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🎓</div>
                <div>
                  <p className="author-name">Prof. Michael Chen</p>
                  <p className="author-title">Academic Advisor</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"Best investment in our research workflow. Productivity increased by 40%."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍💻</div>
                <div>
                  <p className="author-name">Emma Wilson</p>
                  <p className="author-title">Data Scientist</p>
                </div>
              </div>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="testimonial-card">
              <p className="testimonial-quote">"This tool saved me hours of research. The AI understands technical documents like no other solution."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div>
                  <p className="author-name">Dr. John Smith</p>
                  <p className="author-title">Mechanical Engineer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"The equation analyzer is incredible. Finally, a tool that explains complex math in seconds."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🔬</div>
                <div>
                  <p className="author-name">Dr. Sarah Johnson</p>
                  <p className="author-title">Physics Researcher</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"The glossary feature helps our team stay on the same page. Highly recommended!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🎓</div>
                <div>
                  <p className="author-name">Prof. Michael Chen</p>
                  <p className="author-title">Academic Advisor</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-quote">"Best investment in our research workflow. Productivity increased by 40%."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍💻</div>
                <div>
                  <p className="author-name">Emma Wilson</p>
                  <p className="author-title">Data Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <h2>Comprehensive Solution Suite</h2>
          <p>Everything you need to understand technical documents</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">💬</span>
              <h3>Chat with PDFs</h3>
            </div>
            <p>Ask any question about your document. Our intelligent system reads the entire PDF and provides instant, accurate answers.</p>
            <div className="feature-badge popular">Most Popular</div>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">📚</span>
              <h3>Glossary Builder</h3>
            </div>
            <p>Automatically extract and organize technical terms with definitions. Build your personal reference guide.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">📐</span>
              <h3>Equation Analyzer</h3>
            </div>
            <p>Detect, highlight, and get explanations for mathematical equations throughout your document.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">🔍</span>
              <h3>Evidence Tracker</h3>
            </div>
            <p>Find the exact sources and context for any claim. Navigate directly to supporting data and figures.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">🔄</span>
              <h3>Unit Converter</h3>
            </div>
            <p>Convert between any units instantly. Perfect for working with measurements in technical documents.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">🌍</span>
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
            <h2>Built for Engineers & Researchers</h2>
            <p>Whether you're analyzing technical reports, research papers, or engineering specifications, our intelligent system understands the context and nuances of technical documentation.</p>
            
            <div className="capabilities-list">
              <div className="capability-item">
                <span className="check-icon">✓</span>
                <span>Supports up to 50MB PDF files</span>
              </div>
              <div className="capability-item">
                <span className="check-icon">✓</span>
                <span>Full document context processing</span>
              </div>
              <div className="capability-item">
                <span className="check-icon">✓</span>
                <span>Real-time equation detection</span>
              </div>
              <div className="capability-item">
                <span className="check-icon">✓</span>
                <span>Advanced search & navigation</span>
              </div>
            </div>
          </div>

          <div className="capabilities-visual">
            <div className="visual-card">
              <span className="visual-emoji">⚡</span>
              <p>Lightning Fast</p>
            </div>
            <div className="visual-card">
              <span className="visual-emoji">🔬</span>
              <p>Research Grade</p>
            </div>
            <div className="visual-card">
              <span className="visual-emoji">🎯</span>
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
          <button className="btn btn-primary btn-large" onClick={onUploadClick}>
            <span className="btn-icon">📤</span>
            <span>Upload Your First PDF</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>Powered by advanced language models & intelligent processing</p>
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
