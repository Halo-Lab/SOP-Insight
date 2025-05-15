import * as React from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { SopManager } from "@/features/sop/components/SopManager";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Icons } from "@/components/ui/Icons";

interface SopSectionProps {
  sops: string[];
  onSopChange: (
    index: number,
    value: string | { name: string; content: string }
  ) => void;
  onAddSop: () => void;
  onRemoveSop: (index: number) => void;
  sopDialogIdx: number | null;
  setSopDialogIdx: (index: number | null) => void;
}

export const SopSection: React.FC<SopSectionProps> = ({
  sops,
  onSopChange,
  onAddSop,
  onRemoveSop,
  sopDialogIdx,
  setSopDialogIdx,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Manual SOPs</h2>
      <div className="space-y-4">
        {sops.map((sop, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <TextArea
              value={sop}
              onChange={(e) => onSopChange(idx, e.target.value)}
              required
              placeholder={`Paste SOP #${idx + 1} here...`}
              rows={6}
            />
            <div className="flex flex-col gap-2">
              {sops.length > 1 && (
                <Button
                  variant="outline"
                  ariaLabel="Remove SOP"
                  onClick={() => onRemoveSop(idx)}
                  tabIndex={0}
                  leftIcon={Icons.remove}
                >
                  Remove
                </Button>
              )}
              <Dialog
                open={sopDialogIdx === idx}
                onOpenChange={(open) => setSopDialogIdx(open ? idx : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    ariaLabel="Insert SOP"
                    tabIndex={0}
                    leftIcon={Icons.fileText}
                  >
                    SOP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="sr-only">Select SOP</DialogTitle>
                  <DialogDescription className="sr-only">
                    Select a SOP from the list or create a new one
                  </DialogDescription>
                  <SopManager
                    onSelectSop={(sopData) => {
                      onSopChange(idx, sopData);
                      setSopDialogIdx(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
        <Button
          variant="secondary"
          ariaLabel="Add SOP"
          onClick={onAddSop}
          tabIndex={0}
          leftIcon={Icons.add}
        >
          Add SOP
        </Button>
      </div>
    </div>
  );
};

export default SopSection;
