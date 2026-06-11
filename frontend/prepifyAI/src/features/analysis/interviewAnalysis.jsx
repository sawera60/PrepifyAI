import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

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
            <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col items-center justify-center p-6">
                <div className="relative flex items-center justify-center mb-8">
                    {/* Pulsing glow background */}
                    <div className="absolute w-24 h-24 bg-[#6C63FF] rounded-full filter blur-xl opacity-30 animate-pulse" />
                    {/* Spinning loader */}
                    <div className="w-16 h-16 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin relative z-10" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-wide mb-3 animate-pulse">
                    Evaluating Performance
                </h2>
                <p className="text-gray-400 text-sm md:text-base text-center max-w-md transition-all duration-500">
                    {loadingPhrases[loadingStep]}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col items-center justify-center p-6">
                <div className="bg-[#161925] border border-red-500/30 p-8 rounded-2xl max-w-md text-center shadow-xl">
                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-6 text-sm">{error}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 text-white rounded-xl font-medium transition-all shadow-lg shadow-[#6C63FF]/20"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { score, feedback, strengths, weaknesses, dimensions, interviewId } = analysis;

    // Helper to color-code metrics
    const getScoreColor = (val) => {
        if (val >= 80) return "text-emerald-400";
        if (val >= 60) return "text-indigo-400";
        if (val >= 40) return "text-amber-400";
        return "text-rose-400";
    };

    const getProgressBgColor = (val) => {
        if (val >= 80) return "bg-emerald-500";
        if (val >= 60) return "bg-[#6C63FF]";
        if (val >= 40) return "bg-amber-500";
        return "bg-rose-500";
    };

    return (
        <div className="min-h-screen bg-[#0B0D14] font-dm text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-[#1E2335] pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#6C63FF]/20 text-[#8B5CF6] text-xs font-semibold rounded-full uppercase tracking-wider">
                                {interviewId?.difficulty || "Medium"}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {interviewId?.category || "General"}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            {interviewId?.title || "Mock Interview"} Analysis
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="self-start md:self-auto px-5 py-2.5 bg-[#161925] border border-[#2E354F] hover:bg-[#202538] text-gray-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

                    {/* Overall Performance Score */}
                    <div className="lg:col-span-4 bg-[#161925] border border-[#23293F] rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#6C63FF]/5 rounded-full filter blur-2xl" />

                        <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                            Overall Score
                        </span>

                        <div className="relative flex items-center justify-center mb-6">
                            {/* Radial Glow */}
                            <div className={`absolute w-32 h-32 rounded-full filter blur-xl opacity-20 ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-[#6C63FF]" : "bg-amber-500"
                                }`} />

                            {/* Circular progress SVG */}
                            <svg className="w-36 h-36 transform -rotate-90">
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    className="stroke-[#22283D]"
                                    strokeWidth="10"
                                    fill="transparent"
                                />
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    className={`transition-all duration-1000 ease-out`}
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 64}
                                    strokeDashoffset={2 * Math.PI * 64 * (1 - score / 100)}
                                    strokeLinecap="round"
                                    stroke={
                                        score >= 80 ? "#34D399" : score >= 60 ? "#6C63FF" : score >= 40 ? "#FBBF24" : "#F87171"
                                    }
                                />
                            </svg>
                            <span className={`absolute text-4xl font-black ${getScoreColor(score)}`}>
                                {score}%
                            </span>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed max-w-xs mt-2">
                            Excellent work! You exhibited strong communication capabilities with some areas to improve in depth.
                        </p>
                    </div>

                    {/* Overall Evaluation Feedback */}
                    <div className="lg:col-span-8 bg-[#161925] border border-[#23293F] rounded-2xl p-8 flex flex-col justify-between shadow-xl">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-[#8B5CF6] flex items-center gap-2">
                                💬 Evaluator's Summary
                            </h3>
                            <p className="text-gray-300 text-base md:text-lg leading-relaxed italic">
                                "{feedback}"
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#23293F]/50 flex flex-wrap gap-4 text-xs text-gray-400">
                            <div>
                                <span className="font-semibold text-gray-300">Session ID: </span>
                                <span className="font-mono text-gray-500">{sessionId}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-300">Target Role: </span>
                                <span className="text-[#6C63FF] font-semibold">{interviewId?.title || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown & Dimensions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

                    {/* Performance Dimensions */}
                    <div className="lg:col-span-6 bg-[#161925] border border-[#23293F] rounded-2xl p-8 shadow-xl">
                        <h3 className="text-lg font-bold mb-6 text-[#8B5CF6]">
                            📊 Skill breakdown
                        </h3>
                        <div className="space-y-6">
                            {Object.entries(dimensions || {}).map(([key, value]) => {
                                // Format camelCase keys
                                const displayName = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase());

                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-semibold">
                                            <span className="text-gray-300">{displayName}</span>
                                            <span className={getScoreColor(value)}>{value}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-[#22283D] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${getProgressBgColor(value)}`}
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Strengths and Weaknesses */}
                    <div className="lg:col-span-6 grid grid-rows-2 gap-6">

                        {/* Strengths */}
                        <div className="bg-[#161925] border border-[#23293F] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                            <h3 className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                🟢 Key Strengths
                            </h3>
                            <ul className="space-y-2.5">
                                {strengths && strengths.length > 0 ? (
                                    strengths.map((str, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5">
                                            <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                                            <span>{str}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-500">No specific strengths highlighted.</li>
                                )}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-[#161925] border border-[#23293F] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                            <h3 className="text-base font-bold text-rose-400 mb-4 flex items-center gap-2">
                                🟡 Areas for Improvement
                            </h3>
                            <ul className="space-y-2.5">
                                {weaknesses && weaknesses.length > 0 ? (
                                    weaknesses.map((weak, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2.5">
                                            <span className="text-rose-400 mt-0.5 font-bold">⚡</span>
                                            <span>{weak}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-gray-500">No specific weaknesses highlighted.</li>
                                )}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-3.5 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:brightness-110 active:scale-95 text-white font-bold rounded-2xl tracking-wide transition-all shadow-lg shadow-[#6C63FF]/20"
                    >
                        Return to Dashboard
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InterviewAnalysis;
