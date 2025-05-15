import * as React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  analyzeTranscriptsStream,
  saveAnalysisHistory,
} from "@/lib/services/sop.service";
import type {
  AnalyzePayload,
  StreamAnalysisResult,
  AnalysisHistory,
} from "@/lib/services/sop.service";
import { RoleSelectionModal } from "@/components/RoleSelectionModal";
import { rolesService } from "@/lib/services/roles.service";
import TranscriptSection from "@/components/TranscriptSection";
import SopSection from "@/components/SopSection";
import AnalysisControls from "@/components/AnalysisControls";
import AnalysisResults from "@/components/AnalysisResults";
import AnalysisHistoryViewer from "@/components/AnalysisHistoryViewer";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface SingleAnalysis {
  transcript: string;
  result: string;
  tokens: number;
}

export interface SopAnalysisResult {
  sop: string;
  sopName?: string;
  analyses: SingleAnalysis[];
}

export const HomePage: React.FC = () => {
  const [transcripts, setTranscripts] = React.useState<string[]>([""]);
  const [sops, setSops] = React.useState<string[]>([""]);
  const [sopNames, setSopNames] = React.useState<(string | undefined)[]>([
    undefined,
  ]);
  const [results, setResults] = React.useState<SopAnalysisResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sopDialogIdx, setSopDialogIdx] = React.useState<number | null>(null);
  const { logout, user, setUser, loading: authLoading } = useAuth();
  const resultsHeaderRef = React.useRef<HTMLHeadingElement>(null);
  const [showRoleModal, setShowRoleModal] = React.useState(false);
  const [streamingAnalysis, setStreamingAnalysis] = React.useState(false);
  const [abortAnalysis, setAbortAnalysis] = React.useState<(() => void) | null>(
    null
  );
  const [analysisProgress, setAnalysisProgress] = React.useState<number>(0);
  const [totalAnalysisCount, setTotalAnalysisCount] = React.useState<number>(0);

  const [showHistory, setShowHistory] = React.useState<boolean>(true);
  const [selectedHistory, setSelectedHistory] =
    React.useState<AnalysisHistory | null>(null);
  const [viewingHistory, setViewingHistory] = React.useState<boolean>(false);

  const handleTranscriptChange = (index: number, value: string) => {
    setTranscripts((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleAddTranscript = () => {
    setTranscripts((prev) => [...prev, ""]);
  };

  const handleRemoveTranscript = (index: number) => {
    setTranscripts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSopChange = (
    index: number,
    value: string | { name: string; content: string }
  ) => {
    if (typeof value === "string") {
      const newSops = [...sops];
      newSops[index] = value;
      setSops(newSops);

      const newSopNames = [...sopNames];
      newSopNames[index] = undefined;
      setSopNames(newSopNames);
    } else {
      const newSops = [...sops];
      newSops[index] = value.content;
      setSops(newSops);

      const newSopNames = [...sopNames];
      newSopNames[index] = value.name;
      setSopNames(newSopNames);
    }
  };

  const handleAddSop = () => {
    setSops((prev) => [...prev, ""]);
    setSopNames((prev) => [...prev, undefined]);
  };

  const handleRemoveSop = (index: number) => {
    setSops((prev) => prev.filter((_, i) => i !== index));
    setSopNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    logout();
  };

  const handleStreamAnalyze = () => {
    setError(null);
    setResults([]);
    setViewingHistory(false);
    setSelectedHistory(null);

    if (transcripts.length === 0 || transcripts.some((t) => !t.trim())) {
      setError("At least one transcript is required and cannot be empty.");
      return;
    }

    if (sops.length === 0 || sops.some((s) => !s.trim())) {
      setError("At least one SOP is required and cannot be empty.");
      return;
    }

    setLoading(true);
    setStreamingAnalysis(true);
    setAnalysisProgress(0);

    const totalCount = sops.length * transcripts.length;
    setTotalAnalysisCount(totalCount);

    const payload: AnalyzePayload = { transcripts, sops };

    const abort = analyzeTranscriptsStream(
      payload,
      (data: StreamAnalysisResult) => {
        let completedCount = 0;
        data.results.forEach((result) => {
          completedCount += result.analyses.length;
        });

        setAnalysisProgress(completedCount);

        const resultsWithNames = data.results.map((result) => ({
          ...result,
          sopName: sopNames[sops.findIndex((sop) => sop === result.sop)],
        }));

        setResults((prevResults) => {
          if (
            JSON.stringify(prevResults) !== JSON.stringify(resultsWithNames)
          ) {
            return resultsWithNames;
          }
          return prevResults;
        });
      },
      (err: Error) => {
        setError(err.message || "Analysis stream failed.");
        setLoading(false);
        setStreamingAnalysis(false);
        setAbortAnalysis(null);
      },
      () => {
        setLoading(false);
        setStreamingAnalysis(false);
        setAbortAnalysis(null);
      }
    );

    setAbortAnalysis(() => abort);
  };

  const handleCancelAnalysis = () => {
    if (abortAnalysis) {
      abortAnalysis();
      setAbortAnalysis(null);
      setLoading(false);
      setStreamingAnalysis(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setAnalysisProgress(0);
    setTotalAnalysisCount(0);
    setError(null);
  };

  const handleSaveResults = async () => {
    if (results.length === 0) {
      toast.error("No results to save");
      return;
    }

    try {
      const currentDate = new Date();
      const name = `Analysis ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

      await saveAnalysisHistory(name, results);
      toast.success("Analysis saved to history");

      // Refresh the history sidebar by triggering a state change
      setShowHistory(true);
      // Force the AnalysisHistorySidebar to refresh its data
      const event = new CustomEvent("refreshAnalysisHistory");
      window.dispatchEvent(event);
    } catch (error) {
      toast.error("Failed to save analysis");
      console.error(error);
    }
  };

  const handleSelectHistory = (history: AnalysisHistory) => {
    setSelectedHistory(history);
    setViewingHistory(true);
  };

  const handleBackToCurrentAnalysis = () => {
    setViewingHistory(false);
    setSelectedHistory(null);
  };

  React.useEffect(() => {
    if (results.length > 0 && resultsHeaderRef.current) {
      resultsHeaderRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  React.useEffect(() => {
    if (!authLoading) {
      setShowRoleModal(!!user && (!user.role_id || user.role_id === null));
    }
  }, [user, authLoading]);

  const handleRoleSelect = async (roleId: string) => {
    try {
      await rolesService.updateUserRole(Number(roleId));
      if (user) {
        setUser({ ...user, role_id: Number(roleId) });
      }
      setShowRoleModal(false);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <>
      <MainLayout
        showHistory={showHistory}
        toggleHistory={toggleHistory}
        selectedHistory={selectedHistory}
        onSelectHistory={handleSelectHistory}
        onLogout={handleLogout}
      >
        {viewingHistory ? (
          <div>
            <div className="flex justify-between items-center my-4">
              <h2 className="text-xl font-semibold">Viewing Saved Analysis</h2>
              <Button
                onClick={handleBackToCurrentAnalysis}
                variant="outline"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
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
                  className="mr-1"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Back to Current Analysis
              </Button>
            </div>
            <AnalysisHistoryViewer history={selectedHistory} />
          </div>
        ) : (
          <div className="space-y-6">
            <TranscriptSection
              transcripts={transcripts}
              onTranscriptChange={handleTranscriptChange}
              onAddTranscript={handleAddTranscript}
              onRemoveTranscript={handleRemoveTranscript}
            />

            <SopSection
              sops={sops}
              onSopChange={handleSopChange}
              onAddSop={handleAddSop}
              onRemoveSop={handleRemoveSop}
              sopDialogIdx={sopDialogIdx}
              setSopDialogIdx={setSopDialogIdx}
            />

            <AnalysisControls
              onAnalyze={handleStreamAnalyze}
              onCancel={handleCancelAnalysis}
              error={error}
              loading={loading}
              streamingAnalysis={streamingAnalysis}
              abortAnalysis={abortAnalysis}
              analysisProgress={analysisProgress}
              totalAnalysisCount={totalAnalysisCount}
            />

            {results.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2
                    ref={resultsHeaderRef}
                    className="text-xl font-semibold text-center"
                  >
                    Analysis Results{" "}
                    {streamingAnalysis && !loading ? "(Live)" : ""}
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveResults}
                      variant="secondary"
                      disabled={loading || results.length === 0}
                    >
                      Save Results
                    </Button>
                    <Button
                      onClick={handleClearResults}
                      variant="outline"
                      disabled={loading || results.length === 0}
                    >
                      Clear Results
                    </Button>
                  </div>
                </div>
                <AnalysisResults results={results} />
              </div>
            )}
          </div>
        )}
      </MainLayout>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelect={handleRoleSelect}
      />
    </>
  );
};

export default HomePage;
