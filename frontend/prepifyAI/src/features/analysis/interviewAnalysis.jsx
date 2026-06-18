import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiMessageSquare, FiBarChart2, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiAward } from "react-icons/fi";

const InterviewAnalysis = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingPhrases = [
        "Analyzing your interview transcript...",
        "Evaluating communication & structural clarity...",
        "Measuring technical knowledge & depth...",
        "Assessing problem-solving capability...",
        "Generating strengths and constructive feedback...",
        "Finalizing your performance report..."
    ];

    // Cycle through loading phrases
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev + 1) % loadingPhrases.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    // Poll endpoint until analysis is generated
    useEffect(() => {
        let isMounted = true;
        let pollCount = 0;
        const maxPolls = 20; // up to 60 seconds

        const fetchAnalysis = async () => {
            try {
                const res = await api.get(`/sessions/${sessionId}/analysis`);
                if (isMounted) {
                    setAnalysis(res.data);
                    setLoading(false);
                }
            } catch (err) {
                // If 404, the analysis is still generating. We keep polling.
                if (err.response?.status === 404 && pollCount < maxPolls) {
                    pollCount++;
                    setTimeout(fetchAnalysis, 3000);
                } else {
                    if (isMounted) {
                        setError(err.response?.data?.message || "Failed to load analysis report.");
                        setLoading(false);
                    }
                }
            }
        };

        fetchAnalysis();

        return () => {
            isMounted = false;
        };
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#6C63FF] opacity-[0.15] blur-[120px]" />
                
                <div className="relative flex items-center justify-center mb-10">
                    <div className="w-20 h-20 border-4 border-white/10 border-t-[#6C63FF] rounded-full animate-spin shadow-[0_0_30px_rgba(108,99,255,0.4)]" />
                    <div className="absolute w-12 h-12 bg-[#6C63FF]/20 rounded-full animate-ping" />
                </div>
                <h2 className="font-syne text-2xl md:text-3xl font-bold tracking-tight mb-4 text-white">
                    Evaluating Performance
                </h2>
                <div className="bg-[#13151F]/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <p className="text-[#8B89A0] text-sm md:text-base text-center transition-all duration-500 min-w-[280px]">
                        {loadingPhrases[loadingStep]}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-red-500 opacity-[0.1] blur-[120px]" />
                
                <div className="bg-[#13151F]/80 backdrop-blur-xl border border-red-500/20 p-10 rounded-3xl max-w-md text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] relative z-10">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiAlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="font-syne text-2xl font-bold mb-3 text-white">Something went wrong</h2>
                    <p className="text-[#8B89A0] mb-8 text-sm leading-relaxed">{error}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full px-6 py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#6C63FF]/25 flex items-center justify-center gap-2"
                    >
                        <FiArrowLeft /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { score, feedback, strengths, weaknesses, dimensions, interviewId } = analysis;

    // Helper to color-code metrics
    const getScoreColor = (val) => {
        if (val >= 80) return "text-[#4ECDC4]";
        if (val >= 60) return "text-[#6C63FF]";
        if (val >= 40) return "text-amber-400";
        return "text-rose-400";
    };

    const getProgressBgColor = (val) => {
        if (val >= 80) return "bg-[#4ECDC4] shadow-[0_0_15px_rgba(78,205,196,0.5)]";
        if (val >= 60) return "bg-[#6C63FF] shadow-[0_0_15px_rgba(108,99,255,0.5)]";
        if (val >= 40) return "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]";
        return "bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]";
    };

    const getScoreGradient = (val) => {
        if (val >= 80) return "from-[#4ECDC4] to-[#2E8B85]";
        if (val >= 60) return "from-[#6C63FF] to-[#4B44DD]";
        if (val >= 40) return "from-amber-400 to-amber-600";
        return "from-rose-400 to-rose-600";
    };

    return (
        <div className="min-h-screen bg-[#0B0D14] font-dm text-white p-3 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#6C63FF] opacity-[0.07] blur-[150px]" />
            <div className="pointer-events-none absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-[120px]" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-[#9F9BFF] text-[10px] font-bold rounded-full uppercase tracking-widest">
                                {interviewId?.difficulty || "Medium"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-[#8B89A0] text-[10px] font-bold rounded-full uppercase tracking-widest">
                                {interviewId?.category || "General"}
                            </span>
                        </div>
                        <h1 className="font-syne text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                            Performance Report
                        </h1>
                        <p className="text-[#8B89A0] text-sm md:text-base max-w-xl">
                            Detailed analysis of your interview for the <strong className="text-white font-semibold">{interviewId?.title || "Mock Interview"}</strong> role.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="self-start md:self-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#13151F]/80 backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-lg"
                    >
                        <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">

                    {/* Overall Performance Score */}
                    <div className="lg:col-span-4 bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                        {/* Decorative background element */}
                        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full filter blur-[80px] opacity-20 bg-gradient-to-br ${getScoreGradient(score)}`} />

                        <div className="inline-flex items-center gap-2 mb-5 sm:mb-8 bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 rounded-full">
                            <FiAward className="w-4 h-4 text-[#6C63FF]" />
                            <span className="text-[#8B89A0] text-[11px] font-bold uppercase tracking-widest">
                                Overall Score
                            </span>
                        </div>

                        <div className="relative flex items-center justify-center mb-5 sm:mb-8">
                            {/* SVG Radial Chart */}
                            <svg className="w-36 h-36 sm:w-48 sm:h-48 transform -rotate-90 filter drop-shadow-xl">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="42%"
                                    className="stroke-white/5"
                                    strokeWidth="12"
                                    fill="transparent"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="42%"
                                    className="transition-all duration-1500 ease-out"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 84}
                                    strokeDashoffset={2 * Math.PI * 84 * (1 - score / 100)}
                                    strokeLinecap="round"
                                    stroke={
                                        score >= 80 ? "#4ECDC4" : score >= 60 ? "#6C63FF" : score >= 40 ? "#FBBF24" : "#F43F5E"
                                    }
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className={`font-syne text-4xl sm:text-5xl font-bold tracking-tighter ${getScoreColor(score)}`}>
                                    {score}
                                </span>
                                <span className="text-[#8B89A0] text-sm font-medium mt-1">/ 100</span>
                            </div>
                        </div>

                        <p className="text-[#8B89A0] text-sm leading-relaxed max-w-[260px] relative z-10">
                            {score >= 80 ? "Outstanding performance! You are well-prepared for this role." : 
                             score >= 60 ? "Good effort! A few areas of improvement will make you a top candidate." : 
                             "Keep practicing! Focus on the key improvement areas highlighted below."}
                        </p>
                    </div>

                    {/* Overall Evaluation Feedback */}
                    <div className="lg:col-span-8 bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#6C63FF]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center text-[#9F9BFF]">
                                    <FiMessageSquare className="w-5 h-5" />
                                </div>
                                <h3 className="font-syne text-xl font-bold text-white">
                                    Evaluator's Summary
                                </h3>
                            </div>
                            
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed italic relative">
                                    <span className="absolute -top-4 -left-2 text-4xl text-[#6C63FF]/20 font-serif">"</span>
                                    {feedback}
                                    <span className="absolute -bottom-6 -right-2 text-4xl text-[#6C63FF]/20 font-serif">"</span>
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 sm:pt-6 border-t border-white/5 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#8B89A0] relative z-10">
                            <div className="flex items-center gap-2 bg-[#1A1D2A] px-2.5 sm:px-3 py-1.5 rounded-lg border border-white/5 max-w-full overflow-hidden">
                                <span className="font-semibold text-white">Session ID:</span>
                                <span className="font-mono text-[#6C63FF] truncate max-w-[120px] sm:max-w-none">{sessionId}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#1A1D2A] px-3 py-1.5 rounded-lg border border-white/5">
                                <span className="font-semibold text-white">Role:</span>
                                <span className="text-[#4ECDC4] font-semibold">{interviewId?.title || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown & Dimensions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">

                    {/* Performance Dimensions */}
                    <div className="lg:col-span-5 bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-5 sm:mb-8">
                            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/20 border border-[#4ECDC4]/30 flex items-center justify-center text-[#4ECDC4]">
                                <FiBarChart2 className="w-5 h-5" />
                            </div>
                            <h3 className="font-syne text-xl font-bold text-white">
                                Skill Breakdown
                            </h3>
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                            {Object.entries(dimensions || {}).map(([key, value]) => {
                                const displayName = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase());

                                return (
                                    <div key={key} className="space-y-2.5">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[#8B89A0] font-medium">{displayName}</span>
                                            <span className={`font-bold ${getScoreColor(value)}`}>{value}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1500 ease-out ${getProgressBgColor(value)}`}
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Strengths and Weaknesses */}
                    <div className="lg:col-span-7 grid grid-rows-2 gap-4 sm:gap-6 lg:gap-8">

                        {/* Strengths */}
                        <div className="bg-[#13151F]/80 backdrop-blur-xl border border-[#4ECDC4]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(78,205,196,0.05)] relative overflow-hidden group hover:border-[#4ECDC4]/40 transition-colors">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#4ECDC4]/10 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:from-[#4ECDC4]/20" />
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center text-[#4ECDC4]">
                                    <FiCheckCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-syne text-xl font-bold text-white">
                                    Key Strengths
                                </h3>
                            </div>
                            
                            <ul className="space-y-3 relative z-10">
                                {strengths && strengths.length > 0 ? (
                                    strengths.map((str, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-300">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4ECDC4] shrink-0 shadow-[0_0_8px_rgba(78,205,196,0.8)]" />
                                            <span className="leading-relaxed">{str}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-[#8B89A0] italic bg-white/5 p-4 rounded-xl">No specific strengths highlighted in this session.</li>
                                )}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-[#13151F]/80 backdrop-blur-xl border border-rose-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.05)] relative overflow-hidden group hover:border-rose-500/40 transition-colors">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full pointer-events-none transition-all group-hover:from-rose-500/20" />
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                                    <FiAlertTriangle className="w-5 h-5" />
                                </div>
                                <h3 className="font-syne text-xl font-bold text-white">
                                    Areas for Improvement
                                </h3>
                            </div>
                            
                            <ul className="space-y-3 relative z-10">
                                {weaknesses && weaknesses.length > 0 ? (
                                    weaknesses.map((weak, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-300">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                                            <span className="leading-relaxed">{weak}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-[#8B89A0] italic bg-white/5 p-4 rounded-xl">No specific weaknesses highlighted in this session.</li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-center mt-8 sm:mt-12 mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-4 bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-semibold rounded-2xl tracking-wide transition-all shadow-[0_0_30px_rgba(108,99,255,0.4)] hover:shadow-[0_0_40px_rgba(108,99,255,0.6)] flex items-center gap-2"
                    >
                        Return to Dashboard <FiArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InterviewAnalysis;
