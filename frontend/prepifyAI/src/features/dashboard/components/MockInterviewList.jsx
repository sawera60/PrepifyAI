import useInterviewStore from "../../store/interviewStore";
import InterviewCard from "./InterviewCard";

const MockInterviewList = () => {
    const { mockInterviews } = useInterviewStore();

    return (
        <section className="font-dm mt-6 mb-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                    <span>🎯</span> Mock Interviews
                </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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