import * as React from "react";
import AnalysisHistorySidebar from "@/features/analysis/components/AnalysisHistory";

import type { AnalysisHistory } from "@/lib/services/sop.service";
import Header from "./Header";
import HistoryToggleButton from "./HistoryToggleButton";

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
  const toggleButtonRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (toggleButtonRef.current) {
      toggleButtonRef.current.style.left = showHistory ? "210px" : "0px";
    }
  }, [showHistory]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 sticky top-0 z-30">
        <Header onLogout={onLogout} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showHistory && (
          <div className="w-64 border-r-2 flex-shrink-0 overflow-hidden flex flex-col bg-white">
            <div className="flex-1 overflow-auto">
              <AnalysisHistorySidebar
                onSelectHistory={onSelectHistory}
                selectedHistoryId={selectedHistory?.id}
              />
            </div>
          </div>
        )}

        <main
          className={`flex-1 overflow-auto ${
            showHistory ? "max-w-[calc(100%-16rem)]" : "max-w-5xl mx-auto"
          } px-4 pb-10`}
        >
          <div
            ref={toggleButtonRef}
            className="fixed top-[110px] bg-gray-50 z-20 transition-all duration-300"
          >
            <HistoryToggleButton
              showHistory={showHistory}
              toggleHistory={toggleHistory}
            />
          </div>

          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
