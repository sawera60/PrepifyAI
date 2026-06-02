import express from "express";
import { startSession, addMessageToSession, endSession } from "../controllers/session.controller.js";

const sessionRouter = express.Router();

// POST /api/sessions/start
sessionRouter.post("/start", startSession);

// POST /api/sessions/:id/message
sessionRouter.post("/:id/message", addMessageToSession);

// PATCH /api/sessions/:id/end
sessionRouter.patch("/:id/end", endSession);

export default sessionRouter;
