import React, { useState } from 'react';
import { reportService } from '../services/api';
import './GlossaryPanel.css';

interface GlossaryPanelProps {
  selectedText: string;
  glossary: Map<string, string>;
  onAddToGlossary: (term: string, definition: string) => void;
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({ 
  selectedText, 
  glossary, 
  onAddToGlossary 
}) => {
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const handleDefineWord = async () => {
    if (!selectedText.trim()) return;

    const words = selectedText.trim().split(/\s+/);
    if (words.length > 3) {
      alert('Please select a single word or short phrase (max 3 words)');
      return;
    }

    setLoading(true);
    try {
      const result = await reportService.extractDefinitions(selectedText);
      setDefinition(result.definitions);
    } catch (error) {
      console.error('Error defining word:', error);
      setDefinition('❌ Could not get definition');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGlossary = () => {
    if (selectedText && definition) {
      onAddToGlossary(selectedText.toLowerCase(), definition);
      setDefinition('');
    }
  };

  return (
    <div className="glossary-panel">
      <h3>📚 Glossary Helper</h3>

      {selectedText && (
        <div className="glossary-input">
          <p className="selected-term">Term: "{selectedText}"</p>
          
          <button 
            onClick={handleDefineWord}
            disabled={loading}
            className="define-btn"
          >
            {loading ? '⏳ Defining...' : '🔍 Define Term'}
          </button>

          {definition && (
            <div className="definition-result">
              <p>{definition}</p>
              <button 
                onClick={handleAddToGlossary}
                className="add-glossary-btn"
              >
                ➕ Add to Glossary
              </button>
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
              >
                <strong>{term}</strong>
                {selectedTerm === term && (
                  <div className="term-definition">
                    <p>{def}</p>
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
