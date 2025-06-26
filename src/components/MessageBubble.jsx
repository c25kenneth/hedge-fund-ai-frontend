import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ msg, isLoading = false, onCitationClick }) {
  const { citations = [] } = msg;

  const handleLinkClick = (href) => {
    const matched = citations.find(c => c.blob_url === href);
    if (matched) {
      console.log("Bounding Polygon:", matched.bounding_polygon);
    }
    onCitationClick?.(href);
  };

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, ...props }) => {
            const isPdf = href && href.endsWith('.pdf');
            return (
              <a
                {...props}
                onClick={(e) => {
                  if (isPdf) {
                    e.preventDefault();
                    handleLinkClick(href);
                  }
                }}
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                target={isPdf ? undefined : '_blank'}
                rel="noopener noreferrer"
              />
            );
          }
        }}
      >
        {msg.text}
      </ReactMarkdown>
    </div>
  );
}