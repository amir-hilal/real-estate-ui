import { useState, useEffect } from "react";
import "./TypingIndicator.css";

const MESSAGES = [
  "Thinking",
  "Exploring Market",
  "Interpreting Result",
];

export function TypingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="typing-indicator">
      <span className="typing-indicator__text">{MESSAGES[index]}</span>
      <span className="typing-indicator__dots">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </span>
    </div>
  );
}
