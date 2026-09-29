import axios from 'axios';
export const session = {
  get token() { return sessionStorage.getItem('access_token'); },
  clear() { sessionStorage.removeItem('access_token'); sessionStorage.removeItem('username'); },
};
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', timeout: 10000 });
api.interceptors.request.use(config => {
  if (session.token) config.headers.Authorization = `Bearer ${session.token}`;
  console.info(`[JWT] ${config.method.toUpperCase()} ${config.url}`, { authorization: session.token ? 'Bearer [presente; ver token en Network]' : 'ausente' });
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    session.clear();
    window.dispatchEvent(new Event('session-expired'));
  }
  return Promise.reject(error);
});
export async function login(username, password) {
  const body = new URLSearchParams({ grant_type: 'password', client_id: import.meta.env.VITE_CLIENT_ID || 'fastapi-api', username, password, scope: 'openid' });
  const { data } = await axios.post(import.meta.env.VITE_TOKEN_URL || 'http://localhost:8081/realms/cybersecurity/protocol/openid-connect/token', body, { timeout: 15000 });
  if (!data.access_token) throw new Error('El servidor no devolvió un JWT.');
  sessionStorage.setItem('access_token', data.access_token);
  sessionStorage.setItem('username', username);
}
