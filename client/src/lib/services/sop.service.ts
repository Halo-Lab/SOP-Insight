import request, { requestStream } from "./api.service";

// Define interfaces for SOP data
export interface Sop {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  // Add any other relevant fields
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
}

export interface AnalyzePayload {
  transcripts: string[];
  sops: string[]; // Assuming sops are passed as content strings for analysis
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
  onComplete: () => void
): (() => void) => {
  return requestStream<StreamAnalysisResult>(
    "/analyze/stream",
    {
      method: "POST",
      data: payload,
    },
    (data) => {
      if (data.error) {
        onError(new Error(data.error));
        if (data.partialResults) {
          onProgress({ results: data.partialResults });
        }
      } else if (data.results) {
        onProgress(data);
        if (data.completed) {
          onComplete();
        }
      }
    },
    onError,
    onComplete
  );
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
