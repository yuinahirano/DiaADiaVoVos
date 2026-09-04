import axios from "axios";

export const api_auth = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 5000,
})


api_auth.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("@DiaADiaVoVos:token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error)
    }
)
