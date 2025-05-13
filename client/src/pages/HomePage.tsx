import * as React from "react";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { Tabs } from "@/components/Tabs";
import { SopManager } from "@/components/SopManager";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/Dialog";
import { analyzeTranscripts as analyzeTranscriptsService } from "@/lib/services/sop.service";
import type { AnalyzePayload } from "@/lib/services/sop.service";
import type { ApiError } from "@/lib/services/api.service";

interface SingleAnalysis {
  transcript: string;
  result: string;
  tokens: number;
}

export interface SopAnalysisResult {
  sop: string;
  analyses: SingleAnalysis[];
}

export const HomePage: React.FC = () => {
  const [transcripts, setTranscripts] = React.useState<string[]>([""]);
  const [sops, setSops] = React.useState<string[]>([""]);
  const [results, setResults] = React.useState<SopAnalysisResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sopDialogIdx, setSopDialogIdx] = React.useState<number | null>(null);
  const { logout } = useAuth();

  const handleTranscriptChange = (index: number, value: string) => {
    setTranscripts((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleAddTranscript = () => {
    setTranscripts((prev) => [...prev, ""]);
  };

  const handleRemoveTranscript = (index: number) => {
    setTranscripts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSopChange = (index: number, value: string) => {
    setSops((prev) => prev.map((sop, i) => (i === index ? value : sop)));
  };

  const handleAddSop = () => {
    setSops((prev) => [...prev, ""]);
  };

  const handleRemoveSop = (index: number) => {
    setSops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    logout();
  };

  const handleAnalyze = async () => {
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
    try {
      const payload: AnalyzePayload = { transcripts, sops };
      const data = await analyzeTranscriptsService(payload);
      setResults(data.sops || []);
    } catch (err) {
      const apiErr = err as ApiError;
      console.error("Analysis error:", apiErr);
      setError(
        apiErr.message || "Analysis failed due to a network or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  const sopTabs = results.map((sopResult, sIdx) => ({
    label: `SOP ${sIdx + 1}`,
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
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-white shadow-sm mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
          <h1 className="text-xl sm:text-2xl font-bold">
            SOP Insight Analyzer
          </h1>
          <Button
            variant="outline"
            ariaLabel="Logout"
            onClick={handleLogout}
            tabIndex={0}
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 pb-10">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Transcripts</h2>
            <div className="space-y-4">
              {transcripts.map((transcript, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <TextArea
                    value={transcript}
                    onChange={(e) =>
                      handleTranscriptChange(idx, e.target.value)
                    }
                    required
                    placeholder={`Paste transcript #${idx + 1} here...`}
                    rows={6}
                  />
                  {transcripts.length > 1 && (
                    <Button
                      variant="outline"
                      ariaLabel="Remove transcript"
                      onClick={() => handleRemoveTranscript(idx)}
                      tabIndex={0}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                ariaLabel="Add transcript"
                onClick={handleAddTranscript}
                tabIndex={0}
              >
                + Add transcript
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Manual SOPs</h2>
            <div className="space-y-4">
              {sops.map((sop, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <TextArea
                    value={sop}
                    onChange={(e) => handleSopChange(idx, e.target.value)}
                    required
                    placeholder={`Paste SOP #${idx + 1} here...`}
                    rows={6}
                  />
                  <div className="flex flex-col gap-2">
                    {sops.length > 1 && (
                      <Button
                        variant="outline"
                        ariaLabel="Remove SOP"
                        onClick={() => handleRemoveSop(idx)}
                        tabIndex={0}
                      >
                        Remove
                      </Button>
                    )}
                    <Dialog
                      open={sopDialogIdx === idx}
                      onOpenChange={(open) =>
                        setSopDialogIdx(open ? idx : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          ariaLabel="Insert SOP"
                          tabIndex={0}
                        >
                          SOP
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle className="sr-only">
                          Select SOP
                        </DialogTitle>
                        <SopManager
                          onSelectSop={(content) => {
                            handleSopChange(idx, content);
                            setSopDialogIdx(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                ariaLabel="Add SOP"
                onClick={handleAddSop}
                tabIndex={0}
              >
                + Add SOP
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center"
              role="alert"
            >
              {error}
            </div>
          )}
          <Button
            onClick={handleAnalyze}
            loading={loading}
            ariaLabel="Analyze transcripts"
            tabIndex={0}
            className="w-full sm:w-auto"
          >
            Analyze
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Analysis Results
            </h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Tabs tabs={sopTabs} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
