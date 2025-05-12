import * as React from "react";
import { Button } from "./Button";
import { TextArea } from "./TextArea";
import { TextField } from "./TextField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";

interface Sop {
  id: number;
  name: string;
  content: string;
}

interface SopManagerProps {
  onSelectSop: (content: string) => void;
}

export const SopManager: React.FC<SopManagerProps> = ({ onSelectSop }) => {
  const [sops, setSops] = React.useState<Sop[]>([]);
  const [error, setError] = React.useState("");
  const [viewSop, setViewSop] = React.useState<Sop | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<number | null>(null);
  const [form, setForm] = React.useState({ name: "", content: "" });
  const [loading, setLoading] = React.useState(false);

  const fetchSops = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sop`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSops(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch SOPs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSops();
  }, []);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSops([data, ...sops]);
      setForm({ name: "", content: "" });
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add SOP");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sop: Sop) => {
    setIsEditing(sop.id);
    setForm({ name: sop.name, content: sop.content });
  };

  const handleUpdate = async () => {
    if (isEditing === null) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/sop/${isEditing}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSops(sops.map((sop) => (sop.id === isEditing ? data : sop)));
      setIsEditing(null);
      setForm({ name: "", content: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update SOP");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SOP?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sop/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSops(sops.filter((sop) => sop.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete SOP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">SOPs</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setIsEditing(null);
            setForm({ name: "", content: "" });
          }}
        >
          + Add SOP
        </Button>
      </div>
      {isAdding && (
        <div className="border rounded p-3 bg-gray-50 space-y-2">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter SOP name..."
          />
          <TextArea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Enter SOP content..."
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setForm({ name: "", content: "" });
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      )}
      {isEditing !== null && (
        <div className="border rounded p-3 bg-gray-50 space-y-2">
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter SOP name..."
          />
          <TextArea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Enter SOP content..."
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(null);
                setForm({ name: "", content: "" });
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} loading={loading}>
              Update
            </Button>
          </div>
        </div>
      )}
      {sops.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No SOPs found</div>
      ) : (
        <div className="space-y-2">
          {sops.map((sop) => (
            <div
              key={sop.id}
              className="rounded border p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-2 max-w-xl mx-auto"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onSelectSop(sop.content)}
              >
                <div className="font-medium truncate">{sop.name}</div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {sop.content}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Edit"
                  onClick={() => handleEdit(sop)}
                >
                  ✏️
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Delete"
                  onClick={() => handleDelete(sop.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!viewSop} onOpenChange={() => setViewSop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewSop?.name}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm text-gray-800 pt-2">
            {viewSop?.content}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (viewSop) onSelectSop(viewSop.content);
                setViewSop(null);
              }}
            >
              Use this SOP
            </Button>
            <Button variant="outline" onClick={() => setViewSop(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
