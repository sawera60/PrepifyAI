import express from "express";
import { startSession, addMessageToSession, endSession } from "../controllers/session.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const sessionRouter = express.Router();

// Protect all routes with verifyJWT
sessionRouter.use(verifyJWT);

// POST /api/sessions/start
sessionRouter.post("/start", startSession);

// POST /api/sessions/:id/message
sessionRouter.post("/:id/message", addMessageToSession);

// PATCH /api/sessions/:id/end
sessionRouter.patch("/:id/end", endSession);

export default sessionRouter;
