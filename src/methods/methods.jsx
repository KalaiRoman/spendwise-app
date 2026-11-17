import axiosBaseUrl from "../../interceptor";

const apiService = {
    // GET
    get: (url, config = {}) => {
        return axiosBaseUrl.get(url, config);
    },

    // POST
    post: (url, data, config = {}) => {
        return axiosBaseUrl.post(url, data, config);
    },

    // PUT
    put: (url, data, config = {}) => {
        return axiosBaseUrl.put(url, data, config);
    },

    // PATCH
    patch: (url, data, config = {}) => {
        return axiosBaseUrl.patch(url, data, config);
    },

    // DELETE
    delete: (url, config = {}) => {
        return axiosBaseUrl.delete(url, config);
    },
};

export default apiService;