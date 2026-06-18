import React from "react";
import { FaMicrophoneAlt, FaRobot, FaCheckCircle, FaBrain, FaWaveSquare } from "react-icons/fa";

const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex justify-between items-center z-0">
            {/* Custom CSS for smooth floating animations */}
            <style>
                {`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(-3deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-15px) scale(1.05); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; filter: blur(40px); }
                    50% { opacity: 0.7; filter: blur(50px); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
                `}
            </style>

            {/* Glowing Orbs Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6C63FF] rounded-full mix-blend-screen animate-pulse-glow opacity-30 blur-[80px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#4ECDC4] rounded-full mix-blend-screen animate-pulse-glow opacity-20 blur-[100px]" style={{ animationDelay: "2s" }}></div>
            <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-[#FF6B6B] rounded-full mix-blend-screen animate-pulse-glow opacity-10 blur-[90px]" style={{ animationDelay: "1s" }}></div>

            {/* LEFT SIDE ELEMENTS */}
            <div className="relative flex-1 h-full hidden lg:flex flex-col justify-center items-end pr-8 z-10 max-w-[calc(50%-220px)]">
                
                {/* Floating Card 1 */}
                <div className="animate-float-slow mb-10 mr-12 bg-[#13151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-[0_0_30px_rgba(108,99,255,0.15)] flex items-center gap-4 w-60">
                    <div className="w-10 h-10 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
                        <FaRobot size={20} />
                    </div>
                    <div>
                        <div className="text-white text-sm font-semibold font-syne">AI Interviewer</div>
                        <div className="text-[#8B89A0] text-xs mt-0.5">Analyzing voice tone...</div>
                    </div>
                    <div className="ml-auto">
                        <FaWaveSquare className="text-[#4ECDC4] animate-pulse" />
                    </div>
                </div>

                {/* Floating Card 2 */}
                <div className="animate-float-medium mr-4 bg-[#13151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-[0_0_30px_rgba(78,205,196,0.15)] flex items-center gap-4 w-52" style={{ animationDelay: "1s" }}>
                    <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center text-[#4ECDC4]">
                        <FaCheckCircle size={20} />
                    </div>
                    <div>
                        <div className="text-white text-sm font-semibold font-syne">Resume Match</div>
                        <div className="text-[#4ECDC4] text-xs font-bold mt-0.5">94% Excellent</div>
                    </div>
                </div>

                {/* Decorative lines / Code snippet look */}
                <div className="animate-float-fast mt-12 mr-20 bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-3 w-44" style={{ animationDelay: "0.5s" }}>
                    <div className="flex gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#FF6B6B]/80"></div>
                        <div className="w-2 h-2 rounded-full bg-[#FECA57]/80"></div>
                        <div className="w-2 h-2 rounded-full bg-[#4ECDC4]/80"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 bg-white/10 rounded-full w-full"></div>
                        <div className="h-1.5 bg-white/10 rounded-full w-4/5"></div>
                        <div className="h-1.5 bg-[#6C63FF]/40 rounded-full w-3/5"></div>
                    </div>
                </div>

            </div>

            {/* RIGHT SIDE ELEMENTS */}
            <div className="relative flex-1 h-full hidden lg:flex flex-col justify-center items-start pl-8 z-10 max-w-[calc(50%-220px)]">
                
                {/* Floating Card 3 */}
                <div className="animate-float-medium mb-12 ml-4 bg-[#13151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-[0_0_30px_rgba(108,99,255,0.15)] flex flex-col gap-3 w-60" style={{ animationDelay: "1.5s" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#4ECDC4] flex items-center justify-center text-white">
                            <FaBrain size={18} />
                        </div>
                        <div>
                            <div className="text-white text-sm font-semibold font-syne">Real-time Feedback</div>
                        </div>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-[#8B89A0]">Confidence: High</span>
                        <span className="px-2 py-1 bg-[#4ECDC4]/10 rounded text-[10px] text-[#4ECDC4]">Pacing: Perfect</span>
                    </div>
                </div>

                {/* Floating Card 4 */}
                <div className="animate-float-slow ml-16 bg-[#13151F]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-[0_0_30px_rgba(255,107,107,0.1)] flex items-center gap-4 w-48" style={{ animationDelay: "0.8s" }}>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white relative overflow-hidden">
                        <FaMicrophoneAlt size={16} className="relative z-10" />
                        <div className="absolute inset-0 bg-[#6C63FF]/30 animate-pulse-glow"></div>
                    </div>
                    <div>
                        <div className="text-white text-sm font-semibold font-syne">Recording...</div>
                        <div className="text-[#8B89A0] text-[11px] mt-0.5">00:04:23</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnimatedBackground;
