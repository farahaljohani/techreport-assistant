import React, { useState, useEffect, useRef } from 'react';
import { reportService } from '../services/api';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './EquationHelper.css';

interface EquationHelperProps {
  equations: any[];
  selectedEquation?: string;
}

interface EquationData {
  id: number;
  equation: string;
  format?: string;
  explanation?: string;
  isFavorite?: boolean;
}

export const EquationHelper: React.FC<EquationHelperProps> = ({ 
  equations, 
  selectedEquation 
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isLatex, setIsLatex] = useState(false);
  const [selectedEq, setSelectedEq] = useState<EquationData | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [allEquations, setAllEquations] = useState<EquationData[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'detected' | 'manual'>('manual');

  useEffect(() => {
    // Update equations when props change
    const formatted = equations.map((eq, idx) => ({
      ...eq,
      id: eq.id ?? idx,
      isFavorite: favorites.has(eq.id ?? idx)
    }));
    setAllEquations(formatted);
  }, [equations]);

  const renderEquation = (eq: string, format: string = 'text'): string => {
    try {
      if (format === 'latex' || isLatex) {
        return katex.renderToString(eq, {
          throwOnError: false,
          displayMode: false
        });
      }
      return eq;
    } catch (error) {
      console.error('KaTeX render error:', error);
      return eq;
    }
  };

  const handleExplainEquation = async (equation: EquationData) => {
    setSelectedEq(equation);
    setLoading(true);
    try {
      const result = await reportService.explainEquation(equation.equation);
      setExplanation(result.explanation);
      
      // Update equation with explanation
      setAllEquations(prev => prev.map(eq => 
        eq.id === equation.id ? { ...eq, explanation: result.explanation } : eq
      ));
    } catch (error) {
      console.error('Error explaining equation:', error);
      setExplanation('❌ Could not explain equation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const newEquation: EquationData = {
      id: Date.now(),
      equation: manualInput.trim(),
      format: isLatex ? 'latex' : 'text'
    };

    setAllEquations(prev => [newEquation, ...prev]);
    await handleExplainEquation(newEquation);
    setManualInput('');
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    setAllEquations(prev => prev.map(eq => 
      eq.id === id ? { ...eq, isFavorite: !eq.isFavorite } : eq
    ));
  };

  const copyToClipboard = (text: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEquations = allEquations.filter(eq => 
    eq.equation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayEquations = activeTab === 'detected' 
    ? filteredEquations.filter(eq => eq.id < 1000000) // Original equations have smaller IDs
    : filteredEquations;

  return (
    <div className="equation-helper-modern">
      <div className="eq-header">
        <h3>📐 Equation Helper</h3>
        <span className="eq-count">{allEquations.length} total</span>
      </div>

      {/* Tab Selector */}
      <div className="eq-tabs">
        <button 
          className={`eq-tab ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          ✍️ Manual Input
        </button>
        <button 
          className={`eq-tab ${activeTab === 'detected' ? 'active' : ''}`}
          onClick={() => setActiveTab('detected')}
        >
          🔍 Auto-Detected ({equations.length})
        </button>
      </div>

      {/* Manual Input Section */}
      {activeTab === 'manual' && (
        <form className="eq-manual-input" onSubmit={handleManualSubmit}>
          <div className="input-group">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter or paste an equation... (e.g., E = mc^2 or LaTeX: \frac{a}{b})"
              rows={3}
              className="eq-textarea"
            />
            <div className="input-controls">
              <label className="latex-toggle">
                <input
                  type="checkbox"
                  checked={isLatex}
                  onChange={(e) => setIsLatex(e.target.checked)}
                />
                <span>LaTeX Format</span>
              </label>
              <button type="submit" className="btn-explain" disabled={!manualInput.trim()}>
                <span>✨ Explain</span>
              </button>
            </div>
          </div>
          
          {manualInput && (
            <div className="eq-preview">
              <span className="preview-label">Preview:</span>
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ 
                  __html: renderEquation(manualInput, isLatex ? 'latex' : 'text') 
                }}
              />
            </div>
          )}
        </form>
      )}

      {/* Search Bar */}
      <div className="eq-search">
        <input
          type="text"
          placeholder="🔍 Search equations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Equations List */}
      <div className="equations-list-modern">
        {displayEquations.length === 0 ? (
          <div className="eq-empty">
            <p>
              {activeTab === 'manual' 
                ? '📝 Enter an equation above to get started' 
                : '🔍 No equations detected in document'}
            </p>
          </div>
        ) : (
          displayEquations.map((eq) => (
            <div 
              key={eq.id}
              className={`eq-card ${selectedEq?.id === eq.id ? 'selected' : ''}`}
              onClick={() => handleExplainEquation(eq)}
            >
              <div className="eq-card-header">
                <div className="eq-format-badge">{eq.format || 'text'}</div>
                <div className="eq-actions">
                  <button
                    className={`btn-favorite ${eq.isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(eq.id, e)}
                    title={eq.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {eq.isFavorite ? '⭐' : '☆'}
                  </button>
                  <button
                    className="btn-copy"
                    onClick={(e) => copyToClipboard(eq.equation, eq.id, e)}
                    title="Copy equation"
                  >
                    {copiedId === eq.id ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              
              <div className="eq-display">
                {eq.format === 'latex' ? (
                  <div 
                    className="eq-latex"
                    dangerouslySetInnerHTML={{ 
                      __html: renderEquation(eq.equation, eq.format) 
                    }}
                  />
                ) : (
                  <code className="eq-text">{eq.equation}</code>
                )}
              </div>

              {selectedEq?.id === eq.id && (
                <div className="eq-explanation-section">
                  {loading ? (
                    <div className="eq-loading">
                      <div className="spinner"></div>
                      <span>Analyzing equation...</span>
                    </div>
                  ) : explanation ? (
                    <div className="eq-explanation">
                      <div className="explanation-header">
                        <span className="icon">💡</span>
                        <span>Explanation</span>
                      </div>
                      <p>{explanation}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Favorites Quick Access */}
      {favorites.size > 0 && (
        <div className="eq-favorites-bar">
          <span className="favorites-label">⭐ Favorites ({favorites.size})</span>
        </div>
      )}
    </div>
  );
};
