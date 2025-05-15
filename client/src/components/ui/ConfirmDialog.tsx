import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Icons.delete className="h-6 w-6 text-red-500" />;
      case "warning":
        return <Icons.warning className="h-6 w-6 text-amber-500" />;
      case "info":
      default:
        return <Icons.info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "default";
      case "warning":
      case "info":
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              leftIcon={Icons.close}
            >
              {cancelText}
            </Button>
            <Button
              variant={getButtonVariant()}
              onClick={onConfirm}
              loading={isLoading}
              className={
                variant === "danger" ? "bg-red-600 hover:bg-red-700" : ""
              }
              leftIcon={variant === "danger" ? Icons.delete : Icons.check}
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
