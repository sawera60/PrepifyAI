import useInterviewStore from "../../store/interviewStore";
import InterviewCard from "./InterviewCard";

const MockInterviewList = () => {
    const { mockInterviews } = useInterviewStore();

    return (
        <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockInterviews?.map((interview) => (
                    <InterviewCard
                        key={interview._id}
                        interview={interview}
                    />
                ))}
            </div>
        </>
    )
}
export default MockInterviewList;