import { useNavigate } from "react-router-dom";
import robotImg from "../../../assets/robot1.jpg";

const Herosection = () => {
    const navigate = useNavigate();

    return (
        <section className="font-dm relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#13151F] via-[#13151F] to-[#1A1D2A] border border-white/[0.06] p-8 md:p-10 mt-6">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-[350px] h-[350px] rounded-full bg-[#6C63FF] opacity-[0.06] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Left — Text */}
                <div className="flex-1 min-w-0">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#9F9BFF] text-[10px] font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] inline-block animate-pulse" />
                        AI Interview Agent
                    </div>

                    {/* Heading */}
                    <h2 className="font-syne text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                        Get Interview<br />
                        Ready with <span className="text-[#6C63FF]">AI</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-[#8B89A0] text-sm leading-relaxed max-w-md mb-7">
                        Practice real interviews with our AI agent, get personalized feedback and improve your skills.
                    </p>

                    {/* CTA */}
                    <button
                        onClick={() => navigate("/interview")}
                        className="group inline-flex items-center gap-2.5 bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-medium text-sm rounded-xl px-6 py-3 transition-all duration-200 shadow-lg shadow-[#6C63FF]/25"
                    >
                        Start Your Own Interview
                        <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                        </span>
                    </button>
                </div>

                {/* Right — Robot Image */}
                <div className="flex-shrink-0 relative">
                    {/* Glow behind image */}
                    <div className="absolute inset-0 bg-[#6C63FF]/15 blur-2xl rounded-full scale-75" />
                    <img
                        src={robotImg}
                        alt="AI Interview Agent"
                        className="relative z-10 w-[220px] md:w-[280px] h-auto rounded-2xl object-cover"
                    />

                    {/* Chat bubble */}
                    <div className="absolute -top-2 -left-4 md:left-auto md:-right-4 z-20 bg-[#1A1D2A] border border-white/[0.1] rounded-xl px-4 py-3 max-w-[200px] shadow-xl">
                        <p className="text-white text-xs leading-relaxed">
                            Hello! I'm your AI Interview Agent. Let's crack your dream job! 🚀
                        </p>
                        {/* Bubble tail */}
                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#1A1D2A] border-r border-b border-white/[0.1] rotate-45" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Herosection;