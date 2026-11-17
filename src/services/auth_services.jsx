import apiService from "../methods/methods"

export const loginUserService = (data) => {
    return apiService?.post("/auth/login", data);
}

export const signupUserService = (data) => {
    return apiService?.post("/auth/signup", data);
}

export const getUserService = () => {
    return apiService?.get("/auth/me");
}