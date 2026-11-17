import Cookies from "js-cookie";

export const setCookie = (params) => {
    return Cookies.set("token", params, {
        secure: true,
    })
};


export const getToken = () => {
    const token = Cookies.get("token");
    if (!token) {
        console.log("Token is Not there...")
    }

    return token;
}


export const removeToken = () => {
    return Cookies.clear("");
}