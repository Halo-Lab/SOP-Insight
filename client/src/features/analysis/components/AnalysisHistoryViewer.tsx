import * as React from "react";
import { Tabs } from "@/components/ui/Tabs";
import ReactMarkdown from "react-markdown";
import type { AnalysisHistory } from "@/lib/services/sop.service";
import type { SopAnalysisResult } from "@/pages/HomePage";

interface AnalysisHistoryViewerProps {
  history: AnalysisHistory | null;
}

export const AnalysisHistoryViewer: React.FC<AnalysisHistoryViewerProps> = ({
  history,
}) => {
  const [results, setResults] = React.useState<SopAnalysisResult[]>([]);

  React.useEffect(() => {
    if (history) {
      // If the results are a string, parse them as JSON
      if (typeof history.results === "string") {
        try {
          setResults(JSON.parse(history.results));
        } catch (error) {
          console.error("Failed to parse analysis results:", error);
          setResults([]);
        }
      } else {
        setResults(history.results);
      }
    } else {
      setResults([]);
    }
  }, [history]);

  if (!history) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select an analysis from history to view</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No results found</p>
          <p className="text-sm text-gray-400">
            This analysis may be corrupted
          </p>
        </div>
      </div>
    );
  }

  const sopTabs = results.map((sopResult, sIdx) => ({
    label: sopResult.sopName || `SOP ${sIdx + 1}`,
    content: (
      <Tabs
        tabs={sopResult.analyses.map((analysis, tIdx) => ({
          label: `Transcript-analyzed-${tIdx + 1}`,
          content: (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Transcript #{tIdx + 1}</span>
                <span className="text-xs text-gray-500">
                  Tokens used: {analysis.tokens}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-700 font-medium">
                  Result:
                </span>
                <div className="prose prose-sm max-w-none bg-white rounded p-2 mt-1">
                  <ReactMarkdown>{analysis.result}</ReactMarkdown>
                </div>
              </div>
            </div>
          ),
        }))}
      />
    ),
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{history.name}</h2>
        <p className="text-sm text-gray-500">
          {new Date(history.created_at).toLocaleString()}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Tabs tabs={sopTabs} />
      </div>
    </div>
  );
};

export default AnalysisHistoryViewer;
