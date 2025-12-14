import React, { useState } from 'react';
import { reportService } from '../services/api';
import './AskAnythingBox.css';

interface AskAnythingBoxProps {
  reportData: any;
}

export const AskAnythingBox: React.FC<AskAnythingBoxProps> = ({ reportData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || !reportData) return;

    setLoading(true);
    try {
      // Send the question with full document context
      const result = await reportService.askQuestion(
        question,
        reportData.text  // ← Pass the full report text here
      );
      
      setAnswer(result.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('❌ Error getting answer. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleAsk();
    }
  };

  return (
    <div className="ask-box">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask about this report..."
        className="ask-input"
        rows={3}
      />

      <button 
        onClick={handleAsk}
        disabled={loading || !question.trim()}
        className="ask-btn"
      >
        {loading ? '⏳ Asking...' : '🔍 Ask'}
      </button>

      {answer && (
        <div className="answer-box">
          <h4>✓ Answer</h4>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
