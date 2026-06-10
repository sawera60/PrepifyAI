

import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const InterviewChat = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 🎤 VOICE STATES
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

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
        window.speechSynthesis.cancel(); // stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
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
            setError("");
            setIsLoading(true);

            const res = await api.post(`/sessions/start`, { interviewId });

            setSessionId(res.data.sessionId);

            if (res.data.firstMessage) {
                setMessages([
                    { role: "assistant", content: res.data.firstMessage }
                ]);
                speakText(res.data.firstMessage);
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to start session.");
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // TEXT MESSAGE FLOW
    // -----------------------------
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setError("");

        try {
            const res = await api.post(
                `/sessions/${sessionId}/message`,
                { message: userMsg.content }
            );

            const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: cleanReply }
            ]);

            // 🔊 speak the reply
            speakText(cleanReply);

            if (isComplete) {
                setTimeout(() => {
                    endSession();
                }, 3000);
            }

        } catch (error) {
            setError(error.response?.data?.message || "Failed to send message.");
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // 🎤 START RECORDING
    // -----------------------------
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

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

    // -----------------------------
    // ⛔ STOP RECORDING
    // -----------------------------
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    // -----------------------------
    // 📡 SEND AUDIO TO BACKEND
    // -----------------------------
    const sendAudio = async (blob) => {
        if (!sessionId) return;

        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("audio", blob);

            const res = await api.post(
                `/sessions/${sessionId}/voice-message`,
                formData
            );

            // 💬 show user's transcribed text
            if (res.data.userText) {
                setMessages((prev) => [
                    ...prev,
                    { role: "user", content: res.data.userText }
                ]);
            }

            const { isComplete, cleanReply } = checkInterviewComplete(res.data.reply);

            // 💬 show AI text (cleaned)
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: cleanReply }
            ]);

            // 🔊 speak the reply
            speakText(cleanReply);

            if (isComplete) {
                setTimeout(() => {
                    endSession();
                }, 3000);
            }

        } catch (error) {
            setError(error.response?.data?.message || "Voice message failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // TEST AI VOICE
    // -----------------------------
    const testVoice = () => {
        speakText("Hello! This is a voice test from PrepifyAI.");
        setError("✅ Audio played successfully!");
    };

    // -----------------------------
    // END SESSION
    // -----------------------------
    const endSession = async () => {
        if (!sessionId) return;

        try {
            setIsLoading(true);
            await api.patch(`/sessions/${sessionId}/end`);
            alert("Interview ended successfully.");
            navigate("/dashboard");
        } catch (error) {
            setError("Failed to end session.");
        } finally {
            setIsLoading(false);
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50 text-black">

            <header className="mb-4 text-center">
                <h1 className="text-2xl font-bold">Interview Chat</h1>

                {error && (
                    <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {!sessionId ? (
                    <button
                        onClick={startSession}
                        disabled={isLoading}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Start Interview
                    </button>
                ) : (
                    <button
                        onClick={endSession}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
                    >
                        End Interview
                    </button>
                )}
            </header>

            {/* CHAT BOX */}
            <div className="flex-1 overflow-y-auto p-4 bg-white border rounded flex flex-col gap-3">

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[80%] p-3 rounded ${msg.role === "user"
                            ? "bg-blue-100 self-end"
                            : "bg-gray-100 self-start"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}

                {isLoading && (
                    <div className="text-gray-500 italic">
                        AI is thinking...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* INPUT + VOICE CONTROLS */}
            <form onSubmit={sendMessage} className="flex gap-2 mt-3">

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!sessionId || isLoading}
                    className="flex-1 border p-2 rounded"
                    placeholder="Type your answer..."
                />

                {/* TEXT SEND */}
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 bg-blue-600 text-white rounded"
                >
                    Send
                </button>

                {/* TEST VOICE BUTTON */}
                <button
                    type="button"
                    onClick={testVoice}
                    className="px-4 rounded bg-indigo-600 text-white"
                >
                    Test 🔊
                </button>

                {/* 🎤 MIC BUTTON */}
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-4 rounded text-white ${isRecording ? "bg-red-600" : "bg-green-600"}`}
                    disabled={!sessionId}
                >
                    {isRecording ? "Stop 🎙️" : "Speak 🎤"}
                </button>

            </form>
        </div>
    );
};

export default InterviewChat;
