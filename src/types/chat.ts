export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  accumulated_features: Record<string, unknown>;
  prompt_version?: string;
}

export interface VersionsResponse {
  default: string;
  versions: Array<{
    version: string;
    description: string;
  }>;
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

export interface InsightsData {
  price_statistics: {
    median: number;
    mean: number;
    std: number;
    percentile_25: number;
    percentile_75: number;
    median_price_per_sqft: number;
    sample_size: number;
  };
  neighborhoods: Array<{
    code: string;
    name: string;
    median_price: number;
  }>;
  feature_importances: Array<{
    feature: string;
    display_name: string;
    importance: number;
  }>;
  model_performance: {
    test_mae: number;
    test_rmse: number;
    test_r2: number;
    baseline_mae: number;
    improvement_pct: number;
  };
}
