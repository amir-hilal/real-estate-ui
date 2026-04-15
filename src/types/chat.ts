export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  accumulated_features: Record<string, unknown>;
}

export interface Prediction {
  prediction_usd: number;
  features: Record<string, unknown>;
}

export interface Message {
  role: "user" | "assistant";
  text: string;
  prediction?: Prediction | null;
  explanation?: string;
}

export interface FeaturesPayload {
  extracted_features: Record<string, unknown>;
}

export interface TokenPayload {
  text: string;
}

export interface PredictionPayload {
  prediction_usd: number;
  features: Record<string, unknown>;
}

export interface ErrorPayload {
  code: string;
  message: string;
}
