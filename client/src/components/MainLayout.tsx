import * as React from "react";
import Header from "@/components/Header";
import AnalysisHistorySidebar from "@/components/AnalysisHistory";
import HistoryToggleButton from "@/components/HistoryToggleButton";
import type { AnalysisHistory } from "@/lib/services/sop.service";

interface MainLayoutProps {
  children: React.ReactNode;
  showHistory: boolean;
  toggleHistory: () => void;
  selectedHistory?: AnalysisHistory | null;
  onSelectHistory: (history: AnalysisHistory) => void;
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHistory,
  toggleHistory,
  selectedHistory,
  onSelectHistory,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />

      <div className="flex">
        {showHistory && (
          <div className="w-64 h-[calc(100vh-64px)] border-r">
            <AnalysisHistorySidebar
              onSelectHistory={onSelectHistory}
              selectedHistoryId={selectedHistory?.id}
            />
          </div>
        )}

        <main
          className={`flex-1 ${
            showHistory ? "max-w-[calc(100%-16rem)]" : "max-w-5xl mx-auto"
          } px-4 pb-10`}
        >
          <HistoryToggleButton
            showHistory={showHistory}
            toggleHistory={toggleHistory}
          />

          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
