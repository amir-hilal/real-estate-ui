import { useChat } from './hooks/useChat';
import { ChatThread } from './components/ChatThread';
import { InputBar } from './components/InputBar';
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

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__header-text">
            <span className="app__title">Property Price Estimator</span>
            <span className="app__subtitle">Ames, Iowa &middot; ML + AI</span>
          </div>
          <button className="app__new-btn" onClick={reset}>
            New conversation
          </button>
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
    </div>
  );
}

export default App;
