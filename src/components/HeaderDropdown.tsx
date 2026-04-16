import { useState, useEffect, useRef } from 'react';
import type { VersionsResponse } from '../types/chat';
import './HeaderDropdown.css';

interface HeaderDropdownProps {
  onReset: () => void;
  onViewInsights: () => void;
  versions: VersionsResponse | null;
  currentVersion: string | null;
  onVersionChange: (version: string) => void;
}

export function HeaderDropdown({ onReset, onViewInsights, versions, currentVersion, onVersionChange }: HeaderDropdownProps) {
  const [open, setOpen] = useState(false);
  const [versionsExpanded, setVersionsExpanded] = useState(false);
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
          {versions && versions.versions.length > 0 && (
            <>
              <div className="header-dropdown__separator" />
              <button
                className="header-dropdown__item header-dropdown__version-toggle"
                onClick={() => setVersionsExpanded(e => !e)}
              >
                <span>🔧</span>
                <span>Prompt: {currentVersion ?? 'default'}</span>
                <span className={`header-dropdown__chevron${versionsExpanded ? ' header-dropdown__chevron--open' : ''}`}>▸</span>
              </button>
              {versionsExpanded && versions.versions.map(v => (
                <button
                  key={v.version}
                  className={`header-dropdown__version-item${v.version === currentVersion ? ' header-dropdown__version-item--selected' : ''}`}
                  title={v.description}
                  onClick={() => {
                    if (v.version !== currentVersion) {
                      onVersionChange(v.version);
                      setVersionsExpanded(false);
                    }
                  }}
                >
                  <span className="header-dropdown__radio">
                    {v.version === currentVersion ? '●' : '○'}
                  </span>
                  <span className="header-dropdown__version-name">{v.version}</span>
                </button>
              ))}
            </>
          )}
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
