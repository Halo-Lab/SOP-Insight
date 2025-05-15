import * as React from "react";

interface AnalysisStatusProps {
  current: number;
  total: number;
  isLoading: boolean;
  isStreaming: boolean;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  current,
  total,
  isLoading,
  isStreaming,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isProcessing = isStreaming && isLoading;
  const isCompleted = isStreaming && !isLoading;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">
          Analysis progress: {current} of {total}
        </span>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      <ProgressBar percentage={percentage} />
      <StatusMessage isProcessing={isProcessing} isCompleted={isCompleted} />
    </div>
  );
};

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
);

const StatusMessage: React.FC<{
  isProcessing: boolean;
  isCompleted: boolean;
}> = ({ isProcessing, isCompleted }) => (
  <div className="mt-2 text-sm text-gray-500 text-center">
    {isProcessing && (
      <span>Processing... Results will appear as they become available</span>
    )}
    {isCompleted && <span>Analysis completed!</span>}
  </div>
);

export default AnalysisStatus;
