import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useInterviewStore from "../../store/interviewStore";
import ResumeUploadModal from "../../../pages/resume/Resumeuploadmodal";

const MyInterview = () => {
    const navigate = useNavigate();
    const { myInterviews } = useInterviewStore();
    const [showResumeModal, setShowResumeModal] = useState(false);

    return (
        <section className="font-dm mt-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                    <span>📋</span> Your Interviews
                </h2>
                <button className="text-xs text-[#8B89A0] hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3.5 py-1.5 transition-all duration-150">
                    View All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {myInterviews && myInterviews.length > 0 ? (
                    <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between min-h-[160px]">
                        <h3 className="text-[#8B89A0] font-semibold text-xs uppercase tracking-wider mb-3">Custom Generated</h3>
                        <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
                            {myInterviews.map((interview) => (
                                <div 
                                    key={interview._id}
                                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all cursor-pointer"
                                    onClick={() => navigate(`/interview/${interview._id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/15 flex items-center justify-center text-[#9F9BFF] text-sm font-bold">
                                            💻
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-white font-medium text-sm truncate max-w-[170px]">{interview.title}</h4>
                                            <p className="text-xs text-[#8B89A0]">{interview.difficulty || "Medium"} • {interview.experience || "Mid"}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/interview/${interview._id}`);
                                        }}
                                        className="bg-[#6C63FF] hover:bg-[#5B53EE] text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-all flex items-center gap-1"
                                    >
                                        Start 🚀
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State Card */
                    <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-base mb-1">No interviews yet</h3>
                            <p className="text-[#8B89A0] text-sm leading-relaxed mb-4">
                                Start your first interview or try some mock interviews below.
                            </p>
                            <button
                                onClick={() => navigate("/interview/custom/setup")}
                                className="bg-[#6C63FF] hover:bg-[#5B53EE] text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-150 shadow-lg shadow-[#6C63FF]/20"
                            >
                                Start Your Interview
                            </button>
                        </div>
                    </div>
                )}

                {/* Resume Overview Card */}
                <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-syne text-base font-bold text-white flex items-center gap-2">
                            <span>📄</span> Resume Overview
                        </h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>

                    <div className="flex flex-col items-center text-center py-2">
                        {/* File Icon */}
                        <div className="w-12 h-12 rounded-2xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center mb-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>

                        <h4 className="text-white font-semibold text-sm mb-1.5">No resume uploaded</h4>
                        <p className="text-[#8B89A0] text-xs leading-relaxed mb-3 max-w-[200px]">
                            Upload your resume to get AI-powered insights and personalized interviews.
                        </p>

                        <button 
                            onClick={() => setShowResumeModal(true)}
                            className="inline-flex items-center gap-2 border border-white/[0.08] hover:border-[#6C63FF]/40 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-150 hover:bg-[#6C63FF]/5"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Resume
                        </button>
                    </div>
                </div>
            </div>
            {showResumeModal && <ResumeUploadModal onClose={() => setShowResumeModal(false)} />}
        </section>
    );
};

export default MyInterview;