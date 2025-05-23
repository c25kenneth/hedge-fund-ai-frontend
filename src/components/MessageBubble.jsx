import ReactMarkdown from 'react-markdown';
import { ExternalLink, Loader2 } from 'lucide-react';

export default function MessageBubble({ msg, isLoading = false }) {

  const parseCitationsWithSources = (text, sources = []) => {
    if (!text) return { cleanText: '', citationLinks: [] };
  
    const properCitationRegex = /【(\d+):(\d+)†source】/g;
    const corruptedCitationRegex = /[\?【\[]?(\d+):(\d+)†source[\]】\?]?/g;
  
    const citationLinks = [];
    let cleanText = text;
  
    let match;
    while ((match = properCitationRegex.exec(text)) !== null) {
      const sourceIndex = parseInt(match[1]) - 1;
      const citationNumber = match[1];
  
      if (sources[sourceIndex]) {
        citationLinks.push({
          id: match[0],
          number: citationNumber,
          url: sources[sourceIndex],
          text: `[${citationNumber}]`,
        });
      }
    }
  
    // Clean proper or corrupted citations
    cleanText = cleanText.replace(properCitationRegex, '');
    cleanText = cleanText.replace(corruptedCitationRegex, '');
  
    // Extra catch-all cleanup for anything that looks like [sourceX:Y] or other malformed patterns
    cleanText = cleanText.replace(/\[.*?†source.*?\]/g, '');
    cleanText = cleanText.replace(/【.*?†source.*?】/g, '');
  
    return { cleanText, citationLinks };
  };
  

  const { cleanText, citationLinks } = parseCitationsWithSources(msg.text, msg.sources);

  if (msg.sender === 'ai' && (isLoading || (!msg.text && !cleanText))) {
    return (
      <div className="max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm mr-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Thinking...</span>
        </div>
      </div>
    );
  }

  const getAdditionalSources = () => {
    if (!msg.sources || msg.sources.length === 0) return [];
    
    const citedUrls = new Set(citationLinks.map(citation => citation.url));
    
    const uniqueAdditionalSources = [];
    const seenUrls = new Set();
    
    msg.sources.forEach(source => {
      if (!citedUrls.has(source) && !seenUrls.has(source)) {
        uniqueAdditionalSources.push(source);
        seenUrls.add(source);
      }
    });
    
    return uniqueAdditionalSources;
  };

  const additionalSources = getAdditionalSources();

  return (
    <div
      className={`max-w-md px-4 py-2 rounded-2xl shadow-sm text-sm transition-all duration-200 ease-in-out transform ${
        msg.sender === 'user'
          ? 'ml-auto bg-blue-500 text-white'
          : 'mr-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
      }`}
    >
      <ReactMarkdown>{cleanText || msg.text}</ReactMarkdown>
      
      {/* {msg.sender === 'ai' && citationLinks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Citations:</div>
          <div className="flex flex-wrap gap-1">
            {citationLinks.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-600 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors text-blue-700 dark:text-blue-200"
                title={citation.url}
              >
                <ExternalLink size={10} />
                {citation.text}
              </a>
            ))}
          </div>
        </div>
      )} */}
      
      {/* {msg.sender === 'ai' && additionalSources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Additional Sources:</div>
          <div className="flex flex-wrap gap-1">
            {additionalSources.map((source, index) => (
              <a
                key={index}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                title={source}
              >
                <ExternalLink size={10} />
                Source {index + 1}
              </a>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}