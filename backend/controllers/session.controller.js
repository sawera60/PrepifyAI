import Session from "../models/session.model.js";
import promptBuilder from "../utils/promptBuilder.js";
import { getAIResponse } from "../services/openrouter.js";
import { transcribeAudio } from "../services/deepgram.js";
import { auraTextToSpeech } from "../services/deepgramTTS.js";
import { Analysis } from "../models/analysis.model.js";
import { generateAnalysis } from "../services/generateAnalysis.js";

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

        // 1. Get session with interview populated (needed for analysis context)
        const session = await Session.findById(sessionId).populate("interviewId");

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // 2. Mark session as completed
        session.status = "completed";
        await session.save();

        // 3. Generate analysis in background (don't block the response)
        generateAnalysis({
            transcript: session.transcript,
            interview: session.interviewId,
        })
            .then(async (result) => {
                const analysis = new Analysis({
                    userId: session.userId,
                    interviewId: session.interviewId._id,
                    sessionId: session._id,
                    score: result.score,
                    feedback: result.feedback,
                    strengths: result.strengths,
                    weaknesses: result.weaknesses,
                    dimensions: result.dimensions,
                });
                await analysis.save();
                console.log("✅ Analysis saved for session:", sessionId);
            })
            .catch((err) => {
                console.error("❌ Analysis generation failed:", err.message);
            });

        // 4. Respond immediately — don't make user wait for analysis
        return res.status(200).json({
            message: "Session completed successfully",
            sessionId,
        });

    } catch (error) {
        console.log("Error in endSession:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const voiceMessageToSession = async (req, res) => {
    try {
        const sessionId = req.params.id;

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

        // 2. Audio buffer from multer
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: "No audio file received" });
        }
        const audioBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || "audio/webm";
        console.log(`📥 Voice message received — size: ${audioBuffer.length} bytes, mimetype: ${mimeType}`);

        if (audioBuffer.length < 100) {
            return res.status(400).json({ message: "Audio too short — please speak for at least 1 second" });
        }

        // 3. Speech → Text (Deepgram)
        const userText = await transcribeAudio(audioBuffer, mimeType);

        if (!userText || !userText.trim()) {
            return res.status(400).json({ message: "Could not transcribe audio. Please speak clearly and try again." });
        }

        // 4. Save user message
        session.transcript.push({
            role: "user",
            content: userText,
        });

        // 5. Build prompt (same as text flow)
        const plainTranscript = session.transcript.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        const messages = promptBuilder({
            interview: session.interviewId,
            transcript: plainTranscript,
        });

        // 6. AI response
        const aiReply = await getAIResponse(messages);

        // 7. Save AI message
        session.transcript.push({
            role: "assistant",
            content: aiReply,
        });

    
        const audioBase64 = await auraTextToSpeech(aiReply);; 

        await session.save();

        // 9. Response
        return res.status(200).json({
            userText: userText,
            reply: aiReply,
            audio: audioBase64,
        });

    } catch (error) {
        console.error("Error in voiceMessageToSession:", error?.response?.data || error);
        return res.status(error?.response?.status || 500).json({
            message: error?.response?.data?.message || error?.message || "Internal server error",
        });
    }
};

export const testVoiceMessage = async (req, res) => {
    try {
        const audio = await textToSpeech("Hello! This is a voice test from PrepifyAI.");
        res.json({ audio, audioLength: audio?.length ?? 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/sessions/:id/analysis
export const getSessionAnalysis = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const analysis = await Analysis.findOne({ sessionId }).populate("interviewId");

        if (!analysis) {
            return res.status(404).json({ message: "Analysis not found yet. It might be generating in the background." });
        }

        return res.status(200).json(analysis);
    } catch (error) {
        console.error("Error in getSessionAnalysis:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET /api/sessions/my-sessions
export const getMySessions = async (req, res) => {
    try {
        // Get all analyses for this user, newest first
        const analyses = await Analysis.find({ userId: req.user._id })
            .populate("interviewId", "title difficulty category generatedFrom")
            .sort({ createdAt: -1 });

        return res.status(200).json({ analyses });

    } catch (error) {
        console.error("Error in getMySessions:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};