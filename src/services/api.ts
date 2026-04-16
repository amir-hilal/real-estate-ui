import type { ChatRequest, InsightsData, VersionsResponse } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function postChat(request: ChatRequest): Promise<Response> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res;
}

export async function fetchInsights(): Promise<InsightsData> {
  const response = await fetch(`${API_URL}/insights`);
  if (!response.ok) {
    throw new Error(`Insights fetch failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchVersions(): Promise<VersionsResponse> {
  const response = await fetch(`${API_URL}/versions`);
  if (!response.ok) {
    throw new Error(`Versions fetch failed: ${response.status}`);
  }
  return response.json();
}
