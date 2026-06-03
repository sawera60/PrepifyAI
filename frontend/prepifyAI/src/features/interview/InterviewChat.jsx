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

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const startSession = async () => {
        try {
            setError("");
            setIsLoading(true);
            const res = await api.post(`/sessions/start`, { interviewId });
            setSessionId(res.data.sessionId);
            if (res.data.firstMessage) {
                setMessages([{ role: "assistant", content: res.data.firstMessage }]);
            }
        } catch (error) {
            console.error("Error starting session:", error);
            setError(error.response?.data?.message || "Failed to start session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMsg = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setError("");

        try {
            const res = await api.post(`/sessions/${sessionId}/message`, { message: userMsg.content });
            const aiMsg = { role: "assistant", content: res.data.reply };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Error sending message:", error);
            setError(error.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const endSession = async () => {
        if (!sessionId) return;
        try {
            setIsLoading(true);
            await api.patch(`/sessions/${sessionId}/end`);
            alert("Interview ended successfully.");
            navigate("/dashboard");
        } catch (error) {
            console.error("Error ending session:", error);
            setError(error.response?.data?.message || "Failed to end session.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50 text-black">
            <header className="mb-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Interview Chat</h1>
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded flex justify-between items-center text-sm">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="font-bold text-lg leading-none hover:text-red-900">&times;</button>
                    </div>
                )}
                {!sessionId ? (
                    <button
                        onClick={startSession}
                        disabled={isLoading}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Starting..." : "Start Interview"}
                    </button>
                ) : (
                    <button
                        onClick={endSession}
                        disabled={isLoading}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        End Interview
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-white shadow-sm flex flex-col gap-3">
                {messages.length === 0 && sessionId && (
                    <p className="text-center text-gray-500 mt-10">Session started. Waiting for interviewer...</p>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] rounded p-3 ${msg.role === 'user' ? 'bg-blue-100 self-end text-blue-900' : 'bg-gray-100 self-start text-gray-800'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                ))}
                {isLoading && messages.length > 0 && (
                    <div className="bg-gray-100 self-start text-gray-800 max-w-[80%] rounded p-3 italic text-sm">
                        AI is thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!sessionId || isLoading}
                    placeholder="Type your answer..."
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                />
                <button
                    type="submit"
                    disabled={!sessionId || isLoading || !input.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default InterviewChat;