import { RefreshCw } from 'lucide-react';

export default function HeaderBar({ isFetching, onRefresh, onSignOut }) {
  return (
    <div className="flex flex-row w-full justify-between bg-white dark:bg-gray-800 shadow">
      <div className="text-xl font-bold p-4 text-gray-800 dark:text-white flex items-center gap-2">
        Hedge Fund AI Chat
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Refresh messages"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-500' : 'text-gray-500'}`}
          />
        </button>
      </div>
      <button
        className="text-md font-medium px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white m-2 rounded-md transition-colors"
        onClick={onSignOut}
      >
        Sign Out
      </button>
    </div>
  );
}