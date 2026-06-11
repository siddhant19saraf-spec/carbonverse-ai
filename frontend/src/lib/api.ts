const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_API_URL is not set");
}

interface RequestOptions extends RequestInit {
  token?: string;
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, timeout = 30000, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new ApiError(res.status, error.detail || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ApiError(408, "Request timed out");
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Network error");
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "GET", token }),
  post: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body), token }),
  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body), token }),
  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),
};
