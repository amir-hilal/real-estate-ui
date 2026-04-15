import type { ChatRequest } from "../types/chat";

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
