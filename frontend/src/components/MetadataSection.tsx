import React from 'react';
import './MetadataSection.css';

interface MetadataSectionProps {
  metadata: any;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({ metadata }) => {
  if (!metadata) return null;

  return (
    <div className="metadata-section">
      <h3>📋 Metadata</h3>
      
      <div className="metadata-item">
        <label>Title</label>
        <p>{metadata.title}</p>
      </div>

      <div className="metadata-item">
        <label>Pages</label>
        <p>{metadata.pageCount}</p>
      </div>

      <div className="metadata-item">
        <label>Authors</label>
        <p>{metadata.authors}</p>
      </div>

      <div className="metadata-item">
        <label>Keywords</label>
        <div className="keywords">
          {metadata.keywords.length === 0 ? (
            <p className="hint">No keywords detected</p>
          ) : (
            metadata.keywords.map((kw: string, i: number) => (
              <span key={i} className="keyword-tag">{kw}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
