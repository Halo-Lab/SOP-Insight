// Defining User interface based on AuthContext
interface User {
  id: string;
  email: string;
  // Add other user properties if available from your API
}

const API_URL = import.meta.env.VITE_API_URL;

interface AuthResponse {
  user: User;
  session?: {
    access_token: string;
  };
  error?: string;
  message?: string; // For registration success message when email confirmation is needed
}

interface FetchUserResponse {
  user: User;
  error?: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Check if response is not OK and has no content
  if (!response.ok && response.status === 204) {
    throw new Error("API request failed with no content");
  }
  if (
    !response.ok &&
    (!response.headers.get("content-length") ||
      response.headers.get("content-length") === "0")
  ) {
    throw new Error(
      `API request failed with status ${response.status} and no content`
    );
  }

  // Try to parse JSON, handle cases where body might be empty or not JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If parsing fails and response was OK, this might be an issue (e.g. unexpected empty response)
    // If response was not OK, we prioritize the network error status
    if (response.ok) {
      console.error(
        "Failed to parse JSON response even though status was OK:",
        e
      );
      // Potentially throw or return a specific error structure
    }
    // If not OK, the error will be thrown below based on status
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `API request failed with status ${response.status}`
    );
  }
  return data as T; // Added 'as T' for type assertion
}

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return request<AuthResponse>(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  return request<AuthResponse>(`${API_URL}/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const fetchCurrentUser = async (
  token: string
): Promise<FetchUserResponse> => {
  return request<FetchUserResponse>(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
