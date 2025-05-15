import * as React from "react";
import { toast } from "sonner";
import type { AnalysisHistory } from "@/lib/services/sop.service";
import {
  getAnalysisHistory,
  deleteAnalysisHistory,
  updateAnalysisHistoryName,
} from "@/lib/services/sop.service";
import { Loader } from "@/components/ui/Loader";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
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

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;

    setDeleteLoading(true);
    try {
      await deleteAnalysisHistory(deleteItemId);
      toast.success("Analysis deleted successfully");
      fetchHistory();
    } catch (error) {
      toast.error("Failed to delete analysis");
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteItemId(null);
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
          <Loader size="lg" className="mx-auto mb-2" />
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
    <>
      <div className="h-full overflow-auto border-r pt-8">
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Edit"
                    onClick={(e) => handleEdit(item, e)}
                    className="h-8 w-8 p-0 rounded-full"
                    leftIcon={Icons.edit}
                    iconClassName="m-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Delete"
                    onClick={(e) => handleDeleteClick(item.id, e)}
                    className="h-8 w-8 p-0 rounded-full text-red-500"
                    leftIcon={Icons.delete}
                    iconClassName="m-0"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Analysis"
        description="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteLoading}
      />
    </>
  );
};

export default AnalysisHistorySidebar;
