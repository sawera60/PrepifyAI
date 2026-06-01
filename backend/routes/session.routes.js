import express from "express";
import { sessionController } from "../controllers/session.controller.js";

const sessionRouter = express.Router();

//POST   /api/sessions/start
sessionRouter.post("/start", sessionController)


export default sessionRouter;
