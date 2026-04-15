import { useRef, useEffect } from "react";
import type { Message, Prediction } from "../types/chat";
import { MessageBubble, StreamingBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import "./ChatThread.css";

interface ChatThreadProps {
  messages: Message[];
  streamingText: string;
  streamingReplyText: string;
  pendingPrediction: Prediction | null;
  streaming: boolean;
  onSend: (text: string) => void;
}

const STARTERS = [
  { icon: "home", label: "3-bedroom house in North Ames, 1600 sq ft, quality 7, built 1995, 2-car garage, full basement 800 sq ft" },
  { icon: "sell", label: "Estimate a 2,000 sq ft house with 3-car garage" },
  { icon: "location_on", label: "What neighborhoods are available?" },
  { icon: "help", label: "What info do you need to estimate a price?" },
];

export function ChatThread({
  messages,
  streamingText,
  streamingReplyText,
  pendingPrediction,
  streaming,
  onSend,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const showTyping = streaming && !streamingText && !pendingPrediction;
  const showStreaming = streaming && (!!streamingText || !!pendingPrediction);
  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="chat-thread">
      {isEmpty && (
        <div className="chat-thread__empty">
          <span className="material-symbols-rounded chat-thread__icon">chat_bubble</span>
          <div className="chat-thread__empty-title">
            Describe a property to get started
          </div>
          <div className="chat-thread__empty-hint">
            or pick a question below
          </div>
          <div className="chat-thread__starters">
            {STARTERS.map((s) => (
              <button
                key={s.label}
                className="chat-thread__starter"
                onClick={() => onSend(s.label)}
              >
                <span className="material-symbols-rounded chat-thread__starter-icon">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {showStreaming && (
        <StreamingBubble
          text={streamingText}
          prediction={pendingPrediction}
          replyText={streamingReplyText}
        />
      )}
      {showTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
