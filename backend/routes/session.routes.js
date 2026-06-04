import express from "express";
import multer from "multer";

import {
    startSession,
    addMessageToSession,
    endSession,
    voiceMessageToSession
} from "../controllers/session.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const sessionRouter = express.Router();
const upload = multer();

// Protect all routes
sessionRouter.use(verifyJWT);

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