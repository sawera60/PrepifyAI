import Session from "../models/session.model.js";
import promptBuilder from "../utils/promptBuilder.js";
import { getAIResponse } from "../services/openrouter.js";

// POST /api/sessions/start
export const startSession = async (req, res) => {
    try {
        const { interviewId } = req.body;

        if (!interviewId) {
            return res.status(400).json({ message: "interviewId is required" });
        }

        const session = new Session({
            userId: req.user._id,
            interviewId: interviewId,
            status: "active",
            transcript: [],
        });

        await session.save();
        await session.populate("interviewId");

        // Build messages to get first AI response
        const messages = promptBuilder({
            interview: session.interviewId,
            transcript: [],
        });

        // Get AI response
        const aiReply = await getAIResponse(messages);

        // Save AI message to transcript
        session.transcript.push({
            role: "assistant",
            content: aiReply,
        });

        await session.save();

        return res.status(201).json({
            message: "Session created successfully",
            sessionId: session._id,
            firstMessage: aiReply,
        });

    } catch (error) {
        console.log("Error in startSession:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/sessions/:id/message

export const addMessageToSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { message } = req.body;

        // 1. Get session
        const session = await Session.findById(sessionId).populate("interviewId");

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.status === "completed") {
            return res.status(400).json({
                message: "Cannot send message to completed session",
            });
        }

        // 2. Save user message
        session.transcript.push({
            role: "user",
            content: message,
        });

        // 3. Convert transcript to plain format
        const plainTranscript = session.transcript.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        // 4. Build AI messages
        const messages = promptBuilder({
            interview: session.interviewId,
            transcript: plainTranscript,
        });

        // 5. Get AI response (OPENROUTER)
        const aiReply = await getAIResponse(messages);

        // 6. Save AI message
        session.transcript.push({
            role: "assistant",
            content: aiReply,
        });

        await session.save();

        // 7. Send response
        return res.status(200).json({
            reply: aiReply,
        });

    } catch (error) {
        console.error("Error in addMessageToSession:", error.stack || error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};



// PATCH /api/sessions/:id/end

export const endSession = async (req, res) => {
    try {
        const sessionId = req.params.id;

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        session.status = "completed";

        await session.save();

        return res.status(200).json({
            message: "Session completed successfully",
        });

    } catch (error) {
        console.log("Error in endSession:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};