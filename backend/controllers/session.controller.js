import Session from "../models/session.model.js";
import promptBuilder from "../utils/promptBuilder.js";
import { getOpenAIResponse } from "../services/openai.js";

// POST /api/sessions/:id/message
export const sessionController = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { message } = req.body;

        // 1. Get session
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // 2. Add user message to transcript
        session.transcript.push({
            role: "user",
            content: message,
        });

        // 3. Build messages for OpenAI
        const messages = promptBuilder({
            interview: session.interviewId,
            transcript: session.transcript,
        });

        // 4. Get AI response
        const aiReply = await getOpenAIResponse(messages);

        // 5. Save AI response
        session.transcript.push({
            role: "assistant",
            content: aiReply,
        });

        await session.save();

        // 6. Send response
        return res.status(200).json({
            reply: aiReply,
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};