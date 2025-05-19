import { Send } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, isLoading }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
        disabled={isLoading}
        className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className={`px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center transition-colors ${
          isLoading || !value.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}