const API_URL = import.meta.env.VITE_API_URL;

export interface ApiError {
  message: string;
  status?: number;
  originalError?: unknown;
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export default async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, ...customConfig } = options;
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Error response:", errorData);
    throw {
      message: errorData?.message || `HTTP error! status: ${response.status}`,
      status: response.status,
      originalError: errorData,
    } as ApiError;
  }

  const responseData = await response.json();
  return responseData;
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
  const token = localStorage.getItem("token");
  const { data, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
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

        const dataLines = chunk
          .split("\n")
          .filter((line) => line.trim().startsWith("data:"))
          .map((line) => line.trim().substring(5).trim());

        for (const dataLine of dataLines) {
          try {
            const data = JSON.parse(dataLine) as T;
            onData(data);
          } catch {
            // Skip parsing errors
          }
        }

        if (dataLines.length === 0) {
          const startPos = buffer.indexOf("{");
          const endPos = buffer.lastIndexOf("}");

          if (startPos !== -1 && endPos !== -1 && endPos > startPos) {
            const jsonCandidate = buffer.substring(startPos, endPos + 1);

            try {
              const data = JSON.parse(jsonCandidate) as T;
              onData(data);
              buffer = buffer.substring(endPos + 1);
            } catch {
              // Skip JSON parsing errors
            }
          }
        } else {
          buffer = "";
        }
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
