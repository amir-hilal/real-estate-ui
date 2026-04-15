import type { Message, Prediction } from "../types/chat";
import { PredictionCard } from "./PredictionCard";
import "./MessageBubble.css";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"}`}>
      <div className="message-bubble__text">{message.text}</div>
      {message.prediction && (
        <PredictionCard prediction={message.prediction} />
      )}
      {message.explanation && (
        <div className="message-bubble__text">{message.explanation}</div>
      )}
    </div>
  );
}

interface StreamingBubbleProps {
  text: string;
  prediction: Prediction | null;
  replyText?: string;
}

export function StreamingBubble({ text, prediction, replyText }: StreamingBubbleProps) {
  return (
    <div className="message-bubble message-bubble--assistant">
      {prediction && replyText && (
        <div className="message-bubble__text">{replyText}</div>
      )}
      {prediction && <PredictionCard prediction={prediction} />}
      <div className="message-bubble__text cursor-blink">{text}</div>
    </div>
  );
}
