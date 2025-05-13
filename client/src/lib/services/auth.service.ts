import request from "./api.service";

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

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginApiResponse> => {
  return request<LoginApiResponse>(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (
  email: string,
  password: string
): Promise<RegisterApiResponse> => {
  return request<RegisterApiResponse>(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const fetchCurrentUser = async (
  token: string
): Promise<FetchMeResponse> => {
  return request<FetchMeResponse>(`/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
