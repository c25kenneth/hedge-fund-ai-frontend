import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import ErrorBanner from './components/ErrorBar';
import useChatMessages from './services/ChatHooks';
import PDFViewerPanel from './components/PDFViewerPanel';

export default function ChatApp() {
  const navigate = useNavigate();
  const {
    messages,
    input,
    setInput,
    handleSend,
    error,
    isLoading,
    isFetching,
    loadingMessageId,
    handleRefresh,
    signOutAndRedirect,
    messagesEndRef, 
    handleDocumentUpload,
  } = useChatMessages(navigate);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [pdfUrl, setPdfUrl] = useState(null);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <HeaderBar
        isFetching={isFetching}
        onRefresh={handleRefresh}
        onSignOut={signOutAndRedirect}
      />

      {error && <ErrorBanner message={error} />}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isFetching && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No messages yet. Start a conversation!
          </div>
        )}
        {isFetching && messages.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Loading messages...
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            msg={msg} 
            isLoading={msg.id === loadingMessageId && msg.sender === 'ai' && !msg.text}
            onCitationClick={(href) => setPdfUrl(href)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput value={input} onChange={setInput} onSend={handleSend} isLoading={isLoading} onFileUpload={handleDocumentUpload}/>
      <PDFViewerPanel pdfUrl={pdfUrl} onClose={() => setPdfUrl(null)} />
    </div>
  );
}