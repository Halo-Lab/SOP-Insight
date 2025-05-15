import * as React from "react";
import { Button } from "@/components/ui/Button";
import { AnalysisStatus } from "@/features/analysis/components/AnalysisStatus";
import { Icons } from "@/components/ui/Icons";

interface AnalysisControlsProps {
  onAnalyze: () => void;
  onCancel: () => void;
  loading: boolean;
  streamingAnalysis: boolean;
  abortAnalysis: (() => void) | null;
  analysisProgress: number;
  totalAnalysisCount: number;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  onAnalyze,
  onCancel,
  loading,
  streamingAnalysis,
  abortAnalysis,
  analysisProgress,
  totalAnalysisCount,
}) => {
  return (
    <div className="mt-8">
      <div className="flex gap-2 items-center">
        <Button
          onClick={onAnalyze}
          loading={loading && !abortAnalysis}
          ariaLabel="Analyze transcripts with streaming"
          tabIndex={0}
          className="w-full sm:w-auto"
          disabled={loading}
          leftIcon={Icons.play}
        >
          Analyze
        </Button>

        {streamingAnalysis && abortAnalysis && (
          <Button
            onClick={onCancel}
            variant="outline"
            ariaLabel="Cancel analysis"
            tabIndex={0}
            leftIcon={Icons.pause}
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
