import axios from "axios";

export const api_diadiavovos = axios.create(
    {
        baseURL: import.meta.env.VITE_API_URL,
        timeout: 5000,
    }
)