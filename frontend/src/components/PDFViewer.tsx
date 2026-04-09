import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './PDFViewer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  reportData: any;
  onTextSelect?: (text: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ reportData, onTextSelect }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [fitToWidth, setFitToWidth] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcuts - MUST be at the top before any returns
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (loading || !reportData) return;

      // Navigation
      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
        setPageNumber(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
        setPageNumber(prev => Math.min(numPages || 1, prev + 1));
      } else if (e.key === 'Home') {
        setPageNumber(1);
      } else if (e.key === 'End') {
        setPageNumber(numPages || 1);
      }
      
      // Zoom
      else if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        setScale(prev => Math.min(3, prev + 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setScale(prev => Math.max(0.5, prev - 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading, numPages, reportData]);

  if (!reportData) {
    return (
      <div className="pdf-error">
        <p className="error-message">⚠️ No report data available</p>
        <p className="error-hint">Please upload a report first</p>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
    setLoading(false);
    console.log(`✅ PDF loaded successfully with ${numPages} pages`);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF Load Error:', error);
    setError('Could not load PDF. Using Text View.');
    setLoading(false);
  };

  const handleTextSelection = () => {
    const text = window.getSelection()?.toString();
    if (text && onTextSelect) {
      onTextSelect(text);
    }
  };

  if (error) {
    return (
      <div className="pdf-error">
        <p className="error-message">⚠️ {error}</p>
        <p className="error-hint">Try refreshing or switching to Text View</p>
      </div>
    );
  }

  const pdfUrl = reportData?.file_path ? `http://localhost:8000${reportData.file_path}` : null;

  const goToFirstPage = () => setPageNumber(1);
  const goToLastPage = () => setPageNumber(numPages || 1);
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  };

  return (
    <div className="pdf-viewer">
      {!loading && numPages && (
        <div className="progress-indicator">
          <div
            className="progress-bar"
            style={{ width: `${(pageNumber / numPages) * 100}%` }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="pdf-controls">
        <div className="control-group navigation-group">
          <button 
            onClick={goToFirstPage}
            disabled={pageNumber <= 1 || loading}
            className="btn-control btn-first"
            title="First Page"
          >
            ⏮
          </button>
          
          <button 
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1 || loading}
            className="btn-control btn-nav"
            title="Previous Page"
          >
            ◀
          </button>
          
          <div className="page-input-group">
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInput}
              min={1}
              max={numPages || 1}
              className="page-input"
              disabled={loading}
            />
            <span className="page-divider">/</span>
            <span className="total-pages">{numPages || '...'}</span>
          </div>
          
          <button 
            onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
            disabled={pageNumber >= (numPages || 1) || loading}
            className="btn-control btn-nav"
            title="Next Page"
          >
            ▶
          </button>

          <button 
            onClick={goToLastPage}
            disabled={pageNumber >= (numPages || 1) || loading}
            className="btn-control btn-last"
            title="Last Page"
          >
            ⏭
          </button>
        </div>

        <div className="control-divider" />

        <div className="control-group zoom-group">
          <button 
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="btn-control btn-zoom"
            disabled={loading}
            title="Zoom Out (Ctrl + -)"
          >
            🔍−
          </button>
          
          <span className="zoom-display">{Math.round(scale * 100)}%</span>
          
          <button 
            onClick={() => setScale(Math.min(3, scale + 0.1))}
            className="btn-control btn-zoom"
            disabled={loading}
            title="Zoom In (Ctrl + +)"
          >
            🔍+
          </button>

          <button 
            onClick={() => setScale(1)}
            className="btn-control btn-reset"
            disabled={loading}
            title="Reset Zoom"
          >
            ↺
          </button>

          <button 
            onClick={() => setFitToWidth(!fitToWidth)}
            className={`btn-control btn-fit ${fitToWidth ? 'active' : ''}`}
            disabled={loading}
            title="Fit to Width"
          >
            ⬌
          </button>
        </div>

        <div className="control-divider" />

        <div className="control-group rotate-group">
          <button 
            onClick={() => setRotation((rotation - 90) % 360)}
            className="btn-control btn-rotate"
            disabled={loading}
            title="Rotate Left"
          >
            ↺
          </button>

          <button 
            onClick={() => setRotation((rotation + 90) % 360)}
            className="btn-control btn-rotate"
            disabled={loading}
            title="Rotate Right"
          >
            ↻
          </button>
        </div>

        <div className="control-divider" />

        <div className="control-group actions-group">
          <button 
            className="btn-control btn-download"
            onClick={() => window.open(pdfUrl || '', '_blank')}
            disabled={loading}
            title="Download PDF"
          >
            ⬇ Download
          </button>

          <button 
            className="btn-control btn-print"
            onClick={() => window.print()}
            disabled={loading}
            title="Print PDF"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div className="pdf-container" ref={containerRef} onMouseUp={handleTextSelection}>
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">📄 Loading PDF Document...</p>
            <p className="loading-hint">This may take a moment for large files</p>
          </div>
        )}
        
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="loading-state">
                <div className="loading-spinner" />
                <p className="loading-text">Preparing document...</p>
              </div>
            }
          >
            {numPages && (
              <div className="page-wrapper">
                <Page
                  pageNumber={pageNumber}
                  {...(fitToWidth && containerWidth > 0
                    ? { width: containerWidth }
                    : { scale })}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                />
              </div>
            )}
          </Document>
        )}
      </div>

    </div>
  );
};
