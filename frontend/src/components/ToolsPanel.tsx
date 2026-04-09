import React, { useState } from 'react';
import { SummaryTool } from './tools/SummaryTool';
import { GlossaryPanel } from './GlossaryPanel';
import { EvidenceTracker } from './EvidenceTracker';
import { EquationHelper } from './EquationHelper';
import { ISACalculator } from './ISACalculator';
import { UnitConverterTool } from './tools/UnitConverter';
import { AskAnythingBox } from './AskAnythingBox';
import { reportService } from '../services/api';
import './ToolsPanel.css';

interface ToolsPanelProps {
  reportData: any | null;
  selectedText: string;
  glossary: Map<string, string>;
  equations: any[];
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
  {
    id: 'summary',
    title: 'Summary Tool',
    icon: '📋',
    description: 'Auto summary of page/selection • Bullet-point extraction'
  },
  {
    id: 'glossary',
    title: 'Glossary Tool',
    icon: '📚',
    description: 'Definitions of highlighted terms'
  },
  {
    id: 'explanation',
    title: 'Explanation Tool',
    icon: '💡',
    description: 'Explain selected text • Rewrite in simple English'
  },
  {
    id: 'evidence',
    title: 'Evidence Tracker',
    icon: '🔍',
    description: 'Sources for claims/numbers • "How Do You Know?"'
  },
  {
    id: 'equation',
    title: 'Equation Helper',
    icon: '📐',
    description: 'List of all equations • View variables/units'
  },
  {
    id: 'recalculation',
    title: 'ISA Calculator',
    icon: '🧮',
    description: 'ISA atmosphere • Altitude, temperature & pressure'
  },
  {
    id: 'unit',
    title: 'Unit Converter',
    icon: '🔄',
    description: 'Auto-detect numbers • Convert units'
  },
  {
    id: 'ask',
    title: 'Ask-Anything Box',
    icon: '🤔',
    description: 'User Q&A with report context'
  }
];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  reportData, 
  selectedText,
  glossary,
  equations,
  onAddToGlossary,
  onJumpToText
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [explanation, setExplanation] = useState<{ text: string; mode: string } | null>(null);
  const [explaining, setExplaining] = useState(false);

  const expandAll = () => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const handleAddToGlossary = (term: string, definition: string) => {
    if (onAddToGlossary) {
      onAddToGlossary(term, definition);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleExplain = async (mode: 'explain' | 'simplify') => {
    if (!selectedText) return;
    setExplaining(true);
    setExplanation(null);
    try {
      const result = await reportService.explain(selectedText, reportData?.text?.substring(0, 500) || '');
      setExplanation({ text: result.explanation || result.result || JSON.stringify(result), mode });
    } catch {
      setExplanation({ text: 'Failed to get explanation. Please try again.', mode });
    } finally {
      setExplaining(false);
    }
  };

  // Helper to show active indicators
  const hasActiveContent = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'glossary':
        return glossary.size > 0;
      case 'equation':
        return equations.length > 0;
      case 'explanation':
        return selectedText.length > 0;
      case 'evidence':
        return selectedText.length > 0;
      default:
        return false;
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
                <p className="selected-preview">"{selectedText.substring(0, 200)}{selectedText.length > 200 ? '…' : ''}"</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleExplain('explain')}
                    disabled={explaining}
                    style={{ flex: 1 }}
                  >
                    {explaining ? '⏳ Explaining…' : '🔬 Explain This'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleExplain('simplify')}
                    disabled={explaining}
                    style={{ flex: 1 }}
                  >
                    {explaining ? '⏳ Simplifying…' : '✏️ Simplify'}
                  </button>
                </div>
                {explanation && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.875rem',
                    background: 'rgba(88,166,255,0.06)',
                    border: '1px solid rgba(88,166,255,0.2)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#c9d1d9',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <strong style={{ color: '#58a6ff', display: 'block', marginBottom: '0.4rem', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {explanation.mode === 'simplify' ? 'Simplified' : 'Explanation'}
                    </strong>
                    {explanation.text}
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
        return (
          <EquationHelper 
            equations={equations}
            selectedEquation={selectedText}
          />
        );
      
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
            <h3>🛠️ AI Tools</h3>
            <div className="tools-badges">
              <span className="tool-badge badge-active">{activeToolsCount} Active</span>
              <span className="tool-badge badge-expanded">{expandedCount}/{sections.length} Open</span>
            </div>
          </div>
          <div className="header-actions-row">
            <button 
              className="btn-icon-tools" 
              onClick={expandAll}
              title="Expand All"
            >
              ⊞
            </button>
            <button 
              className="btn-icon-tools" 
              onClick={collapseAll}
              title="Collapse All"
            >
              ⊟
            </button>
          </div>
        </div>
        <p className="header-subtitle">Select & analyze report content</p>
      </div>

      <div className="accordion-container">
        {sections.map(section => (
          <div 
            key={section.id} 
            className={`accordion-section ${expandedSections.has(section.id) ? 'expanded' : ''}`}
          >
            <button 
              className="accordion-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="header-left">
                <span className="section-icon">{section.icon}</span>
                <div className="header-text">
                  <span className="section-title">
                    {section.title}
                    {hasActiveContent(section.id) && (
                      <span className="active-indicator">●</span>
                    )}
                  </span>
                  <span className="section-description">{section.description}</span>
                </div>
              </div>
              <span className={`accordion-arrow ${expandedSections.has(section.id) ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            
            {expandedSections.has(section.id) && (
              <div className="accordion-content">
                {renderSectionContent(section.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
