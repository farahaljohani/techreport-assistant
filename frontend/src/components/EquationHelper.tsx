import React, { useEffect, useRef, useState } from 'react';
import { reportService } from '../services/api';
import { describeApiError, isCancel } from '../utils/errors';
import { readJSON, writeJSON, StorageKeys } from '../utils/storage';
import { useToast } from '../utils/toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './EquationHelper.css';

import type { EquationItem } from '../types';

interface EquationHelperProps {
  equations: EquationItem[];
  selectedEquation?: string;
}

export const EquationHelper: React.FC<EquationHelperProps> = ({
  equations,
  selectedEquation: _selectedEquation,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isLatex, setIsLatex] = useState(false);
  const [selectedEq, setSelectedEq] = useState<EquationItem | null>(null);
  const [explanation, setExplanation] = useState('');
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    const arr = readJSON<number[]>(StorageKeys.favoriteEquations, []);
    return new Set(arr);
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [allEquations, setAllEquations] = useState<EquationItem[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'detected' | 'manual'>('manual');
  const abortRef = useRef<AbortController | null>(null);
  const toast = useToast();

  useEffect(() => () => abortRef.current?.abort(), []);

  // Persist favorites whenever the set changes.
  useEffect(() => {
    writeJSON(StorageKeys.favoriteEquations, Array.from(favorites));
  }, [favorites]);

  useEffect(() => {
    const formatted: EquationItem[] = equations.map((eq, idx) => ({
      ...eq,
      id: eq.id ?? idx,
      isFavorite: favorites.has(eq.id ?? idx),
    }));
    setAllEquations(formatted);
  }, [equations, favorites]);

  const renderEquation = (eq: string, format: string = 'text'): string => {
    try {
      if (format === 'latex' || isLatex) {
        return katex.renderToString(eq, { throwOnError: false, displayMode: false });
      }
      return eq;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('KaTeX render error:', err);
      return eq;
    }
  };

  const handleExplainEquation = async (equation: EquationItem) => {
    setSelectedEq(equation);
    setExplanation('');
    setExplanationError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const result = await reportService.explainEquation(equation.equation, '', {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setExplanation(result.explanation);
      setAllEquations(prev =>
        prev.map(eq => (eq.id === equation.id ? { ...eq, explanation: result.explanation } : eq))
      );
    } catch (err) {
      if (isCancel(err)) return;
      setExplanationError(describeApiError(err, 'equation explanation'));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const newEquation: EquationItem = {
      id: Date.now(),
      equation: manualInput.trim(),
      format: isLatex ? 'latex' : 'text',
    };

    setAllEquations(prev => [newEquation, ...prev]);
    await handleExplainEquation(newEquation);
    setManualInput('');
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
    setAllEquations(prev =>
      prev.map(eq => (eq.id === id ? { ...eq, isFavorite: !eq.isFavorite } : eq))
    );
  };

  const copyToClipboard = async (text: string, id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Equation copied');
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error('Could not copy equation');
    }
  };

  const filteredEquations = allEquations
    .filter(eq => eq.equation.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(eq => !favoritesOnly || favorites.has(eq.id));

  const displayEquations =
    activeTab === 'detected'
      ? filteredEquations.filter(eq => eq.id < 1_000_000)
      : filteredEquations;

  return (
    <div className="equation-helper-modern">
      <div className="eq-header">
        <h3>📐 Equation Helper</h3>
        <span className="eq-count">{allEquations.length} total</span>
      </div>

      <div className="eq-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'manual'}
          className={`eq-tab ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          ✍️ Manual Input
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'detected'}
          className={`eq-tab ${activeTab === 'detected' ? 'active' : ''}`}
          onClick={() => setActiveTab('detected')}
        >
          🔍 Auto-Detected ({equations.length})
        </button>
      </div>

      {activeTab === 'manual' && (
        <form className="eq-manual-input" onSubmit={handleManualSubmit}>
          <div className="input-group">
            <label htmlFor="eq-manual" className="visually-hidden">
              Manual equation input
            </label>
            <textarea
              id="eq-manual"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Enter or paste an equation… (e.g., E = mc^2 or LaTeX: \frac{a}{b})"
              rows={3}
              className="eq-textarea"
            />
            <div className="input-controls">
              <label className="latex-toggle">
                <input
                  type="checkbox"
                  checked={isLatex}
                  onChange={e => setIsLatex(e.target.checked)}
                />
                <span>LaTeX Format</span>
              </label>
              <button type="submit" className="btn-explain" disabled={!manualInput.trim() || loading}>
                <span>{loading ? '⏳ Explaining…' : '✨ Explain'}</span>
              </button>
            </div>
          </div>

          {manualInput && (
            <div className="eq-preview">
              <span className="preview-label">Preview:</span>
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{
                  __html: renderEquation(manualInput, isLatex ? 'latex' : 'text'),
                }}
              />
            </div>
          )}
        </form>
      )}

      <div className="eq-search">
        <label htmlFor="eq-search-input" className="visually-hidden">Search equations</label>
        <input
          id="eq-search-input"
          type="text"
          placeholder="🔍 Search equations…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

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
          displayEquations.map(eq => (
            <div
              key={eq.id}
              className={`eq-card ${selectedEq?.id === eq.id ? 'selected' : ''}`}
              onClick={() => handleExplainEquation(eq)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleExplainEquation(eq);
                }
              }}
            >
              <div className="eq-card-header">
                <div className="eq-format-badge">{eq.format || 'text'}</div>
                <div className="eq-actions">
                  <button
                    type="button"
                    className={`btn-favorite ${eq.isFavorite ? 'active' : ''}`}
                    onClick={e => toggleFavorite(eq.id, e)}
                    title={eq.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={eq.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={!!eq.isFavorite}
                  >
                    {eq.isFavorite ? '⭐' : '☆'}
                  </button>
                  <button
                    type="button"
                    className="btn-copy"
                    onClick={e => copyToClipboard(eq.equation, eq.id, e)}
                    title="Copy equation"
                    aria-label="Copy equation"
                  >
                    {copiedId === eq.id ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="eq-display">
                {eq.format === 'latex' ? (
                  <div
                    className="eq-latex"
                    dangerouslySetInnerHTML={{ __html: renderEquation(eq.equation, eq.format) }}
                  />
                ) : (
                  <code className="eq-text">{eq.equation}</code>
                )}
              </div>

              {selectedEq?.id === eq.id && (
                <div className="eq-explanation-section">
                  {loading ? (
                    <div className="skeleton-block" aria-busy="true">
                      <span className="skeleton skeleton-line long" />
                      <span className="skeleton skeleton-line medium" />
                      <span className="skeleton skeleton-line short" />
                    </div>
                  ) : explanationError ? (
                    <div className="eq-explanation error" role="alert">
                      <div className="explanation-header">
                        <span className="icon" aria-hidden="true">⚠️</span>
                        <span>Couldn't explain</span>
                      </div>
                      <p>{explanationError}</p>
                    </div>
                  ) : explanation ? (
                    <div className="eq-explanation">
                      <div className="explanation-header">
                        <span className="icon" aria-hidden="true">💡</span>
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

      {favorites.size > 0 && (
        <div className="eq-favorites-bar">
          <button
            type="button"
            className={`favorites-toggle ${favoritesOnly ? 'active' : ''}`}
            onClick={() => setFavoritesOnly(v => !v)}
            title={favoritesOnly ? 'Show all equations' : 'Show favorites only'}
            aria-pressed={favoritesOnly}
          >
            <span className="favorites-label">
              {favoritesOnly ? '⭐ Showing favorites' : '☆ Show favorites only'} ({favorites.size})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
