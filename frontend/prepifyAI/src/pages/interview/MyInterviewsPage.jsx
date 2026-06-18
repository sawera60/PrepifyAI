import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-[#6C63FF]";
    if (score >= 40) return "text-amber-400";
    return "text-rose-400";
};

const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "bg-[#6C63FF]/10 border-[#6C63FF]/20";
    if (score >= 40) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
};

const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Work";
};

const getSourceIcon = (generatedFrom) => {
    if (generatedFrom === "resume") {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        );
    }
    if (generatedFrom === "custom") {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
};

const MyInterviewsPage = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all | mock | custom | resume

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get("/sessions/my-sessions");
                setAnalyses(res.data.analyses);
            } catch (err) {
                setError("Failed to load your interviews.");
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const filtered = analyses.filter((a) => {
        if (filter === "all") return true;
        return a.interviewId?.generatedFrom === filter;
    });

    // Stats
    const totalInterviews = analyses.length;
    const avgScore = totalInterviews > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / totalInterviews)
        : 0;
    const bestScore = totalInterviews > 0
        ? Math.max(...analyses.map((a) => a.score))
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#8B89A0] text-sm">Loading your interviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0D14] font-dm text-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-syne text-2xl md:text-3xl font-bold text-white mb-1">
                        My Interviews
                    </h1>
                    <p className="text-[#8B89A0] text-sm">
                        Your complete interview history and performance reports
                    </p>
                </div>

                {/* Stats Row */}
                {totalInterviews > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold font-syne text-white">{totalInterviews}</p>
                            <p className="text-xs text-[#8B89A0] mt-1">Total Interviews</p>
                        </div>
                        <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-4 text-center">
                            <p className={`text-2xl font-bold font-syne ${getScoreColor(avgScore)}`}>{avgScore}%</p>
                            <p className="text-xs text-[#8B89A0] mt-1">Average Score</p>
                        </div>
                        <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-4 text-center">
                            <p className={`text-2xl font-bold font-syne ${getScoreColor(bestScore)}`}>{bestScore}%</p>
                            <p className="text-xs text-[#8B89A0] mt-1">Best Score</p>
                        </div>
                    </div>
                )}

                {/* Filter tabs */}
                {totalInterviews > 0 && (
                    <div className="flex gap-2 mb-6">
                        {["all", "mock", "custom", "resume"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${filter === f
                                    ? "bg-[#6C63FF] text-white"
                                    : "bg-[#13151F] border border-white/[0.06] text-[#8B89A0] hover:text-white"
                                    }`}
                            >
                                {f === "all" ? "All" : f === "mock" ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> Mock
                                    </span>
                                ) : f === "custom" ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Custom
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> Resume
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {totalInterviews === 0 && (
                    <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 text-2xl">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="22"></line>
                            </svg>
                        </div>
                        <h3 className="font-syne font-bold text-white text-lg mb-2">No interviews yet</h3>
                        <p className="text-[#8B89A0] text-sm mb-6 max-w-xs mx-auto">
                            Complete your first interview to see your performance history here.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2.5 bg-[#6C63FF] hover:bg-[#5B54E8] text-white font-semibold rounded-xl text-sm transition-all"
                        >
                            Start an Interview
                        </button>
                    </div>
                )}

                {/* No results for filter */}
                {totalInterviews > 0 && filtered.length === 0 && (
                    <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-8 text-center">
                        <p className="text-[#8B89A0] text-sm">No {filter} interviews found.</p>
                    </div>
                )}

                {/* Interview cards */}
                <div className="space-y-3">
                    {filtered.map((analysis, idx) => {
                        const interview = analysis.interviewId;
                        const date = new Date(analysis.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });

                        return (
                            <div
                                key={analysis._id}
                                onClick={() => navigate(`/interview/${analysis.sessionId}/analysis`)}
                                className="group bg-[#13151F] border border-white/[0.06] hover:border-[#6C63FF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:bg-[#13151F]/80"
                            >
                                <div className="flex items-center justify-between gap-4">

                                    {/* Left — icon + info */}
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center text-lg shrink-0">
                                            {getSourceIcon(interview?.generatedFrom)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-syne font-bold text-white text-sm truncate">
                                                {interview?.title || "Interview"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="text-xs text-[#8B89A0]">{date}</span>
                                                {interview?.difficulty && (
                                                    <>
                                                        <span className="text-[#8B89A0]">·</span>
                                                        <span className="text-xs text-[#8B89A0]">{interview.difficulty}</span>
                                                    </>
                                                )}
                                                {interview?.category && (
                                                    <>
                                                        <span className="text-[#8B89A0]">·</span>
                                                        <span className="text-xs text-[#8B89A0] truncate max-w-[120px]">{interview.category}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right — score + arrow */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getScoreBg(analysis.score)}`}>
                                            <span className={getScoreColor(analysis.score)}>
                                                {analysis.score}% · {getScoreLabel(analysis.score)}
                                            </span>
                                        </div>
                                        <svg
                                            width="16" height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#5A5870"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="group-hover:stroke-[#6C63FF] transition-colors"
                                        >
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Dimension mini bars */}
                                {analysis.dimensions && (
                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                        {Object.entries(analysis.dimensions).map(([key, val]) => (
                                            <div key={key} className="flex flex-col gap-1">
                                                <div className="w-full h-1 bg-[#22283D] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${val >= 80 ? "bg-emerald-500" : val >= 60 ? "bg-[#6C63FF]" : val >= 40 ? "bg-amber-500" : "bg-rose-500"}`}
                                                        style={{ width: `${val}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[#8B89A0] truncate">
                                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default MyInterviewsPage;
