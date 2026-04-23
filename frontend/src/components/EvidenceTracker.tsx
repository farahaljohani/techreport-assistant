import React, { useState } from 'react';
import { charIndexToPage } from '../utils/charToPage';
import { CopyButton } from './CopyButton';
import type { ReportData } from '../types';
import './EvidenceTracker.css';

interface EvidenceTrackerProps {
  selectedText: string;
  reportData: ReportData | null;
  onJumpToText?: (text: string) => void;
}

interface Source {
  claim: string;
  pageNumber: number | null;
  charIndex: number;
  context: string;
  type: string;
}

const detectType = (context: string): string => {
  const lower = context.toLowerCase();
  if (lower.includes('table') || lower.includes('tab.')) return 'Table';
  if (lower.includes('figure') || lower.includes('fig.')) return 'Figure';
  if (lower.includes('equation') || /[a-z]\s*=/i.test(context)) return 'Equation';
  return 'Text Reference';
};

export const EvidenceTracker: React.FC<EvidenceTrackerProps> = ({
  selectedText,
  reportData,
  onJumpToText,
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleFindSource = () => {
    if (!selectedText || !reportData) return;

    setSearching(true);
    setNotFound(false);
    setSources([]);

    try {
      const text = reportData.text || '';
      if (!text) {
        setNotFound(true);
        return;
      }

      let startIndex = text.indexOf(selectedText);
      if (startIndex === -1) {
        startIndex = text.toLowerCase().indexOf(selectedText.toLowerCase());
      }

      if (startIndex === -1) {
        setNotFound(true);
        return;
      }

      const contextStart = Math.max(0, startIndex - 500);
      const contextEnd = Math.min(text.length, startIndex + 500);
      const context = text.substring(contextStart, contextEnd);
      const pageNumber = charIndexToPage(reportData, startIndex);

      setSources([
        {
          claim: selectedText,
          pageNumber,
          charIndex: startIndex,
          context,
          type: detectType(context),
        },
      ]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error finding source:', err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="evidence-tracker">
      <h3>🔍 How Do You Know?</h3>

      {selectedText ? (
        <div className="evidence-input">
          <p className="claim-text">Claim: "{selectedText}"</p>

          <button
            type="button"
            onClick={handleFindSource}
            disabled={searching}
            className="source-btn"
          >
            {searching ? '⏳ Searching...' : '📍 Show Source'}
          </button>

          {notFound && (
            <p className="evidence-empty">
              ⚠️ Couldn't locate this exact text in the document. Try selecting a shorter, unique phrase.
            </p>
          )}

          {sources.length > 0 && (
            <div className="sources-list">
              {sources.map((source, i) => (
                <div key={i} className="source-item">
                  <div className="source-header">
                    <span className="source-type">{source.type}</span>
                    <span className="source-location">
                      {source.pageNumber
                        ? `Page ${source.pageNumber}`
                        : `Position ${source.charIndex}`}
                    </span>
                  </div>

                  <div className="source-context">
                    <p>{source.context}</p>
                  </div>

                  <div className="source-actions">
                    <button
                      type="button"
                      className="jump-to-btn"
                      onClick={() => onJumpToText?.(source.claim)}
                    >
                      ⬇️ Jump to Source
                    </button>
                    <CopyButton text={source.context} compact label="Copy context" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="hint">Highlight a claim to find its source</p>
      )}
    </div>
  );
};
