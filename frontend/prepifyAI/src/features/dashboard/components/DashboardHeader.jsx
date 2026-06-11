import { useNavigate } from "react-router-dom";

const DashboardHeader = ({ onMenuToggle }) => {
    const navigate = useNavigate();
    return (
        <header className="font-dm flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06]">
            {/* Left — Hamburger (mobile) + Greeting */}
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden w-9 h-9 rounded-lg bg-[#1A1D2A] border border-white/[0.08] flex items-center justify-center text-[#8B89A0] hover:text-white transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1 className="font-syne text-lg sm:text-xl font-bold text-white tracking-tight">
                    Welcome back! 👋
                </h1>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Upgrade Button — hidden on very small screens */}
                <button
                    onClick={() => navigate("/payment")}
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 shadow-lg shadow-[#6C63FF]/20"
                >
                    <span>👑</span>
                    Upgrade to Pro
                </button>

                {/* Notification Bell */}
                <button className="relative w-9 h-9 rounded-lg bg-[#1A1D2A] border border-white/[0.08] flex items-center justify-center text-[#8B89A0] hover:text-white hover:border-white/[0.15] transition-all duration-150">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B6B] border-2 border-[#1A1D2A]" />
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#4ECDC4] flex items-center justify-center text-white text-sm font-bold cursor-pointer ring-2 ring-white/[0.08] hover:ring-[#6C63FF]/40 transition-all duration-200">
                    U
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;