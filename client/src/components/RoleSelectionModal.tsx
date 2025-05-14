import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { Role } from "@/lib/services/roles.service";
import { rolesService } from "@/lib/services/roles.service";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (roleId: string) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedRole) {
      setSubmitting(true);
      try {
        await rolesService.updateUserRole(Number(selectedRole));
        onRoleSelect(selectedRole);
        onClose();
      } catch (error) {
        console.error("Error updating role:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Choose the role that best describes your position. This will help
              us customize the system to your needs.
            </p>
            <div className="flex items-center mt-2 mb-4">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <span className="text-sm text-blue-600 font-medium">
                After you select your role, the system will suggest SOPs
                tailored to your position.
              </span>
            </div>
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                  <SelectItem key="other" value="-1">
                    Other / Custom Role
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            type="submit"
            disabled={!selectedRole || submitting}
            className="w-full"
          >
            {submitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
