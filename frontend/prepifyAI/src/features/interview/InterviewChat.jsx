import React from "react";
import { useState } from "react";
const InterviewChat = () => {
    const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [sessionId, setSessionId] = useState(null);
    return (
        <div>
            <h1>Interview Chat</h1>
        </div>
    );
};

export default InterviewChat;