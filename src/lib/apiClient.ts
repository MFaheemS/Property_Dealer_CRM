/**
 * Typed fetch wrapper for PropVault API calls.
 * Automatically parses JSON and surfaces API errors.
 */

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? data.message ?? "Request failed");
  }

  return data;
}

export const api = {
  get:    <T>(url: string)                          => apiRequest<T>(url, { method: "GET" }),
  post:   <T>(url: string, body: unknown)           => apiRequest<T>(url, { method: "POST", body }),
  put:    <T>(url: string, body: unknown)           => apiRequest<T>(url, { method: "PUT", body }),
  delete: <T>(url: string)                          => apiRequest<T>(url, { method: "DELETE" }),
  patch:  <T>(url: string, body: unknown)           => apiRequest<T>(url, { method: "PATCH", body }),
};
