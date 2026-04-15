import { useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import type {
  Message,
  Prediction,
  FeaturesPayload,
  TokenPayload,
  PredictionPayload,
  ErrorPayload,
} from "../types/chat";
import { postChat } from "../services/api";

export interface UseChatReturn {
  messages: Message[];
  streamingText: string;
  streamingReplyText: string;
  pendingPrediction: Prediction | null;
  accumulated: Record<string, unknown>;
  streaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  reset: () => void;
}

const yieldToBrowser = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

function parseSSEEvents(raw: string): { eventType: string; data: string }[] {
  const events: { eventType: string; data: string }[] = [];
  let currentEvent = "";
  let currentData = "";

  for (const line of raw.split("\n")) {
    if (line.startsWith("event: ")) {
      currentEvent = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      currentData = line.slice(6);
    } else if (line === "" && currentEvent) {
      events.push({ eventType: currentEvent, data: currentData });
      currentEvent = "";
      currentData = "";
    }
  }

  // Handle case where there's a parsed event/data pair without trailing blank line
  if (currentEvent && currentData) {
    events.push({ eventType: currentEvent, data: currentData });
  }

  return events;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [streamingReplyText, setStreamingReplyText] = useState("");
  const [pendingPrediction, setPendingPrediction] = useState<Prediction | null>(
    null
  );
  const [accumulated, setAccumulated] = useState<Record<string, unknown>>({});
  const [streaming, setStreaming] = useState(false);

  const accumulatedRef = useRef<Record<string, unknown>>({});

  const reset = useCallback(() => {
    setMessages([]);
    setStreamingText("");
    setStreamingReplyText("");
    setPendingPrediction(null);
    setAccumulated({});
    accumulatedRef.current = {};
    setStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = { role: "user", text };
      setMessages((prev) => [...prev, userMessage]);
      setStreaming(true);
      setStreamingText("");
      setStreamingReplyText("");
      setPendingPrediction(null);

      let replyText = "";
      let explanationText = "";
      let prediction: Prediction | null = null;
      let hasPrediction = false;

      const history = messages.map((m) => ({
        role: m.role,
        content: m.explanation ? `${m.text}\n${m.explanation}` : m.text,
      }));

      try {
        const res = await postChat({
          message: text,
          history,
          accumulated_features: accumulatedRef.current,
        });

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop()!;

          for (const part of parts) {
            const events = parseSSEEvents(part);

            for (const { eventType, data } of events) {
              switch (eventType) {
                case "features": {
                  const payload: FeaturesPayload = JSON.parse(data);
                  if (payload.extracted_features) {
                    const merged = {
                      ...accumulatedRef.current,
                      ...payload.extracted_features,
                    };
                    accumulatedRef.current = merged;
                    setAccumulated(merged);
                  }
                  break;
                }
                case "prediction": {
                  const payload: PredictionPayload = JSON.parse(data);
                  prediction = {
                    prediction_usd: payload.prediction_usd,
                    features: payload.features,
                  };
                  hasPrediction = true;
                  flushSync(() => {
                    setPendingPrediction(prediction);
                    setStreamingReplyText(replyText);
                    setStreamingText("");
                  });
                  break;
                }
                case "token": {
                  const payload: TokenPayload = JSON.parse(data);
                  if (hasPrediction) {
                    explanationText += payload.text;
                  } else {
                    replyText += payload.text;
                  }
                  setStreamingText(hasPrediction ? explanationText : replyText);
                  await yieldToBrowser();
                  break;
                }
                case "done": {
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      text: replyText,
                      prediction: prediction ?? undefined,
                      explanation: explanationText || undefined,
                    },
                  ]);
                  setStreamingText("");
                  setStreamingReplyText("");
                  setPendingPrediction(null);
                  setStreaming(false);
                  return;
                }
                case "error": {
                  const payload: ErrorPayload = JSON.parse(data);
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", text: payload.message },
                  ]);
                  setStreamingText("");
                  setPendingPrediction(null);
                  setStreaming(false);
                  return;
                }
              }
            }
          }
        }

        // Stream ended without done event — commit whatever we have
        if (replyText) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: replyText,
              prediction: prediction ?? undefined,
              explanation: explanationText || undefined,
            },
          ]);
        }
        setStreamingText("");
        setStreamingReplyText("");
        setPendingPrediction(null);
        setStreaming(false);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Could not reach the server. Please check your connection.",
          },
        ]);
        setStreamingText("");
        setPendingPrediction(null);
        setStreaming(false);
      }
    },
    [messages]
  );

  return {
    messages,
    streamingText,
    streamingReplyText,
    pendingPrediction,
    accumulated,
    streaming,
    sendMessage,
    reset,
  };
}
