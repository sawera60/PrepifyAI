import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";

const navItems = [
    { label: "Dashboard", icon: "grid", path: "/dashboard" },
    { label: "My Interviews", icon: "clipboard", path: "/my-interviews" },
    { label: "Mock Interviews", icon: "mic", path: "/mock" },
    { label: "Generate Interview", icon: "plus", path: "/interview/custom/setup" },
    { label: "Resume Analyzer", icon: "file", path: "/resumeanalyzer" },
    { label: "Payment & Plans", icon: "credit-card", path: "/payment" },
    { label: "Settings", icon: "settings", path: "/settings" },
];

const iconMap = {
    grid: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    ),
    clipboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" />
        </svg>
    ),
    mic: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
    ),
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    file: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    "credit-card": (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    settings: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
};

const Sidebar = ({ mobileOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNav = (path) => {
        navigate(path);
        onClose?.(); // close mobile drawer on nav
    };

    const navContent = (
        <>
            {/* Logo */}
            <div className="px-4 py-2 flex items-center justify-between">
                <img src={logo} alt="PrepifyAI Logo" className="w-26 h-auto object-contain" />
                {/* Close button — mobile only */}
                <button
                    onClick={onClose}
                    className="lg:hidden w-7 h-7 flex items-center justify-center text-[#8B89A0] hover:text-white"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 mt-2">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path === "/dashboard" && location.pathname === "/dashboard");
                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => handleNav(item.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${isActive
                                            ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"
                                            : "text-[#8B89A0] hover:text-white hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <span className={isActive ? "text-white" : "text-[#5A5870]"}>
                                        {iconMap[item.icon]}
                                    </span>
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="px-4 pb-5 border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#4ECDC4] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">User</p>
                        <p className="text-[#5A5870] text-xs">Free Plan</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="font-dm w-[240px] min-h-screen bg-[#13151F] border-r border-white/[0.06] flex-col fixed left-0 top-0 z-40 hidden lg:flex">
                {navContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`font-dm w-[240px] min-h-screen bg-[#13151F] border-r border-white/[0.06] flex flex-col fixed left-0 top-0 z-50 lg:hidden transition-transform duration-300 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {navContent}
            </aside>
        </>
    );
};

export default Sidebar;
