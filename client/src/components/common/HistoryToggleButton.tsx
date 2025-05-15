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
      className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-r-md shadow-md z-10"
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
