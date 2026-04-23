import React, { useEffect, useRef, useState } from 'react';
import { reportService } from '../services/api';
import { describeApiError, isCancel } from '../utils/errors';
import { readJSON, writeJSON, StorageKeys } from '../utils/storage';
import { useToast } from '../utils/toast';
import { CopyButton } from './CopyButton';
import type { ReportData } from '../types';
import './AskAnythingBox.css';

interface AskAnythingBoxProps {
  reportData: ReportData | null;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

// One conversation per report — keyed by report id.
function loadHistory(reportId?: string): Message[] {
  if (!reportId) return [];
  const all = readJSON<Record<string, Message[]>>(StorageKeys.askHistory, {});
  return all[reportId] || [];
}
function saveHistory(reportId: string, messages: Message[]) {
  const all = readJSON<Record<string, Message[]>>(StorageKeys.askHistory, {});
  all[reportId] = messages.slice(-20); // keep the last 20 turns
  writeJSON(StorageKeys.askHistory, all);
}

export const AskAnythingBox: React.FC<AskAnythingBoxProps> = ({ reportData }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => loadHistory(reportData?.id));
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Load this report's history whenever the report changes.
  useEffect(() => {
    setMessages(loadHistory(reportData?.id));
  }, [reportData?.id]);

  // Persist whenever messages change.
  useEffect(() => {
    if (reportData?.id) saveHistory(reportData.id, messages);
  }, [messages, reportData?.id]);

  // Auto-scroll to the bottom when a new message arrives.
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages.length, loading]);

  // Cancel any in-flight request on unmount.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || !reportData) return;
    if (!reportData.text) {
      toast.error('This report has no extracted text yet — re-upload it to ask questions.');
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const result = await reportService.askQuestion(q, reportData.text, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: result.answer || '(no answer)' },
      ]);
    } catch (err) {
      if (isCancel(err)) return;
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: describeApiError(err, 'answer'),
          error: true,
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    toast.info('Conversation cleared');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleAsk();
    }
  };

  return (
    <div className="ask-box">
      {messages.length > 0 && (
        <div className="ask-history-head">
          <span className="ask-history-count">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
          <button
            type="button"
            className="ask-clear-btn"
            onClick={handleClear}
            title="Clear conversation"
          >
            Clear
          </button>
        </div>
      )}

      {messages.length > 0 && (
        <div className="conversation-history" ref={historyRef} aria-live="polite">
          {messages.map(m => (
            <div key={m.id} className={`message ${m.role}`}>
              <span className="message-badge" aria-hidden="true">
                {m.role === 'user' ? '👤' : m.error ? '⚠️' : '🤖'}
              </span>
              <div className="message-content">
                <p>{m.text}</p>
                {m.role === 'assistant' && !m.error && (
                  <div className="message-actions">
                    <CopyButton text={m.text} compact />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <span className="message-badge" aria-hidden="true">🤖</span>
              <div className="message-content">
                <div className="skeleton-block" aria-busy="true">
                  <span className="skeleton skeleton-line long" />
                  <span className="skeleton skeleton-line medium" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <label htmlFor="ask-input" className="visually-hidden">
        Ask a question about the document
      </label>
      <textarea
        id="ask-input"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          reportData
            ? 'Ask about this report… (Enter to send · Shift+Enter for newline)'
            : 'Upload a report first'
        }
        className="ask-input"
        rows={3}
        disabled={!reportData}
      />

      <div className="ask-actions-row">
        <button
          type="button"
          onClick={loading ? handleCancel : handleAsk}
          disabled={!loading && (!question.trim() || !reportData)}
          className="ask-btn"
        >
          {loading ? '⏹ Cancel' : '🔍 Ask'}
        </button>
      </div>
    </div>
  );
};
