import React, { useEffect, useRef, useState } from 'react';
import { reportService } from '../services/api';
import { describeApiError, isCancel } from '../utils/errors';
import { CopyButton } from './CopyButton';
import './GlossaryPanel.css';

interface GlossaryPanelProps {
  selectedText: string;
  glossary: Map<string, string>;
  onAddToGlossary: (term: string, definition: string) => void;
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  selectedText,
  glossary,
  onAddToGlossary,
}) => {
  const [definition, setDefinition] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Reset the per-term state when the selection changes.
  useEffect(() => {
    setDefinition('');
    setWarning('');
  }, [selectedText]);

  const handleDefineWord = async () => {
    setWarning('');
    setDefinition('');

    if (!selectedText.trim()) return;

    const words = selectedText.trim().split(/\s+/);
    if (words.length > 3) {
      setWarning('Select a single word or short phrase (max 3 words)');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const result = await reportService.extractDefinitions(selectedText, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setDefinition(result.definitions);
    } catch (err) {
      if (isCancel(err)) return;
      setWarning(describeApiError(err, 'definition'));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleAddToGlossary = () => {
    if (selectedText && definition) {
      onAddToGlossary(selectedText.toLowerCase(), definition);
      setDefinition('');
      setWarning('');
    }
  };

  return (
    <div className="glossary-panel">
      <h3>📚 Glossary Helper</h3>

      {selectedText && (
        <div className="glossary-input">
          <p className="selected-term">Term: "{selectedText}"</p>

          <button
            type="button"
            onClick={handleDefineWord}
            disabled={loading}
            className="define-btn"
          >
            {loading ? '⏳ Defining...' : '🔍 Define Term'}
          </button>

          {warning && <p className="glossary-warning" role="alert">⚠️ {warning}</p>}

          {loading && !warning && (
            <div className="skeleton-block" aria-busy="true">
              <span className="skeleton skeleton-line long" />
              <span className="skeleton skeleton-line medium" />
              <span className="skeleton skeleton-line short" />
            </div>
          )}

          {definition && !loading && (
            <div className="definition-result">
              <p>{definition}</p>
              <div className="definition-actions">
                <button
                  type="button"
                  onClick={handleAddToGlossary}
                  className="add-glossary-btn"
                >
                  ➕ Add to Glossary
                </button>
                <CopyButton text={definition} compact label="Copy definition" />
              </div>
            </div>
          )}
        </div>
      )}

      {glossary.size > 0 && (
        <div className="glossary-list">
          <h4>📖 Defined Terms ({glossary.size})</h4>
          <div className="terms-list">
            {Array.from(glossary.entries()).map(([term, def]) => (
              <div
                key={term}
                className={`glossary-entry ${selectedTerm === term ? 'selected' : ''}`}
                onClick={() => setSelectedTerm(selectedTerm === term ? null : term)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTerm(selectedTerm === term ? null : term);
                  }
                }}
              >
                <strong>{term}</strong>
                {selectedTerm === term && (
                  <div className="term-definition">
                    <p>{def}</p>
                    <CopyButton text={`${term}: ${def}`} compact label="Copy entry" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {glossary.size === 0 && !selectedText && (
        <p className="hint">Highlight a word to define it</p>
      )}
    </div>
  );
};
