import { getUserService } from "../../services/auth_services";
import {create} from "zustand";
const useLoginStore = create((set) => ({
    loading: false,
    error: "",
    userData: {},
    userLogin: (async () => {
        try {
            set({
                loading: true,
                userData: "",
                error: ""
            })
            const response = await getUserService();

            if (response) {
                set({
                    loading: false,
                    userData: response?.data,
                    error: ""
                })
            }

        } catch (error) {
            set({
                loading: false,
                userData: "",
                error: error?.message
            })

        }

    })
}));
export default useLoginStore;