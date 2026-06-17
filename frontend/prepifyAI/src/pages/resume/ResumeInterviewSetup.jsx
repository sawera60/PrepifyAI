import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

const ResumeInterviewSetup = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Passed from modal via navigate state
    const { resumeText, aiQuestion, audio } = location.state || {};

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef(null);
    const currentAudioRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ── 🔊 PLAY DEEPGRAM AUDIO ──
    const playAudio = (base64, fallbackText, onEndCallback = null) => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        window.speechSynthesis.cancel();

        if (base64) {
            setIsSpeaking(true);
            const audioObj = new Audio(`data:audio/mp3;base64,${base64}`);
            currentAudioRef.current = audioObj;
            audioObj.onended = () => {
                setIsSpeaking(false);
                currentAudioRef.current = null;
                if (onEndCallback) onEndCallback();
            };
            audioObj.onerror = () => {
                console.warn("Audio playback failed, falling back to Web Speech");
                currentAudioRef.current = null;
                speakFallback(fallbackText, onEndCallback);
            };
            audioObj.play().catch(() => {
                currentAudioRef.current = null;
                speakFallback(fallbackText, onEndCallback);
            });
        } else {
            speakFallback(fallbackText, onEndCallback);
        }
    };

    // ── 🔊 WEB SPEECH FALLBACK ──
    const speakFallback = (text, onEndCallback = null) => {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            const pickVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                const preferred = ["Google UK English Female", "Google US English", "Microsoft Aria Online (Natural)", "Samantha"];
                const picked = preferred.map((name) => voices.find((v) => v.name === name)).find(Boolean);
                if (picked) utterance.voice = picked;
            };
            if (window.speechSynthesis.getVoices().length > 0) pickVoice();
            else window.speechSynthesis.onvoiceschanged = pickVoice;

            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            
            window.activeUtterance = utterance;
            setIsSpeaking(true);

            utterance.onend = () => {
                setIsSpeaking(false);
                window.activeUtterance = null;
                if (onEndCallback) onEndCallback();
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
                window.activeUtterance = null;
            };
            window.speechSynthesis.speak(utterance);
        }, 100);
    };

    // Redirect if no resume data (direct URL access)
    useEffect(() => {
        if (!resumeText || !aiQuestion) {
            navigate("/dashboard");
            return;
        }
        // Show AI's first question
        setMessages([{ role: "assistant", content: aiQuestion }]);
        playAudio(audio, aiQuestion);
    }, []);

    // -----------------------------
    // HANDLE USER REPLY
    // -----------------------------
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isCreating) return;

        const userInput = input.trim();
        setInput("");

        setMessages((prev) => [...prev, { role: "user", content: userInput }]);

        // The user's reply IS the target role
        // Create the interview immediately
        const confirmMsg = `Perfect! I'll create a personalized "${userInput}" interview based on your resume. Setting it up now... 🚀`;
        setMessages((prev) => [...prev, { role: "assistant", content: confirmMsg }]);
        speakFallback(confirmMsg);

        setIsCreating(true);
        await createInterview(userInput);
    };

    // -----------------------------
    // CREATE INTERVIEW
    // -----------------------------
    const createInterview = async (role) => {
        try {
            setError("");

            await api.post("/interviews/resume/create", {
                title: role,
                resumeText,
            });

            setTimeout(() => {
                navigate("/dashboard?tab=my-interviews");
            }, 2500);

        } catch (err) {
            setError("Something went wrong. Please try again.");
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col">

            {/* Header */}
            <header className="border-b border-white/[0.08] px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-sm">
                    📄
                </div>
                <div>
                    <h1 className="font-syne font-bold text-base text-white">Resume Interview Setup</h1>
                    <p className="text-xs text-[#8B89A0]">AI is reviewing your resume</p>
                </div>
                {/* Resume uploaded indicator */}
                <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Resume Uploaded</span>
                </div>
            </header>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 max-w-2xl w-full mx-auto">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                                🤖
                            </div>
                        )}
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                            ? "bg-[#6C63FF] text-white rounded-br-sm"
                            : "bg-[#13151F] border border-white/[0.08] text-gray-200 rounded-bl-sm"
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isCreating && (
                    <div className="flex justify-start">
                        <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs mr-2 mt-1">
                            🤖
                        </div>
                        <div className="bg-[#13151F] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                            {[0, 150, 300].map((delay) => (
                                <div
                                    key={delay}
                                    className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full animate-bounce"
                                    style={{ animationDelay: `${delay}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.08] p-4 max-w-2xl w-full mx-auto">
                {error && (
                    <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isCreating}
                        placeholder={isCreating ? "Creating your interview..." : "Type the role you want to be interviewed for..."}
                        className="flex-1 bg-[#13151F] border border-white/[0.08] text-white placeholder-[#8B89A0] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isCreating}
                        className="px-5 py-3 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all"
                    >
                        Send
                    </button>
                </form>
                <p className="text-xs text-[#8B89A0] mt-2 text-center">
                    Tell the AI which role you want to practice for
                </p>
            </div>
        </div>
    );
};

export default ResumeInterviewSetup;
