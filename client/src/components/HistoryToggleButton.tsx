import * as React from "react";
import { Button } from "@/components/ui/Button";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </Button>
  );
};

export default HistoryToggleButton;
