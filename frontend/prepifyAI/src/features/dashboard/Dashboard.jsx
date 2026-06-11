import { useEffect } from "react";
import useInterviewStore from "../store/interviewStore";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import Herosection from "./components/Herosection";
import MockInterviewList from "./components/MockInterviewList";
import MyInterview from "./components/MyInterview";

const Dashboard = () => {
    const { loading, getMockInterviews, getMyInterviews } = useInterviewStore();

    useEffect(() => {
        getMockInterviews();
        getMyInterviews();
    }, [getMockInterviews, getMyInterviews]);

    return (
        <div className="font-dm min-h-screen bg-[#0B0D14] flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-[240px] min-h-screen">
                <DashboardHeader />

                <main className="max-w-[1550px] mx-auto px-6">
                    <Herosection />
                    <MyInterview />

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <MockInterviewList />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;