import React, { useEffect, useRef, useState } from 'react';
export default function DocumentPreview({
  url,
  pageNumber,
  citations = [],
  pageWidth = 8.5,
  pageHeight = 11,
  onClose
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadImage = async () => {
      try {
        const pageCitations = citations.filter(citation => 
          citation.page_number && citation.page_number.includes(pageNumber)
        );
        
        if (pageCitations.length === 0) {
          setError('No citations found for this page');
          return;
        }

        const boundingPolygons = pageCitations.map(citation => citation.bounding_polygon);
        
        const polygonsParam = encodeURIComponent(JSON.stringify(boundingPolygons));
        
        const response = await fetch(
          `${API_URL}/previewFile?url=${encodeURIComponent(url)}&page=${pageNumber}&polygons=${polygonsParam}`
        );
        
        if (!response.ok) throw new Error('Failed to load preview');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error(err);
        setError('Failed to load document preview');
      }
    };

    loadImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [url, pageNumber, citations]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Document Preview - Page {pageNumber}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="relative w-full">
            {imageUrl ? (
              <div className="relative">
                <img 
                  src={imageUrl} 
                  className="w-full rounded shadow" 
                  alt="Document preview with highlighted sections"
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {citations.length} highlighted section{citations.length !== 1 ? 's' : ''} found
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40 text-gray-600">
                Loading preview...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}