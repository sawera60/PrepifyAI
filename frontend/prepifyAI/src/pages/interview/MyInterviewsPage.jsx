import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FiCpu, FiEdit3, FiFileText, FiChevronRight, FiInbox } from "react-icons/fi";
import DashboardHeader from "../../features/dashboard/components/DashboardHeader";
import Sidebar from "../../features/dashboard/components/Sidebar";

const getScoreColor = (score) => {
    if (score >= 80) return "text-[#4ECDC4]";
    if (score >= 60) return "text-[#6C63FF]";
    if (score >= 40) return "text-amber-400";
    return "text-rose-400";
};

const getScoreBg = (score) => {
    if (score >= 80) return "bg-[#4ECDC4]/10 border-[#4ECDC4]/20 shadow-[0_0_10px_rgba(78,205,196,0.1)]";
    if (score >= 60) return "bg-[#6C63FF]/10 border-[#6C63FF]/20 shadow-[0_0_10px_rgba(108,99,255,0.1)]";
    if (score >= 40) return "bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]";
    return "bg-rose-400/10 border-rose-400/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
};

const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-[#4ECDC4] shadow-[0_0_8px_rgba(78,205,196,0.5)]";
    if (score >= 60) return "bg-[#6C63FF] shadow-[0_0_8px_rgba(108,99,255,0.5)]";
    if (score >= 40) return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]";
    return "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
};

const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Work";
};

const getSourceIcon = (generatedFrom, className = "w-5 h-5") => {
    if (generatedFrom === "resume") return <FiFileText className={className} />;
    if (generatedFrom === "custom") return <FiEdit3 className={className} />;
    return <FiCpu className={className} />;
};

const MyInterviewsPage = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all"); // all | mock | custom | resume
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get("/sessions/my-sessions");
                setAnalyses(res.data.analyses);
            } catch (err) {
                console.error("DEBUG MyInterviewsPage API error:", err, err.response?.data);
                setError(err.response?.data?.message || err.message || "Failed to load your interviews.");
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

    return (
        <div className="min-h-screen bg-[#0B0D14] flex flex-col md:flex-row overflow-hidden font-dm relative">
            
            {/* Ambient Background Glows */}
            <div className="pointer-events-none fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6C63FF] opacity-[0.05] blur-[150px]" />
            <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-[150px]" />

            <Sidebar
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto lg:ml-[264px]">
                <DashboardHeader onMenuToggle={() => setMobileMenuOpen(true)} />

                <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="font-syne text-2xl md:text-3xl font-bold text-white mb-1.5 tracking-tight">
                            My Interviews
                        </h1>
                        <p className="text-[#8B89A0] text-sm">
                            Review your performance history and detailed analysis reports.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-[#6C63FF] rounded-full animate-spin shadow-[0_0_15px_rgba(108,99,255,0.3)]" />
                            <p className="text-[#8B89A0] text-sm font-medium">Fetching your records...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Row */}
                            {totalInterviews > 0 && (
                                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-[0_0_30px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:bg-white/10 transition-colors" />
                                        <p className="text-xl sm:text-2xl md:text-3xl font-black font-syne text-white tracking-tight mb-0.5">{totalInterviews}</p>
                                        <p className="text-[10px] sm:text-xs text-[#8B89A0] font-semibold uppercase tracking-wider">Total</p>
                                    </div>
                                    <div className="bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-[0_0_30px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C63FF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#6C63FF]/10 transition-colors" />
                                        <p className={`text-xl sm:text-2xl md:text-3xl font-black font-syne tracking-tight mb-0.5 ${getScoreColor(avgScore)}`}>{avgScore}%</p>
                                        <p className="text-[10px] sm:text-xs text-[#8B89A0] font-semibold uppercase tracking-wider">Average</p>
                                    </div>
                                    <div className="bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-[0_0_30px_rgba(0,0,0,0.2)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#4ECDC4]/5 rounded-bl-full pointer-events-none group-hover:bg-[#4ECDC4]/10 transition-colors" />
                                        <p className={`text-xl sm:text-2xl md:text-3xl font-black font-syne tracking-tight mb-0.5 ${getScoreColor(bestScore)}`}>{bestScore}%</p>
                                        <p className="text-[10px] sm:text-xs text-[#8B89A0] font-semibold uppercase tracking-wider">Best</p>
                                    </div>
                                </div>
                            )}

                            {/* Filter tabs */}
                            {totalInterviews > 0 && (
                                <div className="flex gap-2 md:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-1 scrollbar-hide">
                                    <div className="flex gap-2 bg-[#13151F]/60 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-white/5 backdrop-blur-md">
                                    {["all", "mock", "custom", "resume"].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-3 sm:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 sm:gap-2 capitalize whitespace-nowrap ${
                                                filter === f
                                                    ? "bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] text-white shadow-lg shadow-[#6C63FF]/25"
                                                    : "bg-transparent text-[#8B89A0] hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            {f !== "all" && getSourceIcon(f, "w-4 h-4")}
                                            {f}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mb-8 px-5 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3">
                                    <FiInbox className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Empty state */}
                            {totalInterviews === 0 && !error && (
                                <div className="bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-12 lg:p-14 text-center shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                                    <div className="w-16 h-16 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mx-auto mb-5">
                                        <FiInbox className="w-8 h-8 text-[#6C63FF]" />
                                    </div>
                                    <h3 className="font-syne font-bold text-white text-xl mb-2 tracking-tight">No interviews yet</h3>
                                    <p className="text-[#8B89A0] text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                                        You haven't completed any interviews. Take your first mock interview to get a detailed performance report here.
                                    </p>
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="px-6 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#6C63FF]/25"
                                    >
                                        Start an Interview
                                    </button>
                                </div>
                            )}

                            {/* No results for filter */}
                            {totalInterviews > 0 && filtered.length === 0 && (
                                <div className="bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <FiInbox className="w-8 h-8 text-[#8B89A0]" />
                                    </div>
                                    <p className="text-[#8B89A0] text-base font-medium">No <span className="capitalize text-white">{filter}</span> interviews found.</p>
                                </div>
                            )}

                            {/* Interview cards list */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                {filtered.map((analysis) => {
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
                                            className="group bg-[#13151F]/60 backdrop-blur-md border border-white/10 hover:border-[#6C63FF]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:bg-[#13151F] hover:shadow-[0_0_30px_rgba(108,99,255,0.15)] flex flex-col justify-between relative"
                                        >
                                            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-5">
                                                {/* Left — icon + info */}
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#1A1D2A] border border-white/10 flex items-center justify-center text-[#9F9BFF] shrink-0 group-hover:scale-110 group-hover:bg-[#6C63FF]/20 group-hover:border-[#6C63FF]/30 transition-all duration-300">
                                                        {getSourceIcon(interview?.generatedFrom, "w-5 h-5")}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-syne font-bold text-white text-sm md:text-base truncate group-hover:text-[#6C63FF] transition-colors">
                                                            {interview?.title || "Mock Interview"}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className="text-[11px] text-[#8B89A0] font-medium bg-white/5 px-1.5 py-0.5 rounded">{date}</span>
                                                            {interview?.difficulty && (
                                                                <span className="text-[11px] text-[#8B89A0] font-medium bg-white/5 px-1.5 py-0.5 rounded capitalize">{interview.difficulty}</span>
                                                            )}
                                                            {interview?.category && (
                                                                <span className="text-[11px] text-[#8B89A0] font-medium bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[120px]">{interview.category}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right — score indicator */}
                                                <div className="flex flex-col items-end shrink-0">
                                                    <div className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center ${getScoreBg(analysis.score)} transition-transform group-hover:scale-105`}>
                                                        <span className={`text-lg font-black font-syne leading-none ${getScoreColor(analysis.score)}`}>
                                                            {analysis.score}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dimension mini bars */}
                                            {analysis.dimensions && (
                                                <div className="mt-auto border-t border-white/5 pt-3 sm:pt-4 grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
                                                    {Object.entries(analysis.dimensions).map(([key, val]) => (
                                                        <div key={key} className="flex flex-col gap-1.5 group/bar">
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[9px] md:text-[10px] font-semibold text-[#8B89A0] truncate uppercase tracking-wider group-hover/bar:text-white transition-colors">
                                                                    {key.replace(/([A-Z])/g, " $1").trim().split(" ")[0]}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(val)}`}
                                                                    style={{ width: `${val}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Explore Prompt */}
                                            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/30">
                                                <FiChevronRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyInterviewsPage;
