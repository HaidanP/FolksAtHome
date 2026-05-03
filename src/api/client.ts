export interface ApiUser {
  id: string;
  role: 'volunteer' | 'member';
  email: string;
  firstName: string;
  lastName: string;
  avatarFile: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface ApiError {
  error: string;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as ApiError).error ?? 'Request failed');
  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const json = await res.json();
  if (!res.ok) throw new Error((json as ApiError).error ?? 'Request failed');
  return json as T;
}

export async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'DELETE',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as ApiError).error ?? 'Request failed');
  return json as T;
}
