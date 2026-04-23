import React, { useEffect } from 'react';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['?'], description: 'Show this shortcuts dialog' },
  { keys: ['Ctrl', 'F'], description: 'Open search in the document' },
  { keys: ['Esc'], description: 'Close dialogs / search' },
  { keys: ['←'], description: 'Previous page (PDF view)' },
  { keys: ['→'], description: 'Next page (PDF view)' },
  { keys: ['Home'], description: 'First page' },
  { keys: ['End'], description: 'Last page' },
  { keys: ['Ctrl', '+'], description: 'Zoom in' },
  { keys: ['Ctrl', '-'], description: 'Zoom out' },
  { keys: ['Ctrl', '0'], description: 'Reset zoom' },
];

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="kbd-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kbd-title"
    >
      <div className="kbd-modal" onClick={e => e.stopPropagation()}>
        <div className="kbd-header">
          <h2 id="kbd-title">⌨️ Keyboard shortcuts</h2>
          <button
            type="button"
            className="kbd-close"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <ul className="kbd-list">
          {shortcuts.map((s, i) => (
            <li key={i} className="kbd-row">
              <span className="kbd-keys">
                {s.keys.map((k, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="kbd-plus">+</span>}
                    <kbd>{k}</kbd>
                  </React.Fragment>
                ))}
              </span>
              <span className="kbd-desc">{s.description}</span>
            </li>
          ))}
        </ul>

        <p className="kbd-hint">
          Tip: press <kbd>?</kbd> anywhere to open this dialog, <kbd>Esc</kbd> to close.
        </p>
      </div>
    </div>
  );
};
