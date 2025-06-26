const API_BASE = process.env.NEXT_PUBLIC_BACKEND_API;

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store', // to avoid stale data in dev
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'API request failed');
  }

  return res.json() as Promise<T>;
}
