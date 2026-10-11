export const API_BASE = (import.meta.env.VITE_API_URL as string) ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function uploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
