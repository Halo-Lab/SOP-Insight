import * as React from "react";
import { Button } from "@/components/ui/Button";
import { AnalysisStatus } from "@/components/AnalysisStatus";

interface AnalysisControlsProps {
  onAnalyze: () => void;
  onCancel: () => void;
  error: string | null;
  loading: boolean;
  streamingAnalysis: boolean;
  abortAnalysis: (() => void) | null;
  analysisProgress: number;
  totalAnalysisCount: number;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  onAnalyze,
  onCancel,
  error,
  loading,
  streamingAnalysis,
  abortAnalysis,
  analysisProgress,
  totalAnalysisCount,
}) => {
  return (
    <div className="mt-8">
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Button
          onClick={onAnalyze}
          loading={loading && !abortAnalysis}
          ariaLabel="Analyze transcripts with streaming"
          tabIndex={0}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          Analyze
        </Button>

        {streamingAnalysis && abortAnalysis && (
          <Button
            onClick={onCancel}
            variant="outline"
            ariaLabel="Cancel analysis"
            tabIndex={0}
          >
            Cancel
          </Button>
        )}
      </div>

      {streamingAnalysis && totalAnalysisCount > 0 && (
        <AnalysisStatus
          current={analysisProgress}
          total={totalAnalysisCount}
          isLoading={loading}
          isStreaming={streamingAnalysis}
        />
      )}
    </div>
  );
};

export default AnalysisControls;
