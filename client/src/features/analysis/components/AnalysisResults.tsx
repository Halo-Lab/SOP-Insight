import * as React from "react";
import { Tabs } from "@/components/ui/Tabs";
import ReactMarkdown from "react-markdown";
import type { SopAnalysisResult } from "@/pages/HomePage";

interface AnalysisResultsProps {
  results: SopAnalysisResult[];
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
}) => {
  const sopTabs = React.useMemo(() => {
    if (results.length === 0) {
      return [];
    }

    return results.map((sopResult, sIdx) => {
      const sopLabel = sopResult.sopName || `SOP ${sIdx + 1}`;

      return {
        label: sopLabel,
        content: (
          <Tabs
            tabs={sopResult.analyses.map((analysis, tIdx) => {
              const transcriptLabel = `Transcript-analyzed-${tIdx + 1}`;

              return {
                label: transcriptLabel,
                content: (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        Transcript #{tIdx + 1}
                      </span>
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
              };
            })}
          />
        ),
      };
    });
  }, [results]);

  if (results.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Tabs tabs={sopTabs} />
      </div>
    </div>
  );
};

export default AnalysisResults;
