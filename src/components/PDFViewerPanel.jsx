export default function PDFViewerPanel({ pdfUrl, onClose }) {
  if (!pdfUrl) return null;

  return (
    <div className="fixed top-0 right-0 w-1/2 h-full bg-white dark:bg-gray-900 shadow-lg z-50 border-l border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">PDF Viewer</h2>
        <button
          onClick={onClose}
          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400"
        >
          Close
        </button>
      </div>
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        className="w-full h-[calc(100%-48px)]"
      />
    </div>
  );
}
