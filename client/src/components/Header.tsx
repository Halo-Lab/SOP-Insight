import * as React from "react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="w-full bg-white shadow-sm mb-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
        <h1 className="text-xl sm:text-2xl font-bold">SOP Insight Analyzer</h1>
        <Button
          variant="outline"
          ariaLabel="Logout"
          onClick={onLogout}
          tabIndex={0}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
