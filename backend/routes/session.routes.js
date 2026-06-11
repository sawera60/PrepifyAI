import express from "express";
import multer from "multer";

import {
    startSession,
    addMessageToSession,
    endSession,
    voiceMessageToSession,
    testVoiceMessage,
    getSessionAnalysis,
} from "../controllers/session.controller.js";
import { textToSpeech } from "../services/elevenlabs.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const sessionRouter = express.Router();
const upload = multer();

// Protect all routes
sessionRouter.use(verifyJWT);

// GET /api/sessions/:id/analysis
sessionRouter.get("/:id/analysis", getSessionAnalysis);

// POST /api/sessions/start
sessionRouter.post("/start", startSession);

// POST /api/sessions/:id/message
sessionRouter.post("/:id/message", addMessageToSession);

// PATCH /api/sessions/:id/end
sessionRouter.patch("/:id/end", endSession);

// GET /api/sessions/test-tts-direct
sessionRouter.get("/test-tts-direct", async (req, res) => {
    try {
        const audio = await textToSpeech("Hello! Can you hear me? This is a voice test.");
        res.json({
            audio,
            audioIsNull: audio === null,
            audioLength: audio?.length,
        });
    } catch (err) {
        res.json({ error: err.message, stack: err.stack });
    }
});

// POST /api/sessions/:id/voice-message
sessionRouter.post(
    "/:id/voice-message",
    upload.single("audio"),
    voiceMessageToSession
);

// POST /api/sessions/:id/voice-message-test
sessionRouter.post("/:id/voice-message-test", testVoiceMessage);

export default sessionRouter;