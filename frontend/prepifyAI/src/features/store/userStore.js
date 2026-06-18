import { create } from "zustand";
import api from "../../services/api";

const useUserStore = create((set) => ({
    user: null,
    loading: false,

    fetchUser: async () => {
        try {
            set({ loading: true });
            const res = await api.get("/users/profile");
            set({ user: res.data.user, loading: false });
        } catch (error) {
            console.error("Error fetching user profile:", error);
            set({ user: null, loading: false });
        }
    }
}));

export default useUserStore;
