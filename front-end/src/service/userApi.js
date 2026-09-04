import { api_auth } from "./api";

export async function loginRequest(email, senha) {
  const response = await api_auth.post("/usuario/login", { email, senha });
  return response.data;
}

export async function getMeRequest() {
  const response = await api_auth.get("/usuario/me");
  return response.data;
}
