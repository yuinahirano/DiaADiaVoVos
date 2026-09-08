import axios from "axios";

const TOKEN_KEY = "@DiaADiaVoVos:token";

export const api_auth = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

export const api_diadiavovos = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 5000,
});

function attachToken(config) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}

api_auth.interceptors.request.use(attachToken, (error) => Promise.reject(error));
api_diadiavovos.interceptors.request.use(attachToken, (error) => Promise.reject(error));