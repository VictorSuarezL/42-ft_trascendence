import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

export async function getRequest<T>(path: string) {
  const response = await api.get<T>(path);
  return response.data;
}

export async function postRequest<T, D = unknown>(path: string, data: D) {
  const response = await api.post<T>(path, data);
  return response.data;
}

export default api;
