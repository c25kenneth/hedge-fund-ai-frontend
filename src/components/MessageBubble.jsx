import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ msg }) {
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