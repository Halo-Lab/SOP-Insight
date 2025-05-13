import request from "./api.service";

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

export interface AnalyzePayload {
  transcripts: string[];
  sops: string[]; // Assuming sops are passed as content strings for analysis
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
