

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
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
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
            formData.append("audio", blob);
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
                <div className="flex items-center gap-3 mt-6">
                    {!sessionId ? (
                        <button
                            onClick={startSession}
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-50 text-white font-semibold rounded-full text-sm transition-all shadow-lg shadow-[#6C63FF]/20"
                        >
                            {isLoading ? "Starting..." : "Start Interview"}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all text-lg ${isRecording
                                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                                    : "bg-[#1A1D2A] border border-white/[0.08] hover:border-[#6C63FF]/40"
                                    }`}
                                title={isRecording ? "Stop recording" : "Start recording"}
                            >
                                {isRecording ? "⏹" : "🎤"}
                            </button>

                            <button
                                onClick={endSession}
                                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full text-sm transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                            >
                                <span>📵</span> End Interview
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Transcript */}
            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto px-6 pb-6 max-w-2xl w-full mx-auto">
                    <p className="text-xs text-[#8B89A0] uppercase tracking-wider font-semibold mb-3">
                        Transcript
                    </p>
                    <div className="flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5">
                                    <img
                                        src={msg.role === "user" ? userAvatar : aiAvatar}
                                        alt={msg.role}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-[#6C63FF] text-white rounded-br-sm"
                                    : "bg-[#13151F] border border-white/[0.08] text-gray-200 rounded-bl-sm"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                                    <img src={aiAvatar} alt="AI" className="w-full h-full object-cover" />
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

                    {/* Text input */}
                    <form onSubmit={sendMessage} className="flex gap-2 mt-4">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={!sessionId || isLoading}
                            placeholder="Type your answer..."
                            className="flex-1 bg-[#13151F] border border-white/[0.08] text-white placeholder-[#8B89A0] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-all disabled:opacity-40"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-5 py-3 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition-all"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InterviewChat;
