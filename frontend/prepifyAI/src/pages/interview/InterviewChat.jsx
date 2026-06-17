

// import React, { useState, useRef, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";

// const InterviewChat = () => {
//     const { interviewId } = useParams();
//     const navigate = useNavigate();

//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState("");
//     const [sessionId, setSessionId] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState("");

//     // 🎤 VOICE STATES
//     const [isRecording, setIsRecording] = useState(false);
//     const [mediaRecorder, setMediaRecorder] = useState(null);

//     const messagesEndRef = useRef(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages, isLoading]);

//     // -----------------------------
//     // 🔊 SPEAK HELPER
//     // -----------------------------
//     const speakText = (text) => {
//         window.speechSynthesis.cancel(); // stop any previous speech
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.rate = 1;
//         utterance.pitch = 1;
//         window.speechSynthesis.speak(utterance);
//     };

//     // -----------------------------
//     // ✅ INTERVIEW COMPLETE DETECTION
//     // -----------------------------
//     const checkInterviewComplete = (reply) => {
//         if (reply.includes("[INTERVIEW_COMPLETE]")) {
//             const cleanReply = reply.replace("[INTERVIEW_COMPLETE]", "").trim();
//             return { isComplete: true, cleanReply };
//         }
//         return { isComplete: false, cleanReply: reply };
//     };

//     // -----------------------------
//     // START SESSION
//     // -----------------------------
//     const startSession = async () => {
//         try {
//             setError("");
//             setIsLoading(true);

//             const res = await api.post(`/sessions/start`, { interviewId });

//             setSessionId(res.data.sessionId);

//             if (res.data.firstMessage) {
//                 setMessages([
//                     { role: "assistant", content: res.data.firstMessage }
//                 ]);
//                 speakText(res.data.firstMessage);
//             }
//         } catch (error) {
//             setError(error.response?.data?.message || "Failed to start session.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // -----------------------------
//     // TEXT MESSAGE FLOW
//     // -----------------------------
//     const sendMessage = async (e) => {
//         e.preventDefault();
//         if (!input.trim() || !sessionId) return;

//         const userMsg = { role: "user", content: input };
//         setMessages((prev) => [...prev, userMsg]);
//         setInput("");
//         setIsLoading(true);
//         setError("");

//         try {
//             const res = await api.post(
//                 `/sessions/${sessionId}/message`,
//                 { message: userMsg.content }
//             );

//             const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);

//             setMessages((prev) => [
//                 ...prev,
//                 { role: "assistant", content: cleanReply }
//             ]);

//             // 🔊 speak the reply
//             speakText(cleanReply);

//             if (isComplete) {
//                 setTimeout(() => {
//                     endSession();
//                 }, 3000);
//             }

//         } catch (error) {
//             setError(error.response?.data?.message || "Failed to send message.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // -----------------------------
//     // 🎤 START RECORDING
//     // -----------------------------
//     const startRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//             const recorder = new MediaRecorder(stream);
//             const chunks = [];

//             recorder.ondataavailable = (e) => {
//                 chunks.push(e.data);
//             };

//             recorder.onstop = async () => {
//                 const blob = new Blob(chunks, { type: "audio/webm" });
//                 await sendAudio(blob);
//             };

//             recorder.start();
//             setMediaRecorder(recorder);
//             setIsRecording(true);

//         } catch (err) {
//             setError("Microphone not available on this device.");
//         }
//     };

//     // -----------------------------
//     // ⛔ STOP RECORDING
//     // -----------------------------
//     const stopRecording = () => {
//         if (mediaRecorder) {
//             mediaRecorder.stop();
//             setIsRecording(false);
//         }
//     };

//     // -----------------------------
//     // 📡 SEND AUDIO TO BACKEND
//     // -----------------------------
//     const sendAudio = async (blob) => {
//         if (!sessionId) return;

//         setIsLoading(true);
//         setError("");

//         try {
//             const formData = new FormData();
//             formData.append("audio", blob);

//             const res = await api.post(
//                 `/sessions/${sessionId}/voice-message`,
//                 formData
//             );

//             // 💬 show user's transcribed text
//             if (res.data.userText) {
//                 setMessages((prev) => [
//                     ...prev,
//                     { role: "user", content: res.data.userText }
//                 ]);
//             }

//             const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);

//             // 💬 show AI text (cleaned)
//             setMessages((prev) => [
//                 ...prev,
//                 { role: "assistant", content: cleanReply }
//             ]);

//             // 🔊 speak the reply
//             speakText(cleanReply);

//             if (isComplete) {
//                 setTimeout(() => {
//                     endSession();
//                 }, 3000);
//             }

//         } catch (error) {
//             setError(error.response?.data?.message || "Voice message failed.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // -----------------------------
//     // TEST AI VOICE
//     // -----------------------------
//     const testVoice = () => {
//         speakText("Hello! This is a voice test from PrepifyAI.");
//         setError("✅ Audio played successfully!");
//     };

//     // -----------------------------
//     // END SESSION
//     // -----------------------------
//     const endSession = async () => {
//         if (!sessionId) return;

//         try {
//             setIsLoading(true);
//             await api.patch(`/sessions/${sessionId}/end`);
//             navigate(`/interview/${sessionId}/analysis`);
//         } catch (error) {
//             setError("Failed to end session.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // -----------------------------
//     // UI
//     // -----------------------------
//     return (
//         <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50 text-black">

//             <header className="mb-4 text-center">
//                 <h1 className="text-2xl font-bold">Interview Chat</h1>

//                 {error && (
//                     <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
//                         {error}
//                     </div>
//                 )}

//                 {!sessionId ? (
//                     <button
//                         onClick={startSession}
//                         disabled={isLoading}
//                         className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
//                     >
//                         Start Interview
//                     </button>
//                 ) : (
//                     <button
//                         onClick={endSession}
//                         className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
//                     >
//                         End Interview
//                     </button>
//                 )}
//             </header>

//             {/* CHAT BOX */}
//             <div className="flex-1 overflow-y-auto p-4 bg-white border rounded flex flex-col gap-3">

//                 {messages.map((msg, idx) => (
//                     <div
//                         key={idx}
//                         className={`max-w-[80%] p-3 rounded ${msg.role === "user"
//                             ? "bg-blue-100 self-end"
//                             : "bg-gray-100 self-start"
//                             }`}
//                     >
//                         {msg.content}
//                     </div>
//                 ))}

//                 {isLoading && (
//                     <div className="text-gray-500 italic">
//                         AI is thinking...
//                     </div>
//                 )}

//                 <div ref={messagesEndRef} />
//             </div>

//             {/* INPUT + VOICE CONTROLS */}
//             <form onSubmit={sendMessage} className="flex gap-2 mt-3">

//                 <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     disabled={!sessionId || isLoading}
//                     className="flex-1 border p-2 rounded"
//                     placeholder="Type your answer..."
//                 />

//                 {/* TEXT SEND */}
//                 <button
//                     type="submit"
//                     disabled={!input.trim() || isLoading}
//                     className="px-4 bg-blue-600 text-white rounded"
//                 >
//                     Send
//                 </button>

//                 {/* TEST VOICE BUTTON */}
//                 <button
//                     type="button"
//                     onClick={testVoice}
//                     className="px-4 rounded bg-indigo-600 text-white"
//                 >
//                     Test 🔊
//                 </button>

//                 {/* 🎤 MIC BUTTON */}
//                 <button
//                     type="button"
//                     onClick={isRecording ? stopRecording : startRecording}
//                     className={`px-4 rounded text-white ${isRecording ? "bg-red-600" : "bg-green-600"}`}
//                     disabled={!sessionId}
//                 >
//                     {isRecording ? "Stop 🎙️" : "Speak 🎤"}
//                 </button>

//             </form>
//         </div>
//     );
// };

// export default InterviewChat;


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
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // -----------------------------
    // 🔊 SPEAK HELPER
    // -----------------------------
    const speakText = (text) => {
        // Force resume in case the browser's speech synthesis engine got stuck/paused
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        // Wait a tiny bit for the cancel to resolve in the browser's speech thread
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;

            // Fix garbage collection issue in Chrome by binding it to window
            window.activeUtterance = utterance;

            setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                window.activeUtterance = null;
            };
            utterance.onerror = (e) => {
                console.error("SpeechSynthesis error:", e);
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
            const cleanReply = reply.replace("[INTERVIEW_COMPLETE]", "").trim();
            return { isComplete: true, cleanReply };
        }
        return { isComplete: false, cleanReply: reply };
    };

    // -----------------------------
    // START SESSION
    // -----------------------------
    const startSession = async () => {
        try {
            // Unlock speech synthesis immediately inside user gesture!
            const unlockUtterance = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(unlockUtterance);

            setError("");
            setIsLoading(true);
            const res = await api.post(`/sessions/start`, { interviewId });
            setSessionId(res.data.sessionId);
            if (res.data.firstMessage) {
                setMessages([{ role: "assistant", content: res.data.firstMessage }]);
                speakText(res.data.firstMessage);
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to start session.");
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

        // Unlock speech synthesis immediately inside user gesture!
        const unlockUtterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(unlockUtterance);

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
            speakText(cleanReply);
            if (isComplete) setTimeout(() => endSession(), 3000);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to send message.");
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // 🎤 RECORDING
    // -----------------------------
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Use a supported MIME type — webm/opus is supported in Chrome/Edge, ogg/opus in Firefox
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : "audio/ogg";
            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: recorder.mimeType });
                await sendAudio(blob);
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setError("Microphone not available on this device.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            // Unlock speech synthesis immediately inside user gesture!
            const unlockUtterance = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(unlockUtterance);

            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // -----------------------------
    // 📡 SEND AUDIO
    // -----------------------------
    const sendAudio = async (blob) => {
        if (!sessionId) return;
        setIsLoading(true);
        setError("");
        try {
            const formData = new FormData();
            // Use blob.type to pick the right file extension (webm on Chrome, ogg on Firefox)
            const ext = blob.type.includes("ogg") ? "ogg" : "webm";
            formData.append("audio", blob, `recording.${ext}`);
            const res = await api.post(`/sessions/${sessionId}/voice-message`, formData);
            if (res.data.userText) {
                setMessages((prev) => [...prev, { role: "user", content: res.data.userText }]);
            }
            const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);
            setMessages((prev) => [...prev, { role: "assistant", content: cleanReply }]);
            speakText(cleanReply);
            if (isComplete) setTimeout(() => endSession(), 3000);
        } catch (error) {
            setError(error.response?.data?.message || "Voice message failed.");
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
        } catch (error) {
            setError("Failed to end session.");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg max-w-[180px] sm:max-w-xs truncate">
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
                                <button
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                                    onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                                    disabled={isLoading || isSpeaking}
                                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all select-none ${isRecording
                                        ? "bg-[#6C63FF] scale-110 shadow-[0_0_40px_rgba(108,99,255,0.6)]"
                                        : (isLoading || isSpeaking)
                                            ? "bg-[#6C63FF]/30 cursor-not-allowed"
                                            : "bg-[#13151F] border-2 border-[#6C63FF]/40 hover:border-[#6C63FF] hover:bg-[#6C63FF]/10"
                                        }`}
                                    title="Hold to speak"
                                >
                                    {isRecording && (
                                        <span className="absolute inset-0 rounded-full bg-[#6C63FF]/30 animate-ping" />
                                    )}
                                    <svg
                                        className={`w-10 h-10 transition-colors ${isRecording ? "text-white" : "text-[#6C63FF]"
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6.364 5.636a1 1 0 0 1 1.414 1.414A8.966 8.966 0 0 1 13 17.945V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.055A8.966 8.966 0 0 1 4.222 10.05a1 1 0 1 1 1.414-1.414 7 7 0 0 0 12.728 0z" />
                                    </svg>
                                </button>
                                <p className="text-sm text-[#8B89A0]">
                                    {isRecording ? "Listening..." : isLoading ? "Processing..." : isSpeaking ? "AI is speaking..." : "Tap and hold to speak"}
                                </p>
                            </div>

                            <button
                                onClick={endSession}
                                className="px-6 py-3 mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-full text-sm transition-all flex items-center gap-2"
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
