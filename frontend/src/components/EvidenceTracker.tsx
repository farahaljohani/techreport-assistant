import React, { useState } from 'react';
import './EvidenceTracker.css';

interface EvidenceTrackerProps {
  selectedText: string;
  reportData: any;
}

export const EvidenceTracker: React.FC<EvidenceTrackerProps> = ({ 
  selectedText, 
  reportData 
}) => {
  const [sources, setSources] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleFindSource = () => {
    if (!selectedText || !reportData) return;

    setSearching(true);
    try {
      // Find where this text appears in the document
      const text = reportData.text;
      const startIndex = text.indexOf(selectedText);
      
      if (startIndex !== -1) {
        // Look for nearby figures, tables, equations
        const contextStart = Math.max(0, startIndex - 500);
        const contextEnd = Math.min(text.length, startIndex + 500);
        const context = text.substring(contextStart, contextEnd);

        const evidence = {
          claim: selectedText,
          location: `Character position: ${startIndex}`,
          context: context,
          type: detectType(context)
        };

        setSources([evidence]);
      }
    } catch (error) {
      console.error('Error finding source:', error);
    } finally {
      setSearching(false);
    }
  };

  const detectType = (context: string): string => {
    if (context.toLowerCase().includes('table') || context.toLowerCase().includes('tab.')) {
      return 'Table';
    } else if (context.toLowerCase().includes('figure') || context.toLowerCase().includes('fig.')) {
      return 'Figure';
    } else if (context.toLowerCase().includes('equation') || context.match(/[a-z]\s*=/i)) {
      return 'Equation';
    }
    return 'Text Reference';
  };

  return (
    <div className="evidence-tracker">
      <h3>🔍 How Do You Know?</h3>

      {selectedText && (
        <div className="evidence-input">
          <p className="claim-text">Claim: "{selectedText}"</p>
          
          <button 
            onClick={handleFindSource}
            disabled={searching}
            className="source-btn"
          >
            {searching ? '⏳ Searching...' : '📍 Show Source'}
          </button>

          {sources.length > 0 && (
            <div className="sources-list">
              {sources.map((source, i) => (
                <div key={i} className="source-item">
                  <div className="source-header">
                    <span className="source-type">{source.type}</span>
                    <span className="source-location">{source.location}</span>
                  </div>
                  
                  <div className="source-context">
                    <p>{source.context}</p>
                  </div>

                  <button className="jump-to-btn">
                    ⬇️ Jump to Source
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedText && (
        <p className="hint">Highlight a claim to find its source</p>
      )}
    </div>
  );
};
