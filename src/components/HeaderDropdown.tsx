import { useState, useEffect, useRef } from 'react';
import './HeaderDropdown.css';

interface HeaderDropdownProps {
  onReset: () => void;
  onViewInsights: () => void;
}

export function HeaderDropdown({ onReset, onViewInsights }: HeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="header-dropdown" ref={ref}>
      <button className="header-dropdown__trigger" onClick={() => setOpen(o => !o)}>
        ☰ Menu
      </button>
      {open && (
        <div className="header-dropdown__menu">
          <button
            className="header-dropdown__item"
            onClick={() => { setOpen(false); onReset(); }}
          >
            <span>💬</span> New Conversation
          </button>
          <button
            className="header-dropdown__item"
            onClick={() => { setOpen(false); onViewInsights(); }}
          >
            <span>📊</span> View Insights
          </button>
          <button
            className="header-dropdown__item header-dropdown__item--disabled header-dropdown__separator"
            disabled
            title="Coming soon"
          >
            <span>🔒</span> Login
          </button>
        </div>
      )}
    </div>
  );
}
