import { useEffect } from "react";
import useInterviewStore from "../store/interviewStore";
import DashboardHeader from "./components/DashboardHeader";
import Herosection from "./components/Herosection";
import MockInterviewList from "./components/MockInterviewList";
import MyInterview from "./components/MyInterview";

const Dashboard = () => {
    const { loading, getMockInterviews } = useInterviewStore();
    
    useEffect(() => {
        getMockInterviews();
    }, [getMockInterviews]);

    return (
        <div className="min-h-screen bg-gray-50">
           <DashboardHeader />
           <main className="max-w-7xl mx-auto px-6">
               <Herosection />
               <MyInterview/>
               <section className="py-8">
                   <h2 className="text-2xl font-bold mb-6">Available Mock Interviews</h2>
                   {loading ? (
                       <p>Loading interviews...</p>
                   ) : (
                       <MockInterviewList />
                   )}
               </section>
           </main>
        </div>
    );
};

export default Dashboard;