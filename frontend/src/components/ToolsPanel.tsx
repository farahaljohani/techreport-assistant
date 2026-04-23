import React, { useEffect, useRef, useState } from 'react';
import { SummaryTool } from './tools/SummaryTool';
import { GlossaryPanel } from './GlossaryPanel';
import { EvidenceTracker } from './EvidenceTracker';
import { EquationHelper } from './EquationHelper';
import { ISACalculator } from './ISACalculator';
import { UnitConverterTool } from './tools/UnitConverter';
import { AskAnythingBox } from './AskAnythingBox';
import { CopyButton } from './CopyButton';
import { reportService } from '../services/api';
import { describeApiError, isCancel } from '../utils/errors';
import { readJSON, writeJSON, StorageKeys } from '../utils/storage';
import type { ReportData, EquationItem } from '../types';
import './ToolsPanel.css';

interface ToolsPanelProps {
  reportData: ReportData | null;
  selectedText: string;
  glossary: Map<string, string>;
  equations: EquationItem[];
  onAddToGlossary?: (term: string, definition: string) => void;
  onJumpToText?: (text: string) => void;
}

interface AccordionSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const sections: AccordionSection[] = [
  { id: 'summary',       title: 'Summary Tool',     icon: '📋', description: 'Auto summary of page/selection • Bullet-point extraction' },
  { id: 'glossary',      title: 'Glossary Tool',    icon: '📚', description: 'Definitions of highlighted terms' },
  { id: 'explanation',   title: 'Explanation Tool', icon: '💡', description: 'Explain selected text • Rewrite in simple English' },
  { id: 'evidence',      title: 'Evidence Tracker', icon: '🔍', description: 'Sources for claims/numbers • "How Do You Know?"' },
  { id: 'equation',      title: 'Equation Helper',  icon: '📐', description: 'List of all equations • View variables/units' },
  { id: 'recalculation', title: 'ISA Calculator',   icon: '🧮', description: 'ISA atmosphere • Altitude, temperature & pressure' },
  { id: 'unit',          title: 'Unit Converter',   icon: '🔄', description: 'Auto-detect numbers • Convert units' },
  { id: 'ask',           title: 'Ask-Anything Box', icon: '🤔', description: 'User Q&A with report context' },
];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  reportData,
  selectedText,
  glossary,
  equations,
  onAddToGlossary,
  onJumpToText,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const stored = readJSON<string[] | null>(StorageKeys.expandedTools, null);
    return new Set(stored ?? ['summary']);
  });
  const [explanation, setExplanation] = useState<{ text: string; mode: string } | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const explainAbortRef = useRef<AbortController | null>(null);

  useEffect(() => () => explainAbortRef.current?.abort(), []);

  useEffect(() => {
    writeJSON(StorageKeys.expandedTools, Array.from(expandedSections));
  }, [expandedSections]);

  const expandAll = () => setExpandedSections(new Set(sections.map(s => s.id)));
  const collapseAll = () => setExpandedSections(new Set());

  const handleAddToGlossary = (term: string, definition: string) => {
    onAddToGlossary?.(term, definition);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  const handleExplain = async (mode: 'explain' | 'simplify') => {
    if (!selectedText) return;
    setExplaining(true);
    setExplanation(null);
    setExplanationError(null);

    explainAbortRef.current?.abort();
    const controller = new AbortController();
    explainAbortRef.current = controller;

    try {
      const result = await reportService.explain(
        selectedText,
        reportData?.text?.substring(0, 500) || '',
        { signal: controller.signal }
      );
      if (controller.signal.aborted) return;
      setExplanation({
        text: result.explanation || result.result || JSON.stringify(result),
        mode,
      });
    } catch (err) {
      if (isCancel(err)) return;
      setExplanationError(describeApiError(err, 'explanation'));
    } finally {
      if (!controller.signal.aborted) setExplaining(false);
    }
  };

  const handleCancelExplain = () => {
    explainAbortRef.current?.abort();
    setExplaining(false);
  };

  const hasActiveContent = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'glossary':    return glossary.size > 0;
      case 'equation':    return equations.length > 0;
      case 'explanation': return selectedText.length > 0;
      case 'evidence':    return selectedText.length > 0;
      default:            return false;
    }
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'summary':
        return <SummaryTool selectedText={selectedText} reportData={reportData} />;

      case 'glossary':
        return (
          <GlossaryPanel
            selectedText={selectedText}
            glossary={glossary}
            onAddToGlossary={handleAddToGlossary}
          />
        );

      case 'explanation':
        return (
          <div className="explanation-tool">
            {!selectedText ? (
              <p className="tool-hint">💡 Highlight any text in the document to get an explanation</p>
            ) : (
              <div className="explanation-content">
                <h4>Selected Text:</h4>
                <p className="selected-preview">
                  "{selectedText.substring(0, 200)}{selectedText.length > 200 ? '…' : ''}"
                </p>
                <div className="explanation-buttons">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => (explaining ? handleCancelExplain() : handleExplain('explain'))}
                    disabled={!explaining && !selectedText}
                  >
                    {explaining ? '⏳ Cancel' : '🔬 Explain This'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleExplain('simplify')}
                    disabled={explaining}
                  >
                    {explaining ? '…' : '✏️ Simplify'}
                  </button>
                </div>

                {explaining && (
                  <div className="skeleton-block" aria-busy="true">
                    <span className="skeleton skeleton-line long" />
                    <span className="skeleton skeleton-line medium" />
                    <span className="skeleton skeleton-line long" />
                    <span className="skeleton skeleton-line short" />
                  </div>
                )}

                {!explaining && explanationError && (
                  <div className="explanation-box error" role="alert">
                    <strong className="explanation-label error-label">⚠️ Couldn't get explanation</strong>
                    {explanationError}
                  </div>
                )}

                {!explaining && explanation && !explanationError && (
                  <div className="explanation-box">
                    <div className="explanation-head">
                      <strong className="explanation-label">
                        {explanation.mode === 'simplify' ? 'Simplified' : 'Explanation'}
                      </strong>
                      <CopyButton text={explanation.text} compact />
                    </div>
                    <p className="explanation-body">{explanation.text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'evidence':
        return (
          <EvidenceTracker
            selectedText={selectedText}
            reportData={reportData}
            onJumpToText={onJumpToText}
          />
        );

      case 'equation':
        return <EquationHelper equations={equations} selectedEquation={selectedText} />;

      case 'recalculation':
        return <ISACalculator />;

      case 'unit':
        return <UnitConverterTool />;

      case 'ask':
        return <AskAnythingBox reportData={reportData} />;

      default:
        return null;
    }
  };

  const activeToolsCount = sections.filter(s => hasActiveContent(s.id)).length;
  const expandedCount = expandedSections.size;

  return (
    <div className="tools-panel">
      <div className="tools-header">
        <div className="header-top-row">
          <div className="header-title-section">
            <h2>🛠️ Tools</h2>
            <div className="tools-badges">
              <span className="tool-badge badge-active">{activeToolsCount} Active</span>
              <span className="tool-badge badge-expanded">{expandedCount}/{sections.length} Open</span>
            </div>
          </div>
          <div className="header-actions-row">
            <button
              type="button"
              className="btn-icon-tools"
              onClick={expandAll}
              title="Expand all sections"
              aria-label="Expand all tool sections"
            >
              ⊞
            </button>
            <button
              type="button"
              className="btn-icon-tools"
              onClick={collapseAll}
              title="Collapse all sections"
              aria-label="Collapse all tool sections"
            >
              ⊟
            </button>
          </div>
        </div>
        <p className="header-subtitle">Select &amp; analyze report content</p>
      </div>

      <div className="accordion-container">
        {sections.map(section => (
          <div
            key={section.id}
            className={`accordion-section ${expandedSections.has(section.id) ? 'expanded' : ''}`}
          >
            <button
              type="button"
              className="accordion-header"
              onClick={() => toggleSection(section.id)}
              aria-expanded={expandedSections.has(section.id)}
              aria-controls={`tool-panel-${section.id}`}
            >
              <div className="header-left">
                <span className="section-icon" aria-hidden="true">{section.icon}</span>
                <div className="header-text">
                  <span className="section-title">
                    {section.title}
                    {hasActiveContent(section.id) && (
                      <span className="active-indicator" aria-label="has content" title="This tool has content">●</span>
                    )}
                  </span>
                  <span className="section-description">{section.description}</span>
                </div>
              </div>
              <span
                className={`accordion-arrow ${expandedSections.has(section.id) ? 'open' : ''}`}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>

            {expandedSections.has(section.id) && (
              <div className="accordion-content" id={`tool-panel-${section.id}`}>
                {renderSectionContent(section.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
