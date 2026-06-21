import express from "express";
import multer from "multer";

import {
    startSession,
    addMessageToSession,
    endSession,
    voiceMessageToSession,
    getSessionAnalysis, getMySessions
} from "../controllers/session.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const sessionRouter = express.Router();
const upload = multer();

// Protect all routes
sessionRouter.use(verifyJWT);

sessionRouter.get("/my-sessions", getMySessions);
// GET /api/sessions/:id/analysis
sessionRouter.get("/:id/analysis", getSessionAnalysis);

// POST /api/sessions/start
sessionRouter.post("/start", startSession);

// POST /api/sessions/:id/message
sessionRouter.post("/:id/message", addMessageToSession);

// PATCH /api/sessions/:id/end
sessionRouter.patch("/:id/end", endSession);


// POST /api/sessions/:id/voice-message
sessionRouter.post(
    "/:id/voice-message",
    upload.single("audio"),
    voiceMessageToSession
);


export default sessionRouter;