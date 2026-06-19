import { useNavigate } from "react-router-dom";
import robotImg2 from "../../../assets/robot2.png";

const Herosection = () => {
    const navigate = useNavigate();

    return (
        <section className="font-dm relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#13151F] via-[#13151F] to-[#1A1D2A] border border-white/[0.06] py-5 px-4 sm:px-6 md:py-6 md:px-8 mt-4">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-[#6C63FF] opacity-[0.06] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-[180px] sm:w-[250px] h-[180px] sm:h-[250px] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-3xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Left — Text */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#9F9BFF] text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] inline-block animate-pulse" />
                        AI Interview Agent
                    </div>

                    {/* Heading */}
                    <h2 className="font-syne text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                        Get Interview <br className="hidden sm:inline" />Ready with <span className="text-[#6C63FF]">AI</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-[#8B89A0] text-sm leading-relaxed max-w-sm mx-auto sm:mx-0 mb-4">
                        Practice real interviews with our AI agent, get personalized feedback and improve your skills.
                    </p>

                    {/* CTA */}
                    <button
                        onClick={() => navigate("/interview/custom/setup")}
                        className="group inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-medium text-sm rounded-xl px-4 py-2 transition-all duration-200 shadow-lg shadow-[#6C63FF]/25"
                    >
                        Start Your Own Interview
                        <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                        </span>
                    </button>
                </div>

                {/* Right — Robot Image (hidden on very small screens) */}
                <div className="flex-shrink-0 relative hidden sm:block">
                    {/* Glow behind image */}
                    <div className="absolute inset-0 bg-[#6C63FF]/15 blur-2xl rounded-full scale-75" />

                    {/* Glowing blue lines */}
                    <div className="absolute top-1/2 -left-6 md:-left-12 -translate-y-1/2 flex items-center gap-1.5 z-0 opacity-80">
                        {[
                            { h: "h-6", delay: "0ms" },
                            { h: "h-10", delay: "150ms" },
                            { h: "h-14", delay: "300ms" },
                            { h: "h-20", delay: "450ms" },
                            { h: "h-16", delay: "600ms" },
                            { h: "h-10", delay: "750ms" },
                            { h: "h-6", delay: "900ms" },
                        ].map((line, i) => (
                            <div
                                key={i}
                                className={`w-[2px] ${line.h} bg-blue-500 rounded-full shadow-[0_0_12px_#3B82F6] animate-pulse`}
                                style={{ animationDelay: line.delay }}
                            />
                        ))}
                    </div>
                    <img
                        src={robotImg2}
                        alt="AI Interview Agent"
                        className="relative z-10 w-[120px] md:w-[170px] h-auto rounded-2xl object-cover"
                    />

                    {/* Chat bubble */}
                    <div className="absolute top-2 -left-16 md:top-6 md:-left-40 z-20 bg-[#1A1D2A] border border-white/[0.1] rounded-xl px-3 py-2 md:px-4 md:py-3 max-w-[160px] md:max-w-[200px] shadow-xl">
                        <p className="text-white text-xs leading-relaxed">
                            Hello! I'm your AI Interview Agent. Let's crack your dream job!!!
                        </p>
                        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#1A1D2A] border-r border-t border-white/[0.1] rotate-45" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Herosection;