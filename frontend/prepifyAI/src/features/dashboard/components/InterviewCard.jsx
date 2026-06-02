import { useNavigate } from "react-router-dom";

const difficultyColors = {
    Easy: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
    Medium: { bg: "bg-amber-500/15", text: "text-amber-400" },
    Hard: { bg: "bg-red-500/15", text: "text-red-400" },
};

const categoryIcons = {
    "Frontend Development": { bg: "bg-blue-500/15", color: "text-blue-400", icon: "</>" },
    "Backend Development": { bg: "bg-green-500/15", color: "text-green-400", icon: "{}" },
    "JavaScript": { bg: "bg-yellow-500/15", color: "text-yellow-400", icon: "JS" },
    "Product Management": { bg: "bg-purple-500/15", color: "text-purple-400", icon: "📦" },
    "Behavioral": { bg: "bg-pink-500/15", color: "text-pink-400", icon: "🗣️" },
    default: { bg: "bg-[#6C63FF]/15", color: "text-[#9F9BFF]", icon: "💻" },
};

const InterviewCard = ({ interview }) => {
    const navigate = useNavigate();
    const difficulty = difficultyColors[interview.difficulty] || difficultyColors.Easy;
    const category = categoryIcons[interview.category] || categoryIcons.default;

    return (
        <div
            className="font-dm group bg-[#13151F] border border-white/[0.06] hover:border-[#6C63FF]/30 rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-[#6C63FF]/5"
            onClick={() => navigate("/interview")}
        >
            <div className="flex items-start gap-4 mb-4">
                {/* Category Icon */}
                <div className={`w-11 h-11 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-base font-bold ${category.color}`}>
                        {category.icon}
                    </span>
                </div>

                {/* Title + Difficulty */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">
                        {interview.title}
                    </h3>
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${difficulty.bg} ${difficulty.text}`}>
                        {interview.difficulty}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-4 text-[#5A5870] text-xs">
                    <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {interview.questions?.length || 15} Questions
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {interview.duration || 30} mins
                    </span>
                </div>

                {/* Arrow */}
                <div className="w-7 h-7 rounded-full bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center group-hover:bg-[#6C63FF] group-hover:border-[#6C63FF] transition-all duration-200">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#5A5870] group-hover:text-white transition-colors duration-200">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;