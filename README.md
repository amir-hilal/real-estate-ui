# Property Price Estimator — Frontend

A conversational chat interface for an AI-powered real estate price estimator. Users describe a property in natural language, and the app streams back follow-up questions, a predicted sale price, and an explanation — all rendered word-by-word via Server-Sent Events.

## Stack

- **Vite** — build tool and dev server
- **React 18** — UI framework (createRoot)
- **TypeScript** — strict mode
- **Plain CSS** — co-located `.css` files per component

## Prerequisites

- Node.js 18+
- The FastAPI backend running on port 8000 (via Docker Desktop: `docker compose up` in the `real-estate-ai` project)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

Set in `.env` or override at build time.

## Project Structure

```
real-estate-ui/
├── src/
│   ├── App.tsx                ← Root component (header, thread, input bar)
│   ├── App.css                ← App-level layout & header styles
│   ├── main.tsx               ← Entry point (createRoot)
│   ├── index.css              ← Global resets (box-sizing, body, fonts)
│   ├── components/
│   │   ├── ChatThread.tsx     ← Scrollable message list + auto-scroll
│   │   ├── ChatThread.css
│   │   ├── MessageBubble.tsx  ← User/assistant message bubble + streaming bubble
│   │   ├── MessageBubble.css
│   │   ├── PredictionCard.tsx ← Prediction result card with collapsible details
│   │   ├── PredictionCard.css
│   │   ├── TypingIndicator.tsx← Animated bouncing dots
│   │   ├── TypingIndicator.css
│   │   ├── InputBar.tsx       ← Auto-resizing textarea + send button
│   │   └── InputBar.css
│   ├── hooks/
│   │   └── useChat.ts         ← Chat state machine, SSE fetch + parsing
│   ├── services/
│   │   └── api.ts             ← fetch wrapper for POST /chat
│   └── types/
│       └── chat.ts            ← TypeScript interfaces
├── .env                       ← VITE_API_URL
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API Contract

### `POST /chat`

**Request body:**

```json
{
  "message": "3-bed house in North Ames, 1600 sq ft",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "accumulated_features": { "Neighborhood": "NAmes" }
}
```

**Response:** `text/event-stream` (SSE)

| Event | Payload | Purpose |
|-------|---------|---------|
| `features` | `{ extracted_features: Record<string, unknown> }` | Feature metadata — merge into accumulated features (no display text) |
| `token` | `{ text: string }` | One chunk of visible text (reply or explanation) — append to streaming output |
| `prediction` | `{ prediction_usd: number, features: Record<string, unknown> }` | ML model prediction — render as a card |
| `done` | `{}` | Stream complete — commit message to thread |
| `error` | `{ code: string, message: string }` | Error — show as assistant message |

**Event sequences:**

| Scenario | Events |
|----------|--------|
| Greeting | `features` → `token` × N → `done` |
| Partial property | `features` → `token` × N → `done` |
| Complete property | `features` → `token` × N → `prediction` → `token` × N → `done` |
| Error | `error` |

## Architecture Notes

### State management

All chat state is managed by the `useChat` custom hook — no external state libraries. The hook tracks:

- `messages[]` — committed chat thread (user + assistant messages)
- `streamingText` — text currently being streamed token-by-token
- `streamingReplyText` — reply text preserved when prediction arrives mid-stream
- `pendingPrediction` — prediction card waiting during explanation streaming
- `accumulated` — extracted property features gathered across all turns

### SSE parsing

Uses `fetch()` with `ReadableStream` (not `EventSource`, which only supports GET). The response body is read chunk-by-chunk with a `TextDecoder`, split on `\n\n` boundaries, and dispatched by event type.

### Per-token rendering (yieldToBrowser)

React 18 batches state updates, which would cause streamed tokens to appear all at once instead of word-by-word. After each `token` event, the hook yields to the browser via a double-`requestAnimationFrame` pattern:

```typescript
const yieldToBrowser = () =>
  new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
```

This ensures each token is painted before the next one is processed.
# Property Price Estimator — Frontend

A conversational chat interface for an AI-powered real estate price estimator. Users describe a property in natural language, and the app streams back follow-up questions, a predicted sale price, and an explanation — all rendered word-by-word via Server-Sent Events.

## Stack

- **Vite** — build tool and dev server
- **React 18** — UI framework (createRoot)
- **TypeScript** — strict mode
- **Plain CSS** — co-located .css files per component

## Prerequisites

- Node.js 18+
- The FastAPI backend running on port 8000 (via Docker Desktop: `docker compose up` in the 
eal-estate-ai project)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8000 | Base URL of the FastAPI backend |

Set in .env or override at build time.

## Project Structure

```
real-estate-ui/
├── src/
│   ├── App.tsx                ← Root component (header, thread, input bar)
│   ├── App.css                ← App-level layout & header styles
│   ├── main.tsx               ← Entry point (createRoot)
│   ├── index.css              ← Global resets (box-sizing, body, fonts)
│   ├── components/
│   │   ├── ChatThread.tsx     ← Scrollable message list + auto-scroll
│   │   ├── ChatThread.css
│   │   ├── MessageBubble.tsx  ← User/assistant message bubble + streaming bubble
│   │   ├── MessageBubble.css
│   │   ├── PredictionCard.tsx ← Prediction result card with collapsible details
│   │   ├── PredictionCard.css
│   │   ├── TypingIndicator.tsx← Animated bouncing dots
│   │   ├── TypingIndicator.css
│   │   ├── InputBar.tsx       ← Auto-resizing textarea + send button
│   │   └── InputBar.css
│   ├── hooks/
│   │   └── useChat.ts         ← Chat state machine, SSE fetch + parsing
│   ├── services/
│   │   └── api.ts             ← fetch wrapper for POST /chat
│   └── types/
│       └── chat.ts            ← TypeScript interfaces
├── .env                       ← VITE_API_URL
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API Contract

### `POST /chat`

**Request body:**

```json
{
  "message": "3-bed house in North Ames, 1600 sq ft",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }],
  "accumulated_features": { "Neighborhood": "NAmes" }
}
```

**Response:** 	ext/event-stream (SSE)

| Event | Payload | Purpose |
|-------|---------|---------|
| eatures | { extracted_features: Record<string, unknown> } | Feature metadata — merge into accumulated features (no display text) |
| 	oken | { text: string } | One chunk of visible text (reply or explanation) — append to streaming output |
| prediction | { prediction_usd: number, features: Record<string, unknown> } | ML model prediction — render as a card |
| done | {} | Stream complete — commit message to thread |
| error | { code: string, message: string } | Error — show as assistant message |

**Event sequences:**

| Scenario | Events |
|----------|--------|
| Greeting | eatures → 	oken × N → done |
| Partial property | eatures → 	oken × N → done |
| Complete property | eatures → 	oken × N → prediction → 	oken × N → done |
| Error | error |

## Architecture Notes

### State management

All chat state is managed by the useChat custom hook — no external state libraries. The hook tracks:

- messages[] — committed chat thread (user + assistant messages)
- streamingText — text currently being streamed token-by-token
- streamingReplyText — reply text preserved when prediction arrives mid-stream
- pendingPrediction — prediction card waiting during explanation streaming
- ccumulated — extracted property features gathered across all turns

### SSE parsing

Uses etch() with ReadableStream (not EventSource, which only supports GET). The response body is read chunk-by-chunk with a TextDecoder, split on \n\n boundaries, and dispatched by event type.

### Per-token rendering (yieldToBrowser)

React 18 batches state updates, which would cause streamed tokens to appear all at once instead of word-by-word. After each 	oken event, the hook yields to the browser via a double-
equestAnimationFrame pattern:

```typescript
const yieldToBrowser = () =>
  new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
```

This ensures each token is painted before the next one is processed.
