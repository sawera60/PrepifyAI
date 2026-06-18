import useInterviewStore from "../../store/interviewStore";
import InterviewCard from "./InterviewCard";

const MockInterviewList = () => {
    const { mockInterviews } = useInterviewStore();

    return (
        <section className="font-dm mt-6 mb-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                    Mock Interviews
                </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {mockInterviews?.map((interview) => (
                    <InterviewCard
                        key={interview._id}
                        interview={interview}
                    />
                ))}
            </div>

            {/* Empty state if no interviews */}
            {(!mockInterviews || mockInterviews.length === 0) && (
                <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-10 text-center">
                    <p className="text-[#5A5870] text-base">No mock interviews available yet.</p>
                </div>
            )}
        </section>
    );
};

export default MockInterviewList;