import { useState } from 'react';
import { useChat } from './hooks/useChat';
import { ChatThread } from './components/ChatThread';
import { InputBar } from './components/InputBar';
import { HeaderDropdown } from './components/HeaderDropdown';
import { InsightsOverlay } from './components/InsightsOverlay';
import './App.css';

function App() {
  const {
    messages,
    streamingText,
    streamingReplyText,
    pendingPrediction,
    streaming,
    sendMessage,
    reset,
  } = useChat();

  const [insightsOpen, setInsightsOpen] = useState(false);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__header-text">
            <span className="app__title">Property Price Estimator</span>
            <span className="app__subtitle">Ames, Iowa &middot; ML + AI</span>
          </div>
          <HeaderDropdown
            onReset={reset}
            onViewInsights={() => setInsightsOpen(true)}
          />
        </div>
      </header>
      <ChatThread
        messages={messages}
        streamingText={streamingText}
        streamingReplyText={streamingReplyText}
        pendingPrediction={pendingPrediction}
        streaming={streaming}
        onSend={sendMessage}
      />
      <InputBar onSend={sendMessage} disabled={streaming} />
      <InsightsOverlay
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
      />
    </div>
  );
}

export default App;
