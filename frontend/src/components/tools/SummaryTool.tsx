import React, { useState } from 'react';
import { reportService } from '../../services/api';
import './SummaryTool.css';

interface SummaryToolProps {
  selectedText: string;
  reportData: any | null;
}

export const SummaryTool: React.FC<SummaryToolProps> = ({ selectedText, reportData }) => {
  const [summary, setSummary] = useState('');
  const [explanation, setExplanation] = useState('');
  const [definitions, setDefinitions] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeResult, setActiveResult] = useState<'summary' | 'explain' | 'define' | null>(null);

  const handleSummarize = async () => {
    if (!selectedText && !reportData?.text) {
      alert('Please select text or upload a report first');
      return;
    }
    
    setLoading(true);
    setActiveResult('summary');
    try {
      const text = selectedText || reportData?.text?.substring(0, 2000) || '';
      console.log('Summarizing:', text.substring(0, 100));
      
      const result = await reportService.summarize(text, 200);
      console.log('Summary result:', result);
      
      setSummary(result.summary);
      setExplanation('');
      setDefinitions('');
    } catch (error) {
      console.error('Summarize error:', error);
      setSummary('❌ Error generating summary. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!selectedText) {
      alert('Please highlight text first');
      return;
    }
    
    setLoading(true);
    setActiveResult('explain');
    try {
      console.log('Explaining:', selectedText.substring(0, 100));
      
      const result = await reportService.explain(selectedText, reportData?.filename || '');
      console.log('Explanation result:', result);
      
      setExplanation(result.explanation);
      setSummary('');
      setDefinitions('');
    } catch (error) {
      console.error('Explain error:', error);
      setExplanation('❌ Error generating explanation. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractDefinitions = async () => {
    if (!selectedText) {
      alert('Please highlight text first');
      return;
    }
    
    setLoading(true);
    setActiveResult('define');
    try {
      console.log('Extracting definitions from:', selectedText.substring(0, 100));
      
      const result = await reportService.extractDefinitions(selectedText);
      console.log('Definitions result:', result);
      
      setDefinitions(result.definitions);
      setSummary('');
      setExplanation('');
    } catch (error) {
      console.error('Definition extraction error:', error);
      setDefinitions('❌ Error extracting definitions. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-tool">
      <div className="tool-info">
        {selectedText ? (
          <p className="selected-info">✓ Selected: "{selectedText.substring(0, 40)}..."</p>
        ) : (
          <p className="no-selection">Highlight text to use these tools</p>
        )}
      </div>

      <div className="tool-buttons">
        <button 
          onClick={handleSummarize} 
          disabled={loading || !selectedText && !reportData?.text}
          className="tool-btn primary"
        >
          {loading && activeResult === 'summary' ? '⏳ Summarizing...' : '📋 Summarize'}
        </button>

        {selectedText && (
          <>
            <button 
              onClick={handleExplain} 
              disabled={loading}
              className="tool-btn"
            >
              {loading && activeResult === 'explain' ? '⏳ Explaining...' : '💡 Explain'}
            </button>

            <button 
              onClick={handleExtractDefinitions} 
              disabled={loading}
              className="tool-btn"
            >
              {loading && activeResult === 'define' ? '⏳ Extracting...' : '📚 Definitions'}
            </button>
          </>
        )}
      </div>

      {summary && activeResult === 'summary' && (
        <div className="result success">
          <h4>📋 Summary</h4>
          <p>{summary}</p>
        </div>
      )}

      {explanation && activeResult === 'explain' && (
        <div className="result success">
          <h4>💡 Explanation</h4>
          <p>{explanation}</p>
        </div>
      )}

      {definitions && activeResult === 'define' && (
        <div className="result success">
          <h4>📚 Key Terms</h4>
          <p>{definitions}</p>
        </div>
      )}
    </div>
  );
};
