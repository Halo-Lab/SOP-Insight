import * as React from "react";
import { Button } from "@/components/ui/Button";

import { toast } from "sonner";
import { AnalysisResults } from "@/features/analysis/components/AnalysisResults";
import { AnalysisHistoryViewer } from "@/features/analysis/components/AnalysisHistoryViewer";
import { Icons } from "@/components/ui/Icons";

import { TranscriptSection } from "@/features/analysis/components/TranscriptSection";

import { rolesService } from "@/lib/services/roles.service";
import {
  analyzeTranscriptsStream,
  saveAnalysisHistory,
  updateAnalysisHistoryStatus,
  updateAnalysisHistoryName,
  getAnalysisHistoryItem,
} from "@/lib/services/sop.service";
import type {
  AnalysisHistory,
  AnalyzePayload,
  StreamAnalysisResult,
} from "@/lib/services/sop.service";
import { RoleSelectionModal } from "@/features/auth/components/RoleSelectionModal";
import { useAuth } from "@/lib/context/AuthContext";
import MainLayout from "@/components/common/MainLayout";
import { SopSection } from "@/features/sop/components/SopSection";

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
  const resultsRef = React.useRef<SopAnalysisResult[]>([]);
  const [loading, setLoading] = React.useState(false);
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
  const [errorState, setErrorState] = React.useState<{
    error: Error | null;
    lastProcessedIndex?: { sopIndex: number; transcriptIndex: number };
    historyId?: string;
  }>({ error: null });

  // Add a flag to track if analysis was interrupted
  const analysisInterruptedRef = React.useRef(false);

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

  const handleStreamAnalyze = (startFrom?: {
    sopIndex: number;
    transcriptIndex: number;
  }) => {
    setViewingHistory(false);
    setSelectedHistory(null);

    // Only reset error state if we're not continuing an existing analysis
    if (!startFrom) {
      setErrorState({ error: null });
    }

    // Reset the interrupted flag when starting/resuming analysis
    analysisInterruptedRef.current = false;

    if (transcripts.length === 0 || transcripts.some((t) => !t.trim())) {
      toast.error("Please add at least one transcript with content");
      return;
    }

    if (sops.length === 0 || sops.some((s) => !s.trim())) {
      toast.error("Please add at least one SOP with content");
      return;
    }

    toast.info(startFrom ? "Resuming analysis..." : "Starting analysis...");
    setLoading(true);
    setStreamingAnalysis(true);

    const totalCount = sops.length * transcripts.length;
    setTotalAnalysisCount(totalCount);

    if (!startFrom || !errorState.historyId) {
      setAnalysisProgress(0);
      if (!startFrom) {
        setResults([]);
      }
    } else if (startFrom && errorState.historyId) {
      const historyId = errorState.historyId;
      getAnalysisHistoryItem(historyId)
        .then((history: AnalysisHistory) => {
          // Parse results from history if needed
          let historyResults: SopAnalysisResult[];
          if (typeof history.results === "string") {
            historyResults = JSON.parse(history.results);
          } else {
            historyResults = history.results as SopAnalysisResult[];
          }

          const resultsWithNames = historyResults.map((result) => {
            const sopIndex = sops.findIndex((sop) => sop === result.sop);
            return {
              ...result,
              sopName: sopIndex !== -1 ? sopNames[sopIndex] : undefined,
            };
          });

          setResults(resultsWithNames);
          resultsRef.current = resultsWithNames;
        })
        .catch((error: Error) => {
          console.error("Failed to load previous analysis results:", error);
          toast.error("Failed to load previous analysis results");
        });
    }

    const payload: AnalyzePayload = {
      transcripts,
      sops,
    };

    const abort = analyzeTranscriptsStream(
      payload,
      (data: StreamAnalysisResult) => {
        if (!data || !data.results) {
          console.warn("Received invalid data structure:", data);
          return;
        }

        let completedCount = 0;
        data.results.forEach((result) => {
          if (!result || !result.analyses) {
            console.warn("Invalid result structure:", result);
            return;
          }
          completedCount += result.analyses.length;
        });

        setAnalysisProgress(completedCount);

        try {
          const resultsWithNames = data.results.map((result) => {
            const sopIndex = sops.findIndex((sop) => sop === result.sop);
            return {
              ...result,
              sopName: sopIndex !== -1 ? sopNames[sopIndex] : undefined,
            };
          });
          setResults(resultsWithNames);
          resultsRef.current = resultsWithNames;
        } catch (error) {
          console.error("Error processing analysis data:", error);
        }
      },
      (err: Error) => {
        setLoading(false);
        setStreamingAnalysis(false);
        setAbortAnalysis(null);

        // Set the flag indicating analysis was interrupted
        analysisInterruptedRef.current = true;

        // Check if the error contains historyId and lastProcessedIndex
        const enhancedError = err as Error & {
          historyId?: string;
          lastProcessedIndex?: {
            sopIndex: number;
            transcriptIndex: number;
          };
        };

        // On error, save partially completed analysis and set error state
        const currentDate = new Date();
        const name = `⚠️ Analysis ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

        if (enhancedError.historyId) {
          // If the server already created a history record, use that ID
          toast.error(`Analysis paused: ${err.message || "Unknown error"}`);

          setErrorState({
            error: err,
            lastProcessedIndex: enhancedError.lastProcessedIndex,
            historyId: enhancedError.historyId as string,
          });

          // Refresh the history sidebar
          setShowHistory(true);
          const event = new CustomEvent("refreshAnalysisHistory");
          window.dispatchEvent(event);
        } else if (resultsRef.current.length > 0) {
          saveAnalysisHistory(name, resultsRef.current, false)
            .then((savedHistory) => {
              toast.error(`Analysis paused: ${err.message || "Unknown error"}`);

              // Set error state with lastProcessedIndex from the last data
              setErrorState({
                error: err,
                lastProcessedIndex:
                  resultsRef.current.length > 0
                    ? {
                        sopIndex: resultsRef.current.length - 1,
                        transcriptIndex:
                          resultsRef.current[resultsRef.current.length - 1]
                            .analyses.length - 1,
                      }
                    : undefined,
                historyId: savedHistory.id,
              });

              // Refresh the history sidebar
              setShowHistory(true);
              const event = new CustomEvent("refreshAnalysisHistory");
              window.dispatchEvent(event);
            })
            .catch((saveError) => {
              console.error("Failed to save partial analysis:", saveError);
              toast.error("Failed to save partial analysis results");
            });
        } else {
          toast.error(err.message || "Analysis stream failed.");
        }
      },
      () => {
        setLoading(false);
        setStreamingAnalysis(false);
        setAbortAnalysis(null);

        // Only show completion toast if analysis wasn't interrupted
        if (!analysisInterruptedRef.current) {
          // If we're continuing an existing analysis that had an error
          if (startFrom && errorState.historyId) {
            // If we're continuing an analysis that had an error, update the existing history entry
            const name = `Analysis ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            const historyId = errorState.historyId;

            // First update status
            updateAnalysisHistoryStatus(historyId, true)
              .then(() => {
                return updateAnalysisHistoryName(historyId, name);
              })
              .then(() => {
                toast.success("Analysis completed and saved successfully!");
                // Refresh the history sidebar
                setShowHistory(true);
                const event = new CustomEvent("refreshAnalysisHistory");
                window.dispatchEvent(event);
                // Clear error state
                setErrorState({ error: null });
              })
              .catch((error) => {
                console.error("Failed to update analysis:", error);
                toast.error("Analysis completed but failed to update results");
              });
          } else {
            // This is a new analysis, create a new history entry
            const currentDate = new Date();
            const name = `Analysis ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

            saveAnalysisHistory(name, resultsRef.current, true)
              .then(() => {
                toast.success("Analysis completed and saved successfully!");
                // Refresh the history sidebar
                setShowHistory(true);
                const event = new CustomEvent("refreshAnalysisHistory");
                window.dispatchEvent(event);
              })
              .catch((error) => {
                console.error("Failed to save analysis:", error);
                toast.error("Analysis completed but failed to save results");
              });
          }
        }
      },
      startFrom,
      errorState.historyId
    );

    setAbortAnalysis(() => abort);
  };

  const handleCancelAnalysis = () => {
    if (abortAnalysis) {
      abortAnalysis();
      setAbortAnalysis(null);
      setLoading(false);
      setStreamingAnalysis(false);
      toast.info("Analysis cancelled");
    }
  };

  const handleClearResults = () => {
    setResults([]);
    setAnalysisProgress(0);
    setTotalAnalysisCount(0);
    toast.info("Results cleared");
  };

  const handleSelectHistory = (history: AnalysisHistory | null) => {
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
    if (user && !authLoading && user?.role_id === null) {
      setTimeout(() => {
        setShowRoleModal(true);
      }, 1500);
    }
  }, [user, authLoading]);

  const handleRoleSelect = async (roleId: string) => {
    try {
      await rolesService.updateUserRole(Number(roleId));
      if (user) {
        setUser({ ...user, role_id: Number(roleId) });
      }
      setShowRoleModal(false);
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Handler to continue analysis after error
  const handleContinueAnalysis = () => {
    if (errorState.error && errorState.lastProcessedIndex) {
      // Continue analysis from the next item
      const nextIndex = { ...errorState.lastProcessedIndex };

      // Move to next transcript for this SOP
      nextIndex.transcriptIndex += 1;

      // If we've reached the end of transcripts for this SOP, move to the next SOP
      if (nextIndex.transcriptIndex >= transcripts.length) {
        nextIndex.sopIndex += 1;
        nextIndex.transcriptIndex = 0;
      }

      // Don't reset results - pass current historyId to preserve previous results
      const historyId = errorState.historyId;

      // Start analysis from the next index with historyId to ensure results are merged
      handleStreamAnalyze(nextIndex);

      // If we had saved the partial results to history, update the status
      if (historyId) {
        updateAnalysisHistoryStatus(historyId, false).catch((updateError) => {
          console.error(
            "Failed to update analysis history status:",
            updateError
          );
        });
      }
    }
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

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleStreamAnalyze()}
                disabled={loading || !user}
                loading={loading}
              >
                {streamingAnalysis ? "Analyzing..." : "Analyze"}
              </Button>

              {streamingAnalysis && (
                <Button
                  onClick={handleCancelAnalysis}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:border-red-600"
                >
                  Cancel
                </Button>
              )}

              {errorState.error && errorState.lastProcessedIndex && (
                <Button
                  onClick={handleContinueAnalysis}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Continue Analysis
                </Button>
              )}

              {results.length > 0 && (
                <Button
                  onClick={handleClearResults}
                  variant="outline"
                  className="text-gray-600"
                >
                  Clear Results
                </Button>
              )}
            </div>

            {results.length > 0 && (
              <div
                ref={resultsHeaderRef}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Analysis Results{" "}
                    {analysisProgress > 0 && totalAnalysisCount > 0 && (
                      <span className="text-sm font-normal text-gray-500">
                        ({analysisProgress} / {totalAnalysisCount})
                      </span>
                    )}
                    {streamingAnalysis && !loading ? "(Live)" : ""}
                  </h2>
                </div>
                <AnalysisResults results={results} />
              </div>
            )}

            {errorState.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                <div className="flex items-center">
                  <Icons.error className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-sm font-medium text-red-800">
                    Analysis Error
                  </h3>
                </div>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorState.error.message}</p>
                </div>
                <div className="mt-3">
                  <Button
                    onClick={handleContinueAnalysis}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2"
                    size="sm"
                  >
                    Continue Analysis
                  </Button>
                </div>
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
