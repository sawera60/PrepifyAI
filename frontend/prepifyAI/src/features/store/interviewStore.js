import { create } from "zustand";
import api from "../../services/api";

const useInterviewStore = create((set) => ({ //set is used when we want to update store

    mockInterviews: [], //empty array initially
    loading: false,

    // Function stored inside Zustand but used globally
    getMockInterviews: async () => {
        try {
            set({ loading: true }); // same as setLoading(true)

            const res = await api.get("/interviews/mock"); // backend runs Interview.find({ isPublic: true })

            // Update store with API response
            set({
                mockInterviews: res.data.interviews,
                loading: false,
            });
        } catch (error) {
            console.log(error);

            set({
                loading: false,
            });
        }
    },
}));

export default useInterviewStore;