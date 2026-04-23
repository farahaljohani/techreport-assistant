import React, { useState } from 'react';
import { useToast } from '../utils/toast';
import './CopyButton.css';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  className = '',
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <button
      type="button"
      className={`copy-btn ${compact ? 'compact' : ''} ${copied ? 'copied' : ''} ${className}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
    >
      <span aria-hidden="true">{copied ? '✓' : '📋'}</span>
      {!compact && <span className="copy-btn-label">{copied ? 'Copied' : label}</span>}
    </button>
  );
};
