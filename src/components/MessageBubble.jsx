import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

export default function MessageBubble({ msg, isLoading = false }) {

  if (msg.sender === 'ai' && (isLoading || !msg.text)) {
    return (
      <div className="max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm mr-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Thinking...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm transition-all duration-200 ease-in-out transform ${
        msg.sender === 'user'
          ? 'ml-auto bg-blue-500 text-white'
          : 'mr-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
      }`}
    >
      <ReactMarkdown>{msg.text}</ReactMarkdown>
    </div>
  );
}