import express from "express";
import { createCustomInterview, getMockInterviews, getMyInterviews, setupChat, transcribeVoice } from "../controllers/interview.controller.js";
import { uploadResume, createResumeInterview } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
const upload = multer();

const interviewRouter = express.Router();

//GET    /api/interviews/mock
interviewRouter.get("/mock", getMockInterviews);
//GET   /api/interviews/mine
interviewRouter.get("/mine", verifyJWT, getMyInterviews);
interviewRouter.post("/custom/create", verifyJWT, createCustomInterview)
interviewRouter.post("/custom/setup-chat", verifyJWT, setupChat);
interviewRouter.post("/resume/upload", verifyJWT, upload.single("resume"), uploadResume);
interviewRouter.post("/resume/create", verifyJWT, createResumeInterview);
// POST /api/interviews/transcribe — voice transcription for CustomInterviewSetup
interviewRouter.post("/transcribe", verifyJWT, upload.single("audio"), transcribeVoice);


export default interviewRouter;
