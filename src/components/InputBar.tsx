import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import "./InputBar.css";

interface InputBarProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MAX_CHARS = 2000;
const WARN_CHARS = 1800;

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = value.length;
  const overLimit = charCount > MAX_CHARS;
  const showCounter = charCount >= WARN_CHARS;
  const canSend = value.trim().length > 0 && !overLimit && !disabled;

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function handleSend() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="input-bar">
      <div className="input-bar__inner">
      <div className="input-bar__row">
        <textarea
          ref={textareaRef}
          className="input-bar__textarea"
          placeholder="Describe a property…"
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className="input-bar__send"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="input-bar__footer">
        <span className="input-bar__hint">
          Shift+Enter for new line · Enter to send
        </span>
        {showCounter && (
          <span
            className={`input-bar__counter ${overLimit ? "input-bar__counter--over" : ""}`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        )}
      </div>
      </div>
    </div>
  );
}
