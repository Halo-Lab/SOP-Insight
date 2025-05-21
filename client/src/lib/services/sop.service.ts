import request, { requestStream } from "./api.service";
import type { SopAnalysisResult } from "@/pages/HomePage";

// Define interfaces for SOP data
export interface Sop {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  // Add any other relevant fields
}

export interface AnalysisHistory {
  id: string;
  name: string;
  results: string | SopAnalysisResult[];
  user_id: string;
  created_at: string;
  is_complete: boolean;
  last_processed_index?: string;
}

export interface SopFormData {
  name: string;
  content: string;
}

export interface AnalysisResult {
  results: Array<{
    sop: string;
    analyses: Array<{
      transcript: string;
      result: string;
      tokens: number;
    }>;
  }>;
}

export interface StreamAnalysisResult {
  results: Array<{
    sop: string;
    analyses: Array<{
      transcript: string;
      result: string;
      tokens: number;
    }>;
  }>;
  error?: string;
  completed?: boolean;
  partialResults?: Array<{
    sop: string;
    analyses: Array<{
      transcript: string;
      result: string;
      tokens: number;
    }>;
  }>;
  lastProcessedIndex?: {
    sopIndex: number;
    transcriptIndex: number;
  };
  historyId?: string;
}

export interface AnalyzePayload {
  transcripts: string[];
  sops: string[];
  startFrom?: { sopIndex: number; transcriptIndex: number };
  history_id?: string;
}

export interface DefaultSop {
  id: number;
  role_id: number;
  name: string;
  goal: string;
  content: string;
  role_name: string;
  created_at: string;
}

// SOP API functions
export const fetchSops = async (): Promise<Sop[]> => {
  return request<Sop[]>("/sop");
};

export const createSop = async (sopData: SopFormData): Promise<Sop> => {
  return request<Sop>("/sop", {
    method: "POST",
    body: JSON.stringify(sopData),
  });
};

export const updateSop = async (
  id: string,
  sopData: SopFormData
): Promise<Sop> => {
  return request<Sop>(`/sop/${id}`, {
    method: "PUT",
    body: JSON.stringify(sopData),
  });
};

export const deleteSop = async (id: string): Promise<null> => {
  //DELETE often returns 204 No Content
  return request<null>(`/sop/${id}`, {
    method: "DELETE",
  });
};

// Analysis API function
export const analyzeTranscripts = async (
  payload: AnalyzePayload
): Promise<AnalysisResult> => {
  return request<AnalysisResult>("/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Streaming analysis function using Server-Sent Events
export const analyzeTranscriptsStream = (
  payload: AnalyzePayload,
  onProgress: (data: StreamAnalysisResult) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
  startFrom?: { sopIndex: number; transcriptIndex: number },
  historyId?: string
): void => {
  const requestPayload = {
    ...payload,
    startFrom,
    history_id: historyId,
  };

  requestStream<StreamAnalysisResult>(
    "/analyze/stream",
    {
      method: "POST",
      data: requestPayload,
    },
    (data) => {
      if (data.error) {
        if (data.historyId) {
          const enhancedError = new Error(data.error) as Error & {
            historyId: string;
            lastProcessedIndex?: {
              sopIndex: number;
              transcriptIndex: number;
            };
          };
          enhancedError.historyId = data.historyId;
          enhancedError.lastProcessedIndex = data.lastProcessedIndex;
          onError(enhancedError);
        } else {
          onError(new Error(data.error));
        }

        if (data.partialResults) {
          onProgress({
            results: data.partialResults,
            lastProcessedIndex: data.lastProcessedIndex,
          });
        }
      } else if (data.results) {
        onProgress(data);
      }
    },
    onError,
    onComplete
  );
};

// History API functions
export const saveAnalysisHistory = async (
  name: string,
  results: SopAnalysisResult[],
  is_complete: boolean = true
): Promise<AnalysisHistory> => {
  return request<AnalysisHistory>("/analyze/history", {
    method: "POST",
    body: JSON.stringify({ name, results, is_complete }),
  });
};

export const getAnalysisHistory = async (): Promise<AnalysisHistory[]> => {
  return request<AnalysisHistory[]>("/analyze/history");
};

export const getAnalysisHistoryItem = async (
  id: string
): Promise<AnalysisHistory> => {
  return request<AnalysisHistory>(`/analyze/history/${id}`);
};

export const deleteAnalysisHistory = async (
  id: string
): Promise<{ success: boolean }> => {
  return request<{ success: boolean }>(`/analyze/history/${id}`, {
    method: "DELETE",
  });
};

export const updateAnalysisHistoryName = async (
  id: string,
  name: string
): Promise<AnalysisHistory> => {
  return request<AnalysisHistory>(`/analyze/history/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
};

export const updateAnalysisHistoryStatus = async (
  id: string,
  is_complete: boolean
): Promise<AnalysisHistory> => {
  return request<AnalysisHistory>(`/analyze/history/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_complete }),
  });
};

export const sopService = {
  async getDefaultSopsByRole(roleId: number): Promise<DefaultSop[]> {
    try {
      const result = await request<DefaultSop[]>(
        `/sop/default-sops?role_id=${roleId}`
      );
      return result;
    } catch (error) {
      console.error("Error in getDefaultSopsByRole:", error);
      throw error;
    }
  },
};

export const continueAnalysisFromHistory = (
  historyId: string,
  transcripts: string[],
  sops: string[],
  onProgress: (data: StreamAnalysisResult) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): void => {
  getAnalysisHistoryItem(historyId)
    .then((history) => {
      let lastProcessedIndex:
        | { sopIndex: number; transcriptIndex: number }
        | undefined;

      if (history.last_processed_index) {
        try {
          lastProcessedIndex = JSON.parse(
            history.last_processed_index as string
          );
        } catch (error) {
          console.error("Error parsing last_processed_index:", error);
        }
      }

      if (lastProcessedIndex) {
        const nextIndex = { ...lastProcessedIndex };

        nextIndex.transcriptIndex += 1;

        if (nextIndex.transcriptIndex >= transcripts.length) {
          nextIndex.sopIndex += 1;
          nextIndex.transcriptIndex = 0;
        }

        if (nextIndex.sopIndex >= sops.length) {
          onComplete();
          return;
        }

        analyzeTranscriptsStream(
          { transcripts, sops },
          onProgress,
          onError,
          onComplete,
          nextIndex,
          historyId
        );
      } else {
        analyzeTranscriptsStream(
          { transcripts, sops },
          onProgress,
          onError,
          onComplete,
          undefined,
          historyId
        );
      }
    })
    .catch((error) => {
      onError(error);
    });
};
