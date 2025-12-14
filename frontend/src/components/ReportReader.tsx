import React, { useState, useRef, useCallback, useMemo } from 'react';
import './ReportReader.css';

interface ReportReaderProps {
  reportData: any | null;
  searchQuery: string;
  onTextSelect: (selectedText: string) => void;
}

export const ReportReader: React.FC<ReportReaderProps> = ({
  reportData,
  searchQuery,
  onTextSelect,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()?.toString() || '';
    if (selection && selection.length > 0) {
      setSelectedText(selection);
      onTextSelect(selection);
    }
  }, [onTextSelect]);

  // Memoize search highlighting to prevent unnecessary re-renders
  const highlightedContent = useMemo(() => {
    if (!reportData) return null;

    return reportData.text.split('\n').map((paragraph: string, idx: number) => {
      if (!paragraph.trim()) return <div key={idx} className="spacer" />;
      
      if (searchQuery && searchQuery.length > 0) {
        try {
          const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          const parts = paragraph.split(regex);
          return (
            <p key={idx} className="text-paragraph">
              {parts.map((part, partIdx) => 
                part.toLowerCase() === searchQuery.toLowerCase() 
                  ? <mark key={partIdx} className="search-highlight">{part}</mark> 
                  : part
              )}
            </p>
          );
        } catch (error) {
          console.warn('Search regex error:', error);
          return <p key={idx} className="text-paragraph">{paragraph}</p>;
        }
      }
      return <p key={idx} className="text-paragraph">{paragraph}</p>;
    });
  }, [reportData, searchQuery]);

  if (!reportData) {
    return (
      <div className="report-reader empty">
        <div className="empty-state">
          <p className="icon">📄</p>
          <p>Upload a report to begin reading</p>
          <p className="subtitle">📌 Tip: Highlight any text and use AI tools on the right</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-reader">
      <div className="report-header">
        <h2>{reportData.filename}</h2>
        <p className="report-meta">
          {reportData.total_pages} pages | {(reportData.file_size / 1024).toFixed(2)} KB
        </p>
        {selectedText && (
          <div className="selection-indicator">
            ✓ Selected: "{selectedText.substring(0, 40)}..."
          </div>
        )}
      </div>

      <div className="report-controls">
        <button 
          className="btn-copy"
          onClick={() => navigator.clipboard.writeText(reportData.text)}
          title="Copy all text"
        >
          📋 Copy All
        </button>
      </div>

      <div
        className="report-content"
        onMouseUp={handleTextSelection}
        ref={contentRef}
      >
        {highlightedContent}
      </div>
    </div>
  );
};
