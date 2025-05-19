const API_URL = import.meta.env.VITE_API_URL;

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  originalError?: unknown;
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

// Track if we're currently refreshing a token to avoid infinite loops
let isRefreshing = false;

// Function to refresh token
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // If refresh token request failed, return false
    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export default async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: "include", // This ensures cookies are sent with requests
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // If unauthorized and not already trying to refresh token
    if (
      response.status === 401 &&
      !endpoint.includes("/auth/refresh-token") &&
      !isRefreshing
    ) {
      isRefreshing = true;
      try {
        const refreshed = await refreshToken();
        isRefreshing = false;

        if (refreshed) {
          // Retry the original request
          return request<T>(endpoint, options);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        isRefreshing = false;
        // If refresh failed, continue to throw error
      }

      // If refresh failed or errored, throw error
      throw {
        message: "Session expired. Please log in again.",
        status: 401,
      } as ApiError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw {
        message: errorData?.error || `HTTP error! status: ${response.status}`,
        status: response.status,
        code: errorData?.code,
        originalError: errorData,
      } as ApiError;
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    if ((error as ApiError).status === 401) {
      // Don't redirect automatically - let the AuthContext handle this
    }
    throw error;
  }
}

export function requestStream<T>(
  endpoint: string,
  options: RequestOptions = {},
  onData: (data: T) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const { data, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: "include", // This ensures cookies are sent with requests
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal,
  };

  (async () => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        let processedBuffer = buffer;
        let eventStart = processedBuffer.indexOf("data:");

        while (eventStart !== -1) {
          const eventEnd = processedBuffer.indexOf("\n\n", eventStart);

          if (eventEnd === -1) {
            break;
          }

          const dataLine = processedBuffer
            .substring(eventStart + 5, eventEnd)
            .trim();

          try {
            const data = JSON.parse(dataLine) as T;
            onData(data);
          } catch (parseError) {
            console.warn("Failed to parse SSE data:", parseError);
          }

          processedBuffer = processedBuffer.substring(eventEnd + 2);
          eventStart = processedBuffer.indexOf("data:");
        }

        buffer = processedBuffer;
      }

      onComplete();
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        onError(error);
      } else if (!(error instanceof Error)) {
        const genericError = new Error(String(error));
        onError(genericError);
      }
    }
  })();

  return () => controller.abort();
}
