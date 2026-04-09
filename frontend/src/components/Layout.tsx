import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { LandingPage } from './LandingPage';
import { ReportReader } from './ReportReader';
import { PDFViewer } from './PDFViewer';
import { ToolsPanel } from './ToolsPanel';
import { LeftSidebar } from './LeftSidebar';
import { reportService } from '../services/api';
import './Layout.css';

export const Layout: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [selectedText, setSelectedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usePDFViewer, setUsePDFViewer] = useState(true);
  const [glossary, setGlossary] = useState<Map<string, string>>(new Map());
  const [equations, setEquations] = useState<any[]>([]);
  const [equationsLoading, setEquationsLoading] = useState(false);

  // Floating search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Resizable sidebar widths
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(380);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReportUpload = (data: any) => {
    setReportData(data);
    setSelectedText('');
    setSearchQuery('');
    setSearchInput('');
    extractEquations(data);
  };

  const extractEquations = async (data: any) => {
    setEquationsLoading(true);
    try {
      const result = await reportService.detectEquations(data.text);
      if (result && result.equations) {
        const formattedEqs = result.equations.map((eq: any) => ({
          ...eq,
          variables: extractVariables(eq.equation)
        }));
        setEquations(formattedEqs);
      }
    } catch {
      // Fallback: tighter client-side patterns (fewer false positives)
      const text: string = data.text;
      const found: Set<string> = new Set();
      const detectedEquations: any[] = [];

      const patterns: { re: RegExp; fmt: string }[] = [
        { re: /\$[^\$\n]{2,80}\$/g, fmt: 'latex' },
        { re: /\\\([^\)]{2,100}\\\)/g, fmt: 'latex' },
        { re: /[a-zA-Z][a-zA-Z0-9_]{0,6}\s*=\s*[0-9\-][^\n.;]{1,60}/g, fmt: 'numeric' },
        { re: /[^\n]*[∫∑∏√±≈≤≥∞∂∇][^\n]{4,80}/g, fmt: 'symbolic' },
      ];

      patterns.forEach(({ re, fmt }) => {
        const matches = text.match(re) || [];
        matches.forEach(m => {
          const clean = m.replace(/\s+/g, ' ').trim();
          if (clean.length > 4 && !found.has(clean.toLowerCase())) {
            found.add(clean.toLowerCase());
            detectedEquations.push({
              id: detectedEquations.length,
              equation: clean,
              format: fmt,
              variables: extractVariables(clean)
            });
          }
        });
      });

      setEquations(detectedEquations);
    } finally {
      setEquationsLoading(false);
    }
  };

  const extractVariables = (equation: string): string[] => {
    const stopWords = new Set(['the', 'of', 'in', 'and', 'or', 'for', 'is', 'at', 'by', 'an', 'to']);
    const vars = equation.match(/\b[a-zA-Z][a-zA-Z0-9_]*\b/g) || [];
    return [...new Set(vars.filter(v => v.length <= 6 && !stopWords.has(v.toLowerCase())))];
  };

  // Jump to text in text view — used by Evidence Tracker
  const handleJumpToText = useCallback((text: string) => {
    const snippet = text.substring(0, 40);
    setUsePDFViewer(false);
    setSearchQuery(snippet);
    setSearchInput(snippet);
    setShowSearch(true);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTextSelect = useCallback((text: string) => {
    setSelectedText(text);
  }, []);

  const addToGlossary = useCallback((term: string, definition: string) => {
    setGlossary(prev => {
      const next = new Map(prev);
      next.set(term.toLowerCase(), definition);
      return next;
    });
  }, []);

  const openSearch = useCallback(() => {
    setUsePDFViewer(false);
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchInput('');
  }, []);

  // Ctrl/Cmd + F opens floating search
  useEffect(() => {
    if (!reportData) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && showSearch) closeSearch();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [reportData, showSearch, openSearch, closeSearch]);

  // Sidebar resize
  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => { e.preventDefault(); setIsDraggingLeft(true); }, []);
  const handleMouseDownRight = useCallback((e: React.MouseEvent) => { e.preventDefault(); setIsDraggingRight(true); }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) setLeftWidth(Math.max(200, Math.min(500, e.clientX)));
      if (isDraggingRight) setRightWidth(Math.max(300, Math.min(600, window.innerWidth - e.clientX)));
    };
    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  const handleUploadClick = () => {
    (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
  };

  const handleGoHome = () => {
    setReportData(null);
    setSelectedText('');
    setSearchQuery('');
    setSearchInput('');
    setShowSearch(false);
    setGlossary(new Map());
    setEquations([]);
  };

  if (!reportData) {
    return (
      <div className="layout">
        <TopBar onReportUpload={handleReportUpload} onSearch={handleSearch} reportData={reportData} />
        <LandingPage onUploadClick={handleUploadClick} />
      </div>
    );
  }

  return (
    <div className="layout">
      <TopBar
        onReportUpload={handleReportUpload}
        onSearch={handleSearch}
        onGoHome={handleGoHome}
        reportData={reportData}
        equationsCount={equations.length}
      />

      <div className="view-toggle">
        <button
          className={`toggle-btn ${!usePDFViewer ? 'active' : ''}`}
          onClick={() => setUsePDFViewer(false)}
          title="View extracted text"
        >
          📝 Text View
        </button>
        <button
          className={`toggle-btn ${usePDFViewer ? 'active' : ''}`}
          onClick={() => setUsePDFViewer(true)}
          title="View PDF document"
        >
          📄 PDF View
        </button>
        {/* Search button only visible in text view */}
        {!usePDFViewer && (
          <button
            className={`toggle-btn search-toggle-btn ${showSearch ? 'active' : ''}`}
            onClick={showSearch ? closeSearch : openSearch}
            title="Search in document (Ctrl+F)"
          >
            🔍 Search
          </button>
        )}
      </div>

      <div className="main-container">
        {/* Left Sidebar */}
        <>
          <div className="left-sidebar-wrapper" style={{ width: `${leftWidth}px` }}>
            <LeftSidebar
              reportData={reportData}
              equations={equations}
              equationsLoading={equationsLoading}
              glossary={glossary}
            />
          </div>
          <div
            className={`resize-handle left-handle ${isDraggingLeft ? 'dragging' : ''}`}
            onMouseDown={handleMouseDownLeft}
            title="Drag to resize left panel"
          >
            <div className="handle-dot" />
          </div>
        </>

        {/* Center */}
        <div className="center-content">
          {/* Floating search overlay */}
          {showSearch && !usePDFViewer && (
            <div className="floating-search">
              <span className="floating-search-icon">🔍</span>
              <input
                ref={searchInputRef}
                className="floating-search-input"
                type="text"
                placeholder="Search in document…"
                value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setSearchQuery(e.target.value); }}
                onKeyDown={e => e.key === 'Escape' && closeSearch()}
              />
              {searchInput && (
                <span className="floating-search-hint">↩ Enter · Esc to close</span>
              )}
              <button className="floating-search-close" onClick={closeSearch} title="Close (Esc)">✕</button>
            </div>
          )}

          {usePDFViewer ? (
            <PDFViewer reportData={reportData} onTextSelect={handleTextSelect} />
          ) : (
            <ReportReader reportData={reportData} searchQuery={searchQuery} onTextSelect={handleTextSelect} />
          )}
        </div>

        {/* Right Sidebar */}
        <>
          <div
            className={`resize-handle right-handle ${isDraggingRight ? 'dragging' : ''}`}
            onMouseDown={handleMouseDownRight}
            title="Drag to resize right panel"
          >
            <div className="handle-dot" />
          </div>
          <div className="right-sidebar-wrapper" style={{ width: `${rightWidth}px` }}>
            <ToolsPanel
              reportData={reportData}
              selectedText={selectedText}
              glossary={glossary}
              equations={equations}
              onAddToGlossary={addToGlossary}
              onJumpToText={handleJumpToText}
            />
          </div>
        </>
      </div>
    </div>
  );
};
