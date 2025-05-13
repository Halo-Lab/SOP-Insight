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
