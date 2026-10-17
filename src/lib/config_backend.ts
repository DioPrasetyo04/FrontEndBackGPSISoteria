import axios from "axios"
import { getSession, logoutAndRedirect } from "./utils";

const urlBackend = import.meta.env.VITE_BACKEND_URL ?? "";

export const routeGlobalInstance =  axios.create({
    baseURL: urlBackend,
    headers: {
        Accept: "application/json",
    }
});

export const routePrivateInstance = axios.create({
    baseURL: urlBackend
})

routePrivateInstance.interceptors.request.use((config) => {
    const session = getSession();

    if(session?.token){
        const token = session.token.startsWith("Bearer ") ? session.token : `Bearer ${session.token}`;
        config.headers.Authorization = token;
    }
    return config;
})

routePrivateInstance.interceptors.response.use(
    (response) => response, 
    (error) => {
        const status = error?.response?.status;

        if(status === 401){
            logoutAndRedirect();
        }

        return Promise.reject(error);
    }
)
