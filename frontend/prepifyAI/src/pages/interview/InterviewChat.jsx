import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import aiAvatar from "../../assets/robot2.png";
import userAvatar from "../../assets/user.jpeg";

const InterviewChat = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const currentAudioRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // -----------------------------
    // 🔊 PLAY DEEPGRAM AUDIO (base64)
    // Falls back to Web Speech if audio is null
    // -----------------------------
    const playAudio = (base64, fallbackText) => {
        // Stop any currently playing audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        window.speechSynthesis.cancel();

        if (base64) {
            setIsSpeaking(true);
            const audio = new Audio(`data:audio/mp3;base64,${base64}`);
            currentAudioRef.current = audio;
            audio.onended = () => {
                setIsSpeaking(false);
                currentAudioRef.current = null;
            };
            audio.onerror = () => {
                console.warn("Audio playback failed, falling back to Web Speech");
                currentAudioRef.current = null;
                speakFallback(fallbackText);
            };
            audio.play().catch(() => {
                currentAudioRef.current = null;
                speakFallback(fallbackText);
            });
        } else {
            // No audio from backend — use Web Speech API as fallback
            speakFallback(fallbackText);
        }
    };

    // -----------------------------
    // 🔊 WEB SPEECH FALLBACK
    // Picks the best available voice
    // -----------------------------
    const speakFallback = (text) => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);

            const pickVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                const preferred = [
                    "Google UK English Female",
                    "Google US English",
                    "Microsoft Aria Online (Natural)",
                    "Microsoft Jenny Online (Natural)",
                    "Samantha",
                    "Karen",
                ];
                const picked = preferred
                    .map((name) => voices.find((v) => v.name === name))
                    .find(Boolean);
                if (picked) utterance.voice = picked;
            };

            if (window.speechSynthesis.getVoices().length > 0) {
                pickVoice();
            } else {
                window.speechSynthesis.onvoiceschanged = pickVoice;
            }

            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            window.activeUtterance = utterance;
            setIsSpeaking(true);

            utterance.onend = () => {
                setIsSpeaking(false);
                window.activeUtterance = null;
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
                window.activeUtterance = null;
            };

            window.speechSynthesis.speak(utterance);
        }, 100);
    };

    // -----------------------------
    // ✅ INTERVIEW COMPLETE DETECTION
    // -----------------------------
    const checkInterviewComplete = (reply) => {
        if (reply.includes("[INTERVIEW_COMPLETE]")) {
            return {
                isComplete: true,
                cleanReply: reply.replace("[INTERVIEW_COMPLETE]", "").trim(),
            };
        }
        return { isComplete: false, cleanReply: reply };
    };

    // -----------------------------
    // START SESSION
    // -----------------------------
    const startSession = async () => {
        try {
            // Unlock audio context on user gesture (required by browsers)
            const unlock = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(unlock);

            setError("");
            setIsLoading(true);
            const res = await api.post(`/sessions/start`, { interviewId });
            setSessionId(res.data.sessionId);
            if (res.data.firstMessage) {
                setMessages([{ role: "assistant", content: res.data.firstMessage }]);
                // Play Deepgram Aura audio if backend returned it, else fallback
                playAudio(res.data.audio, res.data.firstMessage);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to start session.";
            setError(`[${err?.response?.status || "ERR"}] ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // TEXT MESSAGE
    // -----------------------------
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const unlock = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(unlock);

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setError("");

        try {
            const res = await api.post(`/sessions/${sessionId}/message`, {
                message: userMsg.content,
            });
            const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);
            setMessages((prev) => [...prev, { role: "assistant", content: cleanReply }]);

            // Play Deepgram Aura audio if backend returned it, else fallback
            playAudio(res.data.audio, cleanReply);

            if (isComplete) setTimeout(() => endSession(), 3000);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to send message.";
            setError(`[${err?.response?.status || "ERR"}] ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // 🎤 TOGGLE RECORDING
    // Click once → start, click again → stop
    // Works on both laptop and mobile
    // -----------------------------
    const toggleRecording = async () => {
        if (isRecording) {
            // ── STOP ──
            if (mediaRecorderRef.current) {
                // Unlock audio on user gesture before stopping
                const unlock = new SpeechSynthesisUtterance("");
                window.speechSynthesis.speak(unlock);

                mediaRecorderRef.current.stop();
                streamRef.current?.getTracks().forEach((t) => t.stop());
                setIsRecording(false);
            }
        } else {
            // ── START ──
            if (isLoading || isSpeaking) return;
            setError("");

            // Stop AI speaking when user wants to respond
            if (currentAudioRef.current) {
                currentAudioRef.current.pause();
                currentAudioRef.current = null;
            }
            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                audioChunksRef.current = [];

                const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : MediaRecorder.isTypeSupported("audio/webm")
                        ? "audio/webm"
                        : "audio/ogg";

                const recorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };

                recorder.onstop = async () => {
                    const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
                    await sendAudio(blob, recorder.mimeType);
                };

                recorder.start();
                setIsRecording(true);
            } catch (err) {
                setError("Microphone access denied. Please allow mic permissions.");
            }
        }
    };

    // -----------------------------
    // 📡 SEND AUDIO TO BACKEND
    // -----------------------------
    const sendAudio = async (blob, mimeType) => {
        if (!sessionId) return;

        if (blob.size < 100) {
            setError("Recording too short — please speak for at least 1 second.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            const ext = (mimeType || blob.type).includes("ogg") ? "ogg" : "webm";
            formData.append("audio", blob, `recording.${ext}`);

            const res = await api.post(`/sessions/${sessionId}/voice-message`, formData);

            if (res.data.userText) {
                setMessages((prev) => [
                    ...prev,
                    { role: "user", content: res.data.userText },
                ]);
            }

            const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: cleanReply },
            ]);

            // Play Deepgram Aura audio if backend returned it, else fallback
            playAudio(res.data.audio, cleanReply);

            if (isComplete) setTimeout(() => endSession(), 3000);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Voice message failed.";
            setError(`[${err?.response?.status || "ERR"}] ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // END SESSION
    // -----------------------------
    const endSession = async () => {
        if (!sessionId) return;
        try {
            setIsLoading(true);
            await api.patch(`/sessions/${sessionId}/end`);
            navigate(`/interview/${sessionId}/analysis`);
        } catch (err) {
            setError("Failed to end session.");
        } finally {
            setIsLoading(false);
        }
    };

    // Mic button visual state
    const micState = isLoading
        ? "loading"
        : isRecording
            ? "recording"
            : isSpeaking
                ? "speaking"
                : "idle";

    return (
        <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col">

            {/* Top bar */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#6C63FF]" />
                    <span className="font-syne font-bold text-sm text-white tracking-wide">PrepifyAI</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {sessionId && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-emerald-400 font-medium">Live Session</span>
                        </div>
                    )}
                    {error && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg max-w-[220px] sm:max-w-sm">
                            {error}
                        </div>
                    )}
                </div>
            </header>

            {/* Two-panel call area */}
            <div className="flex flex-col items-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">

                    {/* AI Interviewer Panel */}
                    <div className={`relative bg-[#13151F] border rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 transition-all duration-300 ${isSpeaking ? "border-[#6C63FF]/60 shadow-[0_0_20px_rgba(108,99,255,0.15)]" : "border-white/[0.08]"}`}>
                        {isSpeaking && (
                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1">
                                {[0, 150, 300].map((delay) => (
                                    <div
                                        key={delay}
                                        className="w-1 bg-[#6C63FF] rounded-full animate-bounce"
                                        style={{ height: "10px", animationDelay: `${delay}ms` }}
                                    />
                                ))}
                            </div>
                        )}
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${isSpeaking ? "border-[#6C63FF]" : "border-[#6C63FF]/30"}`}>
                            <img src={aiAvatar} alt="AI Interviewer" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                            <p className="font-syne font-bold text-xs sm:text-sm text-white">AI Interviewer</p>
                            <p className="text-[10px] sm:text-xs text-[#8B89A0] mt-0.5">
                                {isSpeaking ? "Speaking..." : isLoading ? "Thinking..." : sessionId ? "Listening" : "Ready"}
                            </p>
                        </div>
                    </div>

                    {/* User Panel */}
                    <div className={`relative bg-[#13151F] border rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 transition-all duration-300 ${isRecording ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-white/[0.08]"}`}>
                        {isRecording && (
                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] sm:text-xs text-red-400">REC</span>
                            </div>
                        )}
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${isRecording ? "border-red-500" : "border-white/10"}`}>
                            <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                            <p className="font-syne font-bold text-xs sm:text-sm text-white">You</p>
                            <p className="text-[10px] sm:text-xs text-[#8B89A0] mt-0.5">
                                {isRecording ? "Recording..." : "Candidate"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-center gap-6 mt-12 w-full max-w-md">
                    {!sessionId ? (
                        <button
                            onClick={startSession}
                            disabled={isLoading}
                            className="px-8 py-4 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-50 text-white font-semibold rounded-full text-base transition-all shadow-lg shadow-[#6C63FF]/20 w-full"
                        >
                            {isLoading ? "Starting..." : "Start Interview"}
                        </button>
                    ) : (
                        <>
                            <div className="flex flex-col items-center gap-3">
                                {/* Toggle mic button — click once to start, click again to stop */}
                                <button
                                    onClick={toggleRecording}
                                    disabled={micState === "loading" || micState === "speaking"}
                                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all select-none
                                        ${micState === "recording"
                                            ? "bg-[#6C63FF] scale-110 shadow-[0_0_40px_rgba(108,99,255,0.6)]"
                                            : micState === "loading" || micState === "speaking"
                                                ? "bg-[#6C63FF]/30 cursor-not-allowed"
                                                : "bg-[#13151F] border-2 border-[#6C63FF]/40 hover:border-[#6C63FF] hover:bg-[#6C63FF]/10"
                                        }`}
                                    title={isRecording ? "Click to stop recording" : "Click to start recording"}
                                >
                                    {micState === "recording" && (
                                        <span className="absolute inset-0 rounded-full bg-[#6C63FF]/30 animate-ping" />
                                    )}
                                    {micState === "recording" ? (
                                        // Stop icon when recording
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="6" width="12" height="12" rx="2" />
                                        </svg>
                                    ) : (
                                        // Mic icon when idle
                                        <svg
                                            className={`w-10 h-10 transition-colors ${micState === "loading" || micState === "speaking" ? "text-[#6C63FF]/40" : "text-[#6C63FF]"}`}
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6.364 5.636a1 1 0 0 1 1.414 1.414A8.966 8.966 0 0 1 13 17.945V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.055A8.966 8.966 0 0 1 4.222 10.05a1 1 0 1 1 1.414-1.414 7 7 0 0 0 12.728 0z" />
                                        </svg>
                                    )}
                                </button>
                                <p className="text-sm text-[#8B89A0]">
                                    {micState === "recording"
                                        ? "Recording — click to stop"
                                        : micState === "loading"
                                            ? "Processing..."
                                            : micState === "speaking"
                                                ? "AI is speaking..."
                                                : "Click mic to speak"}
                                </p>
                            </div>

                            <button
                                onClick={endSession}
                                className="mt-4 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-full text-sm transition-all flex items-center gap-2"
                            >
                                <span>📵</span> End Interview
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewChat;
