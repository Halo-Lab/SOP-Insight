import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

interface HistoryToggleButtonProps {
  showHistory: boolean;
  toggleHistory: () => void;
}

export const HistoryToggleButton: React.FC<HistoryToggleButtonProps> = ({
  showHistory,
  toggleHistory,
}) => {
  return (
    <Button
      onClick={toggleHistory}
      className="bg-white border border-blue-300 text-blue-600 p-2 rounded-md shadow-sm hover:bg-blue-50"
      ariaLabel={showHistory ? "Hide history" : "Show history"}
    >
      {showHistory ? (
        <Icons.chevronLeft size={16} />
      ) : (
        <Icons.chevronRight size={16} />
      )}
    </Button>
  );
};

export default HistoryToggleButton;
