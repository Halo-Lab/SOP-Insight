const API_URL = import.meta.env.VITE_API_URL;

export interface ApiError {
  message: string;
  status?: number;
  originalError?: unknown;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (
      response.status === 204 ||
      (response.ok && response.headers.get("content-length") === "0")
    ) {
      return null as T;
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      if (!response.ok) {
        throw {
          message: `API request failed with status ${response.status} (Body not parsable)`,
          status: response.status,
          originalError: jsonError,
        } as ApiError;
      }
      console.error(
        "API call was OK but failed to parse JSON response:",
        jsonError
      );
      throw {
        message: "Failed to parse server response despite OK status",
        status: response.status,
        originalError: jsonError,
      } as ApiError;
    }

    if (!response.ok) {
      throw {
        message: data?.error || `API request to ${path} failed`,
        status: response.status,
        originalError: data,
      } as ApiError;
    }
    return data as T;
  } catch (error) {
    console.error(`API request to ${path} failed:`, error);
    if (typeof error === "object" && error !== null && "message" in error) {
      throw error;
    }
    throw {
      message: `Network or unexpected error for ${path}`,
      originalError: error,
    } as ApiError;
  }
}

export default request;
