import React, { useState } from 'react';
import { SummaryTool } from './tools/SummaryTool';
import { GlossaryPanel } from './GlossaryPanel';
import { EvidenceTracker } from './EvidenceTracker';
import { EquationHelper } from './EquationHelper';
import { ISACalculator } from './ISACalculator';
import { UnitConverterTool } from './tools/UnitConverter';
import { AskAnythingBox } from './AskAnythingBox';
import './ToolsPanel.css';

interface ToolsPanelProps {
  reportData: any | null;
  selectedText: string;
  onAddToGlossary?: (term: string, definition: string) => void;
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
    title: 'Recalculation Panel',
    icon: '🧮',
    description: 'User inputs • Live recalculated outputs'
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
  onAddToGlossary 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [glossary, setGlossary] = useState<Map<string, string>>(new Map());

  const expandAll = () => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const handleAddToGlossary = (term: string, definition: string) => {
    const newGlossary = new Map(glossary);
    newGlossary.set(term, definition);
    setGlossary(newGlossary);
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

  // Helper to show active indicators
  const hasActiveContent = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'glossary':
        return glossary.size > 0;
      case 'equation':
        return (reportData?.equations?.length || 0) > 0;
      case 'explanation':
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
            <p className="tool-hint">💡 Highlight any text in the document to get an explanation</p>
            {selectedText && (
              <div className="explanation-content">
                <h4>Selected Text:</h4>
                <p className="selected-preview">{selectedText.substring(0, 150)}...</p>
                <button className="btn-primary">Explain This</button>
                <button className="btn-secondary">Simplify</button>
              </div>
            )}
          </div>
        );
      
      case 'evidence':
        return (
          <EvidenceTracker 
            selectedText={selectedText}
            reportData={reportData}
          />
        );
      
      case 'equation':
        return (
          <EquationHelper 
            equations={reportData?.equations || []}
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
