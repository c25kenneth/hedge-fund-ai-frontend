import { Send, Paperclip, X } from 'lucide-react';
import { useState, useRef } from 'react';

export default function ChatInput({ value, onChange, onSend, onFileUpload, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {

      const allowedTypes = ['txt', 'pdf'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        alert('Only .txt, .pdf, and .png files are allowed');
      }
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onFileUpload(selectedFile, value.trim());
      setSelectedFile(null);
      onChange('');
    } else if (value.trim()) {
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
          <Paperclip className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {selectedFile.name}
          </span>
          <button
            onClick={removeFile}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={selectedFile ? "Add a message (optional)..." : "Type your message..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={`px-3 py-2 bg-gray-500 text-white rounded-md flex items-center justify-center transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
          }`}
          title="Upload file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || (!value.trim() && !selectedFile)}
          className={`px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center transition-colors ${
            isLoading || (!value.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".txt,.pdf,.png"
          className="hidden"
        />
      </div>
    </div>
  );
}