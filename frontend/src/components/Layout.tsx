import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TopBar } from './TopBar';
import { LandingPage } from './LandingPage';
import { ReportReader } from './ReportReader';
import { PDFViewer } from './PDFViewer';
import { ToolsPanel } from './ToolsPanel';
import { LeftSidebar } from './LeftSidebar';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { reportService } from '../services/api';
import { readJSON, writeJSON, removeKey, StorageKeys } from '../utils/storage';
import { useToast } from '../utils/toast';
import type { ReportData, EquationItem, RecentReport } from '../types';
import './Layout.css';

const RECENT_LIMIT = 5;
const SIDEBAR_LEFT_KEY = 'sidebar.leftWidth';
const SIDEBAR_RIGHT_KEY = 'sidebar.rightWidth';

export const Layout: React.FC = () => {
  // Rehydrate report + equations + glossary + favorites from localStorage on first render.
  const [reportData, setReportData] = useState<ReportData | null>(() =>
    readJSON<ReportData | null>(StorageKeys.report, null)
  );
  const [equations, setEquations] = useState<EquationItem[]>(() =>
    readJSON<EquationItem[]>(StorageKeys.equations, [])
  );
  const [glossary, setGlossary] = useState<Map<string, string>>(() => {
    const stored = readJSON<Record<string, string>>(StorageKeys.glossary, {});
    return new Map(Object.entries(stored));
  });

  const [selectedText, setSelectedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [usePDFViewer, setUsePDFViewer] = useState(true);
  const [equationsLoading, setEquationsLoading] = useState(false);

  // Floating search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts overlay
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Drag-and-drop overlay
  const [isDropping, setIsDropping] = useState(false);
  const dragCounter = useRef(0);

  // Resizable sidebar widths — also persisted
  const [leftWidth, setLeftWidth] = useState(() => readJSON<number>(SIDEBAR_LEFT_KEY, 320));
  const [rightWidth, setRightWidth] = useState(() => readJSON<number>(SIDEBAR_RIGHT_KEY, 380));
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toast = useToast();

  // --- Persistence effects -------------------------------------------------
  useEffect(() => {
    if (reportData) writeJSON(StorageKeys.report, reportData);
    else removeKey(StorageKeys.report);
  }, [reportData]);

  useEffect(() => {
    writeJSON(StorageKeys.equations, equations);
  }, [equations]);

  useEffect(() => {
    writeJSON(StorageKeys.glossary, Object.fromEntries(glossary));
  }, [glossary]);

  useEffect(() => {
    writeJSON(SIDEBAR_LEFT_KEY, leftWidth);
  }, [leftWidth]);

  useEffect(() => {
    writeJSON(SIDEBAR_RIGHT_KEY, rightWidth);
  }, [rightWidth]);

  // --- Recent reports ------------------------------------------------------
  const addRecentReport = useCallback((data: ReportData) => {
    const current = readJSON<RecentReport[]>(StorageKeys.recentReports, []);
    const entry: RecentReport = {
      id: data.id,
      filename: data.filename,
      total_pages: data.total_pages,
      file_size: data.file_size,
      upload_date: data.upload_date,
      file_path: data.file_path,
    };
    const deduped = [entry, ...current.filter(r => r.id !== data.id)].slice(0, RECENT_LIMIT);
    writeJSON(StorageKeys.recentReports, deduped);
  }, []);

  // --- Equation extraction -------------------------------------------------
  const extractVariables = (equation: string): string[] => {
    const stopWords = new Set(['the', 'of', 'in', 'and', 'or', 'for', 'is', 'at', 'by', 'an', 'to']);
    const vars = equation.match(/\b[a-zA-Z][a-zA-Z0-9_]*\b/g) || [];
    return [...new Set(vars.filter(v => v.length <= 6 && !stopWords.has(v.toLowerCase())))];
  };

  const extractEquations = useCallback(async (data: ReportData) => {
    setEquationsLoading(true);
    try {
      const result = await reportService.detectEquations(data.text);
      if (result && result.equations) {
        const formattedEqs: EquationItem[] = result.equations.map((eq: any, idx: number) => ({
          ...eq,
          id: eq.id ?? idx,
          variables: extractVariables(eq.equation),
        }));
        setEquations(formattedEqs);
        return;
      }
    } catch {
      /* fall through to client-side detection */
    } finally {
      setEquationsLoading(false);
    }

    // Fallback: tighter client-side patterns (fewer false positives)
    const text: string = data.text;
    const found: Set<string> = new Set();
    const detectedEquations: EquationItem[] = [];

    const patterns: { re: RegExp; fmt: string }[] = [
      { re: /\$[^$\n]{2,80}\$/g, fmt: 'latex' },
      { re: /\\\([^)]{2,100}\\\)/g, fmt: 'latex' },
      { re: /[a-zA-Z][a-zA-Z0-9_]{0,6}\s*=\s*[0-9-][^\n.;]{1,60}/g, fmt: 'numeric' },
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
            variables: extractVariables(clean),
          });
        }
      });
    });

    setEquations(detectedEquations);
  }, []);

  const handleReportUpload = useCallback(
    (data: ReportData) => {
      setReportData(data);
      setSelectedText('');
      setSearchQuery('');
      setSearchInput('');
      setEquations([]);
      addRecentReport(data);
      toast.success('PDF uploaded — analyzing document…');
      extractEquations(data);
    },
    [addRecentReport, extractEquations, toast]
  );

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

  const addToGlossary = useCallback(
    (term: string, definition: string) => {
      setGlossary(prev => {
        const next = new Map(prev);
        next.set(term.toLowerCase(), definition);
        return next;
      });
      toast.success(`Added "${term}" to glossary`);
    },
    [toast]
  );

  const removeFromGlossary = useCallback(
    (term: string) => {
      setGlossary(prev => {
        const next = new Map(prev);
        next.delete(term.toLowerCase());
        return next;
      });
      toast.info(`Removed "${term}"`);
    },
    [toast]
  );

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

  // Global keyboard shortcuts
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && reportData) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false);
        else if (showSearch) closeSearch();
        return;
      }
      if (e.key === '?' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [reportData, showSearch, showShortcuts, openSearch, closeSearch]);

  // --- Sidebar resize ------------------------------------------------------
  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);
  }, []);
  const handleMouseDownRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);
  }, []);

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

  // --- Drag-and-drop upload (global) --------------------------------------
  const uploadDroppedFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Only PDF files are supported.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('That PDF is larger than 50 MB.');
        return;
      }
      try {
        toast.info('Uploading PDF…');
        const data = (await reportService.uploadReport(file)) as ReportData;
        handleReportUpload(data);
      } catch {
        toast.error('Upload failed. Please try again.');
      }
    },
    [handleReportUpload, toast]
  );

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      dragCounter.current += 1;
      setIsDropping(true);
    };
    const onDragLeave = () => {
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDropping(false);
    };
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      dragCounter.current = 0;
      setIsDropping(false);
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      uploadDroppedFile(e.dataTransfer.files[0]);
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [uploadDroppedFile]);

  const handleUploadClick = () => {
    (document.querySelector('input[type="file"]') as HTMLInputElement)?.click();
  };

  const handleGoHome = () => {
    setReportData(null);
    setSelectedText('');
    setSearchQuery('');
    setSearchInput('');
    setShowSearch(false);
    setEquations([]);
    // Keep the glossary — it may contain cross-document terms the user wants to keep.
  };

  const handleLoadRecent = useCallback(
    (recent: RecentReport) => {
      // We don't keep full report text for recents (to save space); just re-point
      // the viewer at the PDF. The server will still have it available as long
      // as auto-cleanup hasn't removed it. If loading fails, we notify the user.
      toast.info(`Loading "${recent.filename}"…`);
      // We can't re-extract text without a round-trip — so we store a minimal
      // stub and the PDF view will still work. The text tools will show an
      // empty-state for text until a re-upload.
      setReportData({
        id: recent.id,
        filename: recent.filename,
        file_size: recent.file_size,
        upload_date: recent.upload_date,
        total_pages: recent.total_pages,
        text: '',
        pages: [],
        file_path: recent.file_path,
      });
    },
    [toast]
  );

  if (!reportData) {
    return (
      <div className="layout">
        <TopBar onReportUpload={handleReportUpload} onSearch={handleSearch} reportData={null} />
        <LandingPage onUploadClick={handleUploadClick} onLoadRecent={handleLoadRecent} />
        <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
        {isDropping && (
          <div className="drop-overlay" aria-hidden="true">
            <div className="drop-card">
              <span className="drop-icon">📥</span>
              <h2>Drop your PDF to upload</h2>
              <p>We'll read it and analyse equations automatically.</p>
            </div>
          </div>
        )}
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
        {!usePDFViewer && (
          <button
            className={`toggle-btn search-toggle-btn ${showSearch ? 'active' : ''}`}
            onClick={showSearch ? closeSearch : openSearch}
            title="Search in document (Ctrl+F)"
          >
            🔍 Search
          </button>
        )}
        <button
          className="toggle-btn"
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts (?)"
          aria-label="Show keyboard shortcuts"
        >
          ⌨️
        </button>
      </div>

      <div className="main-container">
        <div className="left-sidebar-wrapper" style={{ width: `${leftWidth}px` }}>
          <LeftSidebar
            reportData={reportData}
            equations={equations}
            equationsLoading={equationsLoading}
            glossary={glossary}
            onRemoveFromGlossary={removeFromGlossary}
          />
        </div>
        <div
          className={`resize-handle left-handle ${isDraggingLeft ? 'dragging' : ''}`}
          onMouseDown={handleMouseDownLeft}
          title="Drag to resize left panel"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize left sidebar"
        >
          <div className="handle-dot" />
        </div>

        <div className="center-content">
          {showSearch && !usePDFViewer && (
            <div className="floating-search">
              <span className="floating-search-icon" aria-hidden="true">🔍</span>
              <input
                ref={searchInputRef}
                className="floating-search-input"
                type="text"
                placeholder="Search in document…"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={e => e.key === 'Escape' && closeSearch()}
                aria-label="Search the document"
              />
              {searchInput && (
                <span className="floating-search-hint">↩ Enter · Esc to close</span>
              )}
              <button
                className="floating-search-close"
                onClick={closeSearch}
                title="Close (Esc)"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          )}

          {usePDFViewer ? (
            <PDFViewer reportData={reportData} onTextSelect={handleTextSelect} />
          ) : (
            <ReportReader
              reportData={reportData}
              searchQuery={searchQuery}
              onTextSelect={handleTextSelect}
            />
          )}
        </div>

        <div
          className={`resize-handle right-handle ${isDraggingRight ? 'dragging' : ''}`}
          onMouseDown={handleMouseDownRight}
          title="Drag to resize right panel"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize right sidebar"
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
      </div>

      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {isDropping && (
        <div className="drop-overlay" aria-hidden="true">
          <div className="drop-card">
            <span className="drop-icon">📥</span>
            <h2>Drop your PDF to replace the current one</h2>
            <p>We'll analyze it and load it into the tools.</p>
          </div>
        </div>
      )}
    </div>
  );
};
