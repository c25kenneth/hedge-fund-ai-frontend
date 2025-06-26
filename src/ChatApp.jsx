import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import ErrorBanner from './components/ErrorBar';
import useChatMessages from './services/ChatHooks';
import DocumentPreview from './components/DocumentPreview';

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

  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleCitationClick = (href, message) => {
    const documentCitations = message.citations?.filter(c => c.blob_url === href) || [];
    
    if (documentCitations.length > 0) {
      const pageNumber = documentCitations[0].page_number?.[0] || 1;
      
      setSelectedDocument({
        url: href,
        pageNumber: pageNumber,
        citations: documentCitations,
        pageWidth: documentCitations[0].page_width || 8.5,
        pageHeight: documentCitations[0].page_height || 11
      });
    }
  };

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
            onCitationClick={(href) => handleCitationClick(href, msg)}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        onFileUpload={handleDocumentUpload}
      />
      
      {selectedDocument && (
        <DocumentPreview
          url={selectedDocument.url}
          pageNumber={selectedDocument.pageNumber}
          citations={selectedDocument.citations}
          pageWidth={selectedDocument.pageWidth}
          pageHeight={selectedDocument.pageHeight}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}