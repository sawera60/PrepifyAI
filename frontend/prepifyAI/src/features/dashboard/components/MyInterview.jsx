import { useNavigate } from "react-router-dom";

const MyInterview = () => {
    const navigate = useNavigate();

    return (
        <section className="font-dm mt-10">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                    <span>📋</span> Your Interviews
                </h2>
                <button className="text-xs text-[#8B89A0] hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3.5 py-1.5 transition-all duration-150">
                    View All
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Empty State Card */}
                <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-7 flex items-center gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                            onClick={() => navigate("/interview")}
                            className="bg-[#6C63FF] hover:bg-[#5B53EE] text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-all duration-150 shadow-lg shadow-[#6C63FF]/20"
                        >
                            Start Your Interview
                        </button>
                    </div>
                </div>

                {/* Resume Overview Card */}
                <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-7">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-syne text-base font-bold text-white flex items-center gap-2">
                            <span>📄</span> Resume Overview
                        </h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>

                    <div className="flex flex-col items-center text-center py-3">
                        {/* File Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        </div>

                        <h4 className="text-white font-semibold text-sm mb-1.5">No resume uploaded</h4>
                        <p className="text-[#8B89A0] text-xs leading-relaxed mb-4 max-w-[220px]">
                            Upload your resume to get AI-powered insights and personalized interviews.
                        </p>

                        <button className="inline-flex items-center gap-2 border border-white/[0.08] hover:border-[#6C63FF]/40 text-white text-xs font-medium rounded-lg px-4 py-2.5 transition-all duration-150 hover:bg-[#6C63FF]/5">
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
        </section>
    );
};

export default MyInterview;