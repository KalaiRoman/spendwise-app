import axios from "axios";
import { getToken, removeToken } from "./src/utils/Token";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosBaseUrl = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosBaseUrl.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }


        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosBaseUrl.interceptors.response.use(
    (response) => {
        console.log("Success:", response.status);

        return response;
    },

    (error) => {
        if (!error.response) {
            console.error("Network Error:", error.message);
            return Promise.reject(error);
        }

        const status = error.response.status;
        const message = error.response.data?.message;

        switch (status) {
            case 400:
                console.error("Bad Request:", message || "Invalid request");
                break;

            case 401:
                console.error("Unauthorized:", message || "Please login");
                removeToken();
                window.location.href = "/";
                break;

            case 403:
                console.error("Forbidden:", message || "Access denied");
                break;

            case 404:
                console.error("Not Found:", message || "API not found");
                break;

            case 409:
                console.error("Conflict:", message || "Already exists");
                break;

            case 422:
                console.error("Validation Error:", message || "Invalid data");
                break;

            case 429:
                console.error("Too Many Requests:", message || "Try again later");
                break;

            case 500:
                console.error("Internal Server Error");
                break;

            case 502:
                console.error("Bad Gateway");
                break;

            case 503:
                console.error("Service Unavailable");
                break;

            default:
                console.error("Something went wrong:", status, message);
        }

        return Promise.reject(error);
    }
);

export default axiosBaseUrl;