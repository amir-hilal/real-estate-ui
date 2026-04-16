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
        <span className="material-symbols-rounded">menu</span> Menu
      </button>
      {open && (
        <div className="header-dropdown__menu">
          <button
            className="header-dropdown__item"
            onClick={() => { setOpen(false); onReset(); }}
          >
            <span className="material-symbols-rounded">chat</span> New Conversation
          </button>
          <button
            className="header-dropdown__item"
            onClick={() => { setOpen(false); onViewInsights(); }}
          >
            <span className="material-symbols-rounded">bar_chart</span> View Insights
          </button>
          {versions && versions.versions.length > 0 && (
            <>
              <div className="header-dropdown__separator" />
              <button
                className="header-dropdown__item header-dropdown__version-toggle"
                onClick={() => setVersionsExpanded(e => !e)}
              >
                <span className="material-symbols-rounded">tune</span>
                <span>Version: {currentVersion ?? 'default'}</span>
                <span className={`header-dropdown__chevron material-symbols-rounded${versionsExpanded ? ' header-dropdown__chevron--open' : ''}`}>chevron_right</span>
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
                  <span className="header-dropdown__radio material-symbols-rounded">
                    {v.version === currentVersion ? 'radio_button_checked' : 'radio_button_unchecked'}
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
            <span className="material-symbols-rounded">lock</span> Login
          </button>
        </div>
      )}
    </div>
  );
}
