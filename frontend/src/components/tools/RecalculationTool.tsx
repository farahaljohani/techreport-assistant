import React, { useState } from 'react';
import { reportService } from '../../services/api';
import './RecalculationTool.css';

interface RecalculationToolProps {
  reportData: any | null;
}

export const RecalculationTool: React.FC<RecalculationToolProps> = ({ reportData }) => {
  const [equation, setEquation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplainEquation = async () => {
    if (!equation.trim()) {
      alert('Please enter an equation');
      return;
    }
    setLoading(true);
    try {
      const result = await reportService.explainEquation(
        equation,
        reportData?.filename || ''
      );
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Equation error:', error);
      setExplanation('Error explaining equation');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEquation('');
    setExplanation('');
  };

  return (
    <div className="recalculation-tool">
      <label>
        Enter equation or formula:
        <textarea
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="e.g., F = m * a&#10;or&#10;V = π * r² * h&#10;or&#10;P = F / A"
          rows={3}
          className="equation-input"
        />
      </label>

      <div className="button-group">
        <button 
          onClick={handleExplainEquation} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '⏳ Analyzing...' : '📐 Analyze Equation'}
        </button>
        
        {explanation && (
          <button 
            onClick={handleClear}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {explanation && (
        <div className="result success">
          <h4>✓ Step-by-step Analysis</h4>
          <p>{explanation}</p>
        </div>
      )}

      <div className="examples">
        <p className="examples-title">💡 Examples:</p>
        <ul>
          <li>F = m × a</li>
          <li>E = m × c²</li>
          <li>V = π × r² × h</li>
          <li>σ = P / A</li>
        </ul>
      </div>
    </div>
  );
};
