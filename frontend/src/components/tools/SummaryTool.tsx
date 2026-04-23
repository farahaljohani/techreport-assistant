import React, { useEffect, useRef, useState } from 'react';
import { reportService } from '../../services/api';
import { describeApiError, isCancel } from '../../utils/errors';
import { CopyButton } from '../CopyButton';
import type { ReportData } from '../../types';
import './SummaryTool.css';

interface SummaryToolProps {
  selectedText: string;
  reportData: ReportData | null;
}

export const SummaryTool: React.FC<SummaryToolProps> = ({ selectedText, reportData }) => {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request when unmounting or when the report changes.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );
  useEffect(() => {
    setSummary('');
    setError(null);
  }, [reportData?.id]);

  const handleSummarize = async () => {
    const text = selectedText || reportData?.text?.substring(0, 4000) || '';
    if (!text.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setSummary('');
    try {
      const result = await reportService.summarize(text, 200, { signal: controller.signal });
      if (!controller.signal.aborted) setSummary(result.summary);
    } catch (err) {
      if (isCancel(err)) return;
      setError(describeApiError(err, 'summary'));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const disabled = loading || (!selectedText && !reportData?.text);

  return (
    <div className="summary-tool">
      <div className="tool-info">
        {selectedText ? (
          <p className="selected-info">✓ Selected: "{selectedText.substring(0, 40)}..."</p>
        ) : (
          <p className="no-selection">Highlight text, or summarize the whole report</p>
        )}
      </div>

      <div className="tool-buttons">
        <button
          type="button"
          onClick={loading ? handleCancel : handleSummarize}
          disabled={!loading && disabled}
          className="tool-btn primary"
        >
          {loading ? '⏳ Summarizing… (click to cancel)' : '📋 Summarize'}
        </button>
      </div>

      {loading && (
        <div className="skeleton-block" aria-label="Generating summary" aria-busy="true">
          <span className="skeleton skeleton-line long" />
          <span className="skeleton skeleton-line medium" />
          <span className="skeleton skeleton-line long" />
          <span className="skeleton skeleton-line short" />
        </div>
      )}

      {!loading && error && (
        <div className="result error" role="alert">
          <h4>⚠️ Couldn't summarize</h4>
          <p>{error}</p>
        </div>
      )}

      {!loading && summary && (
        <div className="result success">
          <div className="result-head">
            <h4>📋 Summary</h4>
            <CopyButton text={summary} compact />
          </div>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};
