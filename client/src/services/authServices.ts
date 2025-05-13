const API_URL = import.meta.env.VITE_API_URL;

export interface ApiUser {
  id: string;
  email: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user: ApiUser;
}

export interface LoginApiResponse {
  user: ApiUser;
  session: SupabaseSession;
}

export interface RegisterApiResponse {
  user: ApiUser;
  session?: SupabaseSession | null;
}

export interface FetchMeResponse {
  user: ApiUser;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      "An API error occurred";
    console.error("API Error:", errorMessage, "Full response data:", data);
    throw new Error(errorMessage);
  }
  return data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginApiResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<LoginApiResponse>(response);
};

export const registerUser = async (
  email: string,
  password: string
): Promise<RegisterApiResponse> => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<RegisterApiResponse>(response);
};

export const fetchMe = async (token: string): Promise<FetchMeResponse> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    localStorage.removeItem("token");
    const errorData = await response
      .json()
      .catch(() => ({ error: "Invalid token or failed to parse error" }));
    throw new Error(errorData.error || "Invalid token");
  }
  return response.json();
};
