import * as React from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { SopFormData } from "@/lib/services/sop.service";

interface SopFormProps {
  initialData: SopFormData;
  onSubmit: (formData: SopFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  submitButtonText?: string;
  formTitle: string;
}

export const SopForm: React.FC<SopFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitButtonText = "Save SOP",
  formTitle,
}) => {
  const [form, setForm] = React.useState<SopFormData>(initialData);

  React.useEffect(() => {
    setForm(initialData); // Sync form when initialData changes (e.g., when selecting a new SOP to edit)
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent submission if already loading
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded p-4 bg-slate-50 space-y-3 shadow"
    >
      <h3 className="text-lg font-medium">{formTitle}</h3>
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
          type="button" // Ensure it doesn't submit the form
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={isLoading}
          disabled={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
