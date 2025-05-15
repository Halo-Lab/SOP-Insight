import * as React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { analyzeTranscriptsStream } from "@/lib/services/sop.service";
import type {
  AnalyzePayload,
  StreamAnalysisResult,
} from "@/lib/services/sop.service";
import { RoleSelectionModal } from "@/components/RoleSelectionModal";
import { rolesService } from "@/lib/services/roles.service";
import TranscriptSection from "@/components/TranscriptSection";
import SopSection from "@/components/SopSection";
import AnalysisControls from "@/components/AnalysisControls";
import AnalysisResults from "@/components/AnalysisResults";
import Header from "@/components/Header";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 pb-10">
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
        </div>

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

        <AnalysisResults
          results={results}
          onClearResults={handleClearResults}
          resultsHeaderRef={resultsHeaderRef}
          streamingAnalysis={streamingAnalysis}
          loading={loading}
        />
      </main>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
};

export default HomePage;
