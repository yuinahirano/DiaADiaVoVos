import axios from 'axios';

// Instância base exportada como nomeada e default
export const api_diadiavovos = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api_diadiavovos.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api_diadiavovos;