import * as React from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { SopFormData } from "@/lib/services/sop.service";
import { Icons } from "@/components/ui/Icons";

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
  const [errors, setErrors] = React.useState<{
    name?: string;
    content?: string;
  }>({});

  React.useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { name?: string; content?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (validateForm()) {
      await onSubmit(form);
    }
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
        onChange={(e) => {
          setForm({ ...form, name: e.target.value });
          if (errors.name) {
            setErrors({ ...errors, name: undefined });
          }
        }}
        placeholder="Enter SOP name..."
        required
        error={errors.name}
      />
      <TextArea
        label="Content"
        value={form.content}
        onChange={(e) => {
          setForm({ ...form, content: e.target.value });
          if (errors.content) {
            setErrors({ ...errors, content: undefined });
          }
        }}
        placeholder="Enter SOP content..."
        rows={4}
        required
        error={errors.content}
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
          leftIcon={Icons.close}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={isLoading}
          disabled={isLoading}
          leftIcon={Icons.save}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
