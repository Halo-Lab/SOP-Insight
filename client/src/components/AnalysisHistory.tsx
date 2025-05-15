import * as React from "react";
import { toast } from "sonner";
import type { AnalysisHistory } from "@/lib/services/sop.service";
import {
  getAnalysisHistory,
  deleteAnalysisHistory,
  updateAnalysisHistoryName,
} from "@/lib/services/sop.service";

interface AnalysisHistorySidebarProps {
  onSelectHistory: (history: AnalysisHistory) => void;
  selectedHistoryId?: string;
}

export const AnalysisHistorySidebar: React.FC<AnalysisHistorySidebarProps> = ({
  onSelectHistory,
  selectedHistoryId,
}) => {
  const [history, setHistory] = React.useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const fetchHistory = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnalysisHistory();
      setHistory(data);
    } catch (error) {
      toast.error("Failed to load analysis history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Listen for refresh events from other components
  React.useEffect(() => {
    const handleRefresh = () => {
      fetchHistory();
    };

    window.addEventListener("refreshAnalysisHistory", handleRefresh);

    return () => {
      window.removeEventListener("refreshAnalysisHistory", handleRefresh);
    };
  }, [fetchHistory]);

  React.useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      try {
        await deleteAnalysisHistory(id);
        toast.success("Analysis deleted successfully");
        fetchHistory();
      } catch (error) {
        toast.error("Failed to delete analysis");
        console.error(error);
      }
    }
  };

  const handleEdit = (history: AnalysisHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(history.id);
    setEditingName(history.name);
  };

  const handleSaveName = async (id: string) => {
    if (!editingName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateAnalysisHistoryName(id, editingName);
      toast.success("Name updated successfully");
      setEditingId(null);
      fetchHistory();
    } catch (error) {
      toast.error("Failed to update name");
      console.error(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveName(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  if (loading && history.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 border-r">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  if (!loading && history.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 border-r">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No analysis history found</p>
          <p className="text-sm text-gray-400">
            Run an analysis to see results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Analysis History</h2>
      </div>
      <ul className="divide-y">
        {history.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className={`p-3 hover:bg-gray-50 cursor-pointer ${
              selectedHistoryId === item.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              {editingId === item.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveName(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  className="border rounded px-2 py-1 w-full mr-2"
                />
              ) : (
                <div className="flex-1 truncate">{item.name}</div>
              )}
              <div className="flex space-x-1 ml-2">
                <button
                  type="button"
                  aria-label="Edit"
                  onClick={(e) => handleEdit(item, e)}
                  className="h-7 w-7 p-1 rounded hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="h-7 w-7 p-1 rounded hover:bg-gray-100 text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnalysisHistorySidebar;
