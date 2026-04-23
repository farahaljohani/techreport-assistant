import React, { useEffect, useState } from 'react';
import { readJSON, writeJSON, StorageKeys } from '../utils/storage';
import { useToast } from '../utils/toast';
import type { ReportData, EquationItem } from '../types';
import './LeftSidebar.css';

interface LeftSidebarProps {
  reportData: ReportData | null;
  equations: EquationItem[];
  equationsLoading?: boolean;
  glossary: Map<string, string>;
  onRemoveFromGlossary?: (term: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  reportData,
  equations,
  equationsLoading = false,
  glossary,
  onRemoveFromGlossary,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const stored = readJSON<string[] | null>(StorageKeys.expandedSidebar, null);
    return new Set(stored ?? ['outline']);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [equationSearch, setEquationSearch] = useState('');
  const [selectedEquation, setSelectedEquation] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const toast = useToast();

  useEffect(() => {
    writeJSON(StorageKeys.expandedSidebar, Array.from(expandedSections));
  }, [expandedSections]);

  const copyWithToast = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(['outline', 'bookmarks', 'equations', 'glossary', 'statistics']));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  // Filter glossary by search
  const filteredGlossary = searchTerm
    ? Array.from(glossary.entries()).filter(([term]) => 
        term.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : Array.from(glossary.entries());

  // Filter equations by search
  const filteredEquations = equationSearch
    ? equations.filter(eq => 
        eq.equation.toLowerCase().includes(equationSearch.toLowerCase())
      )
    : equations;

  // Calculate statistics
  const stats = {
    fileSize: reportData?.file_size ? (reportData.file_size / 1024).toFixed(2) : '0',
    uploadDate: reportData?.upload_date ? new Date(reportData.upload_date).toLocaleDateString() : 'N/A',
    wordCount: reportData?.text ? reportData.text.split(/\s+/).length : 0,
    charCount: reportData?.text ? reportData.text.length : 0,
  };

  return (
    <div className="left-sidebar">
      {/* Enhanced Header */}
      <div className="sidebar-header">
        <div className="header-top">
          <h2>📄 Document Overview</h2>
          <div className="header-actions">
            <button
              type="button"
              className="btn-icon"
              onClick={expandAll}
              title="Expand all sections"
              aria-label="Expand all sidebar sections"
            >
              ⊞
            </button>
            <button
              type="button"
              className="btn-icon"
              onClick={collapseAll}
              title="Collapse all sections"
              aria-label="Collapse all sidebar sections"
            >
              ⊟
            </button>
          </div>
        </div>
        <p className="doc-name">{reportData?.filename}</p>
        <div className="doc-badges">
          <span className="badge-pill">{reportData?.total_pages} pages</span>
          <span className="badge-pill">{stats.fileSize} KB</span>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item" title="Total pages in document">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">📄</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Pages</span>
            <span className="stat-value">{reportData?.total_pages || 0}</span>
          </div>
        </div>
        <div className="stat-item" title="Detected equations">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">📐</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Equations</span>
            <span className="stat-value">{equations.length}</span>
          </div>
        </div>
        <div className="stat-item" title="Glossary terms">
          <div className="stat-icon-wrapper">
            <span className="stat-icon">📚</span>
          </div>
          <div className="stat-details">
            <span className="stat-label">Terms</span>
            <span className="stat-value">{glossary.size}</span>
          </div>
        </div>
      </div>

      {/* Outline Section */}
      <div className="sidebar-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('outline')}
        >
          <span className="section-title">📑 Document Info</span>
          <span className={`arrow ${expandedSections.has('outline') ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.has('outline') && (
          <div className="section-content outline-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">📝 Title</span>
                <span className="info-value">{reportData?.filename.replace('.pdf', '')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📄 Pages</span>
                <span className="info-value">{reportData?.total_pages}</span>
              </div>
              <div className="info-item">
                <span className="info-label">📅 Uploaded</span>
                <span className="info-value">{stats.uploadDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">💾 Size</span>
                <span className="info-value">{stats.fileSize} KB</span>
              </div>
              <div className="info-item">
                <span className="info-label">📊 Words</span>
                <span className="info-value">{stats.wordCount.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🔤 Characters</span>
                <span className="info-value">{stats.charCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="sidebar-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('statistics')}
        >
          <span className="section-title">📊 Statistics</span>
          <span className={`arrow ${expandedSections.has('statistics') ? 'open' : ''}`}>▼</span>
        </button>
        {expandedSections.has('statistics') && (
          <div className="section-content statistics-content">
            <div className="stat-chart">
              <div className="chart-item">
                <span className="chart-label">Pages</span>
                <div className="chart-bar">
                  <div className="chart-fill" style={{ width: '100%', background: '#58a6ff' }} />
                </div>
                <span className="chart-value">{reportData?.total_pages || 0}</span>
              </div>
              <div className="chart-item">
                <span className="chart-label">Equations</span>
                <div className="chart-bar">
                  <div 
                    className="chart-fill" 
                    style={{ 
                      width: `${Math.min(100, (equations.length / (reportData?.total_pages || 1)) * 100)}%`,
                      background: '#238636'
                    }} 
                  />
                </div>
                <span className="chart-value">{equations.length}</span>
              </div>
              <div className="chart-item">
                <span className="chart-label">Terms</span>
                <div className="chart-bar">
                  <div 
                    className="chart-fill" 
                    style={{ 
                      width: `${Math.min(100, (glossary.size / 10) * 100)}%`,
                      background: '#f85149'
                    }} 
                  />
                </div>
                <span className="chart-value">{glossary.size}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Equations Section */}
      <div className="sidebar-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('equations')}
        >
          <span className="section-title">📐 Equations</span>
          {equationsLoading
            ? <span className="badge badge-blue" style={{ fontSize: '10px' }}>⏳ detecting…</span>
            : <span className="badge badge-green">{equations.length}</span>
          }
        </button>
        {expandedSections.has('equations') && (
          <div className="section-content equations-content">
            {equations.length > 0 && (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search equations..."
                  value={equationSearch}
                  onChange={(e) => setEquationSearch(e.target.value)}
                  className="search-input"
                />
                {equationSearch && (
                  <button 
                    className="clear-btn"
                    onClick={() => setEquationSearch('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {equationsLoading ? (
              <div className="empty-state">
                <span className="empty-icon" style={{ fontSize: '28px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
                <p>Detecting equations…</p>
                <small>Analysing document…</small>
              </div>
            ) : equations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📐</span>
                <p>No equations detected</p>
                <small>Equations will appear automatically</small>
              </div>
            ) : filteredEquations.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No matching equations</p>
                <small>Try a different search term</small>
              </div>
            ) : (
              <div className="equations-list">
                {filteredEquations.map((eq, i) => (
                  <div 
                    key={i} 
                    className={`equation-card ${selectedEquation === i ? 'selected' : ''}`}
                    onClick={() => setSelectedEquation(i === selectedEquation ? null : i)}
                  >
                    <div className="equation-header">
                      <span className="eq-number">#{i + 1}</span>
                      <button
                        type="button"
                        className="btn-copy-eq"
                        title="Copy equation"
                        aria-label="Copy equation"
                        onClick={(e) => { e.stopPropagation(); copyWithToast(eq.equation, 'Equation'); }}
                      >
                        📋
                      </button>
                    </div>
                    <code className="equation-code">
                      {selectedEquation === i ? eq.equation : eq.equation.substring(0, 40)}
                      {eq.equation.length > 40 && selectedEquation !== i && '...'}
                    </code>
                    {eq.variables && eq.variables.length > 0 && (
                      <div className="equation-vars">
                        <span className="vars-label">Variables:</span>
                        <div className="vars-list">
                          {eq.variables.slice(0, 5).map((v: string, idx: number) => (
                            <span key={idx} className="var-tag">{v}</span>
                          ))}
                          {eq.variables.length > 5 && (
                            <span className="var-tag">+{eq.variables.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Glossary Section */}
      <div className="sidebar-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('glossary')}
        >
          <span className="section-title">📚 Glossary</span>
          <div className="section-header-right">
            <span className="badge badge-blue">{glossary.size}</span>
            {expandedSections.has('glossary') && glossary.size > 0 && (
              <div className="view-toggle-small">
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setViewMode('list'); }}
                  title="List View"
                >
                  ☰
                </button>
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setViewMode('grid'); }}
                  title="Grid View"
                >
                  ⊞
                </button>
              </div>
            )}
          </div>
        </button>
        {expandedSections.has('glossary') && (
          <div className="section-content glossary-content">
            {glossary.size > 0 && (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {glossary.size === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <p>No terms defined yet</p>
                <small>Use the Glossary Tool to add definitions</small>
              </div>
            ) : filteredGlossary.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No matching terms</p>
                <small>Try a different search</small>
              </div>
            ) : (
              <div className={`terms-container ${viewMode}`}>
                {filteredGlossary.map(([term, def]) => (
                  <div key={term} className="glossary-card-new">
                    <div className="term-header">
                      <h4 className="term-title">{term}</h4>
                      <div className="term-actions">
                        <button
                          type="button"
                          className="btn-copy-term"
                          title="Copy definition"
                          aria-label={`Copy definition of ${term}`}
                          onClick={() => copyWithToast(`${term}: ${def}`, 'Definition')}
                        >
                          📋
                        </button>
                        {onRemoveFromGlossary && (
                          <button
                            type="button"
                            className="btn-remove-term"
                            title="Remove from glossary"
                            aria-label={`Remove ${term} from glossary`}
                            onClick={() => onRemoveFromGlossary(term)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="term-definition">{def}</p>
                    <div className="term-footer">
                      <span className="term-length">{def.length} chars</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="sidebar-footer">
        <div className="quick-actions">
          <button
            type="button"
            className="action-btn"
            title="Copy all equations to clipboard"
            aria-label="Copy all equations"
            onClick={() => {
              if (equations.length === 0) return;
              const text = equations.map((eq, i) => `#${i + 1}: ${eq.equation}`).join('\n');
              copyWithToast(text, `${equations.length} equations`);
            }}
            disabled={equations.length === 0}
          >
            <span className="action-icon" aria-hidden="true">📐</span>
            <span className="action-label">Copy Eqs</span>
          </button>
          <button
            type="button"
            className="action-btn"
            title="Export glossary as text file"
            aria-label="Export glossary as text"
            onClick={() => {
              if (glossary.size === 0) return;
              const text = Array.from(glossary.entries()).map(([t, d]) => `${t}: ${d}`).join('\n\n');
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'glossary.txt'; a.click();
              URL.revokeObjectURL(url);
              toast.success('Glossary downloaded');
            }}
            disabled={glossary.size === 0}
          >
            <span className="action-icon" aria-hidden="true">📥</span>
            <span className="action-label">Export</span>
          </button>
          <button
            type="button"
            className="action-btn"
            title="Copy document info to clipboard"
            aria-label="Copy document info"
            onClick={() => {
              const info = `File: ${reportData?.filename}\nPages: ${reportData?.total_pages}\nWords: ${stats.wordCount}\nEquations: ${equations.length}\nTerms: ${glossary.size}`;
              copyWithToast(info, 'Document info');
            }}
          >
            <span className="action-icon" aria-hidden="true">📋</span>
            <span className="action-label">Copy Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};
