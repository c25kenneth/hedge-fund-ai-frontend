import ReactMarkdown from 'react-markdown';

export default function ErrorBanner({ message }) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mx-4 mt-2">
        <span className="block sm:inline">{message}</span>
      </div>
    );
  }
  