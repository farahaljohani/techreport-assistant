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
  const [metadata, setMetadata] = useState<any>(null);
  const [equations, setEquations] = useState<any[]>([]);
  
  // Resizable sidebar widths
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(380);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReportUpload = (data: any) => {
    console.log('Report data received:', data);
    setReportData(data);
    setSelectedText('');
    // Extract metadata
    extractMetadata(data);
    // Extract equations
    extractEquations(data);
  };

  const extractMetadata = (data: any) => {
    // Auto-detect metadata from PDF
    const meta = {
      title: data.filename.replace('.pdf', ''),
      authors: 'Auto-detected',
      keywords: [],
      uploadDate: data.upload_date,
      pageCount: data.total_pages
    };
    setMetadata(meta);
  };

  const extractEquations = async (data: any) => {
    try {
      // Use backend equation detection for better results
      const result = await reportService.detectEquations(data.text);
      
      if (result && result.equations) {
        const formattedEqs = result.equations.map((eq: any) => ({
          ...eq,
          variables: extractVariables(eq.equation)
        }));
        
        setEquations(formattedEqs);
        console.log(`✅ Detected ${formattedEqs.length} equations using backend service`);
      }
    } catch (error) {
      console.error('Backend equation detection failed, using fallback:', error);
      
      // Fallback: Client-side detection with improved patterns
      const patterns = [
        // LaTeX inline: $...$
        /\$([^\$]+)\$/g,
        // Standard equations: x = ...
        /[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^\n.!?;:]{3,80}/g,
        // Math symbols
        /[^\n]*[∫∑∏√±≈≤≥∞∂∇⊗⊕∈∉∀∃][^\n]{5,100}/g,
      ];
      
      const detectedEquations: any[] = [];
      let id = 0;
      
      patterns.forEach(pattern => {
        const matches = data.text.match(pattern) || [];
        matches.forEach((eq: string) => {
          const cleanEq = eq.replace(/\s+/g, ' ').trim();
          if (cleanEq.length > 3) {
            detectedEquations.push({
              id: id++,
              equation: cleanEq,
              format: pattern === patterns[0] ? 'latex' : 'text',
              variables: extractVariables(cleanEq)
            });
          }
        });
      });
      
      // Remove duplicates
      const uniqueEqs = Array.from(new Map(
        detectedEquations.map((eq: any) => [eq.equation.toLowerCase(), eq])
      ).values());
      
      setEquations(uniqueEqs);
      console.log(`⚠️ Using fallback: Found ${uniqueEqs.length} equations`);
    }
  };

  const extractVariables = (equation: string): string[] => {
    const varRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    return [...new Set(equation.match(varRegex) || [])];
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleTextSelect = useCallback((text: string) => {
    setSelectedText(text);
  }, []);

  const addToGlossary = useCallback((term: string, definition: string) => {
    setGlossary(prev => {
      const newGlossary = new Map(prev);
      newGlossary.set(term.toLowerCase(), definition);
      return newGlossary;
    });
  }, []);

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
      if (isDraggingLeft) {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isDraggingRight) {
        const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      
      // Clear any pending timeouts
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
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
    // Trigger file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  };

  // Show landing page if no report
  if (!reportData) {
    return (
      <div className="layout">
        <TopBar 
          onReportUpload={handleReportUpload} 
          onSearch={handleSearch}
          reportData={reportData}
        />
        <LandingPage onUploadClick={handleUploadClick} />
      </div>
    );
  }

  // Show full app when report is loaded
  return (
    <div className="layout">
      <TopBar 
        onReportUpload={handleReportUpload} 
        onSearch={handleSearch}
        reportData={reportData}
      />
      
      {reportData && (
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
        </div>
      )}
      
      <div className="main-container">
        {/* Left Sidebar */}
        {reportData && (
          <>
            <div className="left-sidebar-wrapper" style={{ width: `${leftWidth}px` }}>
              <LeftSidebar reportData={reportData} equations={equations} glossary={glossary} />
            </div>
            <div 
              className={`resize-handle left-handle ${isDraggingLeft ? 'dragging' : ''}`}
              onMouseDown={handleMouseDownLeft}
              title="Drag to resize left panel"
            >
              <div className="handle-dot"></div>
            </div>
          </>
        )}
        
        {/* Center - Report Reader */}
        <div className="center-content">
          {usePDFViewer && reportData ? (
            <PDFViewer 
              reportData={reportData}
              onTextSelect={handleTextSelect}
            />
          ) : (
            <ReportReader
              reportData={reportData}
              searchQuery={searchQuery}
              onTextSelect={handleTextSelect}
            />
          )}
        </div>
        
        {/* Right Sidebar - Tools */}
        {reportData && (
          <>
            <div 
              className={`resize-handle right-handle ${isDraggingRight ? 'dragging' : ''}`}
              onMouseDown={handleMouseDownRight}
              title="Drag to resize right panel"
            >
              <div className="handle-dot"></div>
            </div>
            <div className="right-sidebar-wrapper" style={{ width: `${rightWidth}px` }}>
              <ToolsPanel 
                reportData={reportData} 
                selectedText={selectedText}
                onAddToGlossary={addToGlossary}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
