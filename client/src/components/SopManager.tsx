import * as React from "react";
import { Button } from "@/components/ui/Button";
import { SopForm } from "@/components/SopForm";
import {
  fetchSops as fetchSopsService,
  createSop as createSopService,
  updateSop as updateSopService,
  deleteSop as deleteSopService,
} from "@/lib/services/sop.service";
import type { Sop as SopType, SopFormData } from "@/lib/services/sop.service";
import type { ApiError } from "@/lib/services/api.service";
import { DefaultSopsList } from "./DefaultSopsList";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

interface SopManagerProps {
  onSelectSop: (content: string) => void;
}

export const SopManager: React.FC<SopManagerProps> = ({ onSelectSop }) => {
  const { user } = useAuth();
  const [sops, setSops] = React.useState<SopType[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  const [editingSopData, setEditingSopData] = React.useState<SopFormData>({
    name: "",
    content: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);

  const loadSops = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSopsService();
      setSops(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to fetch SOPs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadSops();
  }, []);

  const handleAddSubmit = async (formData: SopFormData) => {
    setFormLoading(true);
    setError(null);
    try {
      const newSop = await createSopService(formData);
      setSops([newSop, ...sops]);
      setIsAdding(false);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to add SOP");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (sop: SopType) => {
    setIsEditing(sop.id);
    setEditingSopData({ name: sop.name, content: sop.content });
    setIsAdding(false);
  };

  const handleUpdateSubmit = async (formData: SopFormData) => {
    if (isEditing === null) return;
    setFormLoading(true);
    setError(null);
    try {
      const updatedSop = await updateSopService(isEditing, formData);
      setSops(
        sops.map((sopItem) => (sopItem.id === isEditing ? updatedSop : sopItem))
      );
      setIsEditing(null);
      setEditingSopData({ name: "", content: "" });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to update SOP");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SOP?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteSopService(id);
      setSops(sops.filter((sopItem) => sopItem.id !== id));
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Failed to delete SOP");
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setIsAdding(true);
    setIsEditing(null);
    setEditingSopData({ name: "", content: "" });
    setError(null);
  };

  const cancelAddForm = () => {
    setIsAdding(false);
    setError(null);
  };

  const cancelEditForm = () => {
    setIsEditing(null);
    setEditingSopData({ name: "", content: "" });
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">SOPs</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={openAddForm}
          disabled={isAdding || isEditing !== null}
        >
          + Add SOP
        </Button>
      </div>
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New SOP</DialogTitle>
          </DialogHeader>
          <SopForm
            initialData={{ name: "", content: "" }}
            onSubmit={handleAddSubmit}
            onCancel={cancelAddForm}
            isLoading={formLoading}
            formTitle=""
            submitButtonText="Save SOP"
          />
        </DialogContent>
      </Dialog>
      {isEditing !== null && (
        <SopForm
          initialData={editingSopData}
          onSubmit={handleUpdateSubmit}
          onCancel={cancelEditForm}
          isLoading={formLoading}
          formTitle="Edit SOP"
          submitButtonText="Update SOP"
        />
      )}
      {loading && sops.length === 0 && (
        <p className="text-center text-gray-500">Loading SOPs...</p>
      )}
      {!loading && sops.length === 0 && !isAdding && isEditing === null && (
        <div className="text-center text-gray-500 py-8">
          No SOPs found. Click "+ Add SOP" to create one.
        </div>
      )}
      {sops.length > 0 && (
        <div className="space-y-2 pt-2 max-h-[30vh] overflow-y-auto pr-2">
          {sops.map((sop) => (
            <div
              key={sop.id}
              className="rounded border p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-2 max-w-xl mx-auto shadow-sm transition-all hover:shadow-md"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer group"
                onClick={() => onSelectSop(sop.content)}
              >
                <div className="font-medium truncate group-hover:text-blue-600">
                  {sop.name}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {sop.content}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Edit SOP"
                  onClick={() => handleEditClick(sop)}
                  className="text-gray-600 hover:text-blue-600"
                  disabled={isAdding || isEditing !== null}
                >
                  ✏️
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Delete SOP"
                  onClick={() => handleDelete(sop.id)}
                  className="text-gray-600 hover:text-red-600"
                  disabled={isAdding || isEditing !== null}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {user?.role_id && (
        <div className="mb-6">
          <DefaultSopsList roleId={user.role_id} onSelectSop={onSelectSop} />
        </div>
      )}
    </div>
  );
};
