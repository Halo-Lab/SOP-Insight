import * as React from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

interface TranscriptSectionProps {
  transcripts: string[];
  onTranscriptChange: (index: number, value: string) => void;
  onAddTranscript: () => void;
  onRemoveTranscript: (index: number) => void;
}

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  transcripts,
  onTranscriptChange,
  onAddTranscript,
  onRemoveTranscript,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Transcripts</h2>
      <div className="space-y-4">
        {transcripts.map((transcript, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <TextArea
              value={transcript}
              onChange={(e) => onTranscriptChange(idx, e.target.value)}
              required
              placeholder={`Paste transcript #${idx + 1} here...`}
              rows={6}
            />
            {transcripts.length > 1 && (
              <Button
                variant="outline"
                ariaLabel="Remove transcript"
                onClick={() => onRemoveTranscript(idx)}
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
          onClick={onAddTranscript}
          tabIndex={0}
        >
          + Add transcript
        </Button>
      </div>
    </div>
  );
};

export default TranscriptSection;
