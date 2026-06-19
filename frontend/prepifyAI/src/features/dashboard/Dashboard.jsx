import { useEffect, useState } from "react";
import useInterviewStore from "../store/interviewStore";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import Herosection from "./components/Herosection";
import MockInterviewList from "./components/MockInterviewList";
import MyInterview from "./components/MyInterview";

const Dashboard = () => {
    const { loading, getMockInterviews, getMyInterviews } = useInterviewStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        getMockInterviews();
        getMyInterviews();
    }, [getMockInterviews, getMyInterviews]);

    return (
        <div className="font-dm min-h-screen bg-[#0B0D14] flex">
            {/* Sidebar — passes mobile state */}
            <Sidebar
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content — offset only on lg+ */}
            <div className="flex-1 min-w-0 min-h-screen lg:ml-[264px]">
                <DashboardHeader onMenuToggle={() => setMobileMenuOpen(true)} />

                <main className="max-w-[1550px] mx-auto px-4 sm:px-6">
                    <Herosection />
                    <MyInterview />

                    <div id="mock-interviews">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <MockInterviewList />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;