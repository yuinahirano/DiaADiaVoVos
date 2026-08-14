import axios from "axios";

export const api_diadiavovos = axios.create(
    {
        baseURL: 'http://localhost:8000',
        timeout: 5000,
    }
)