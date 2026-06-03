import express from "express";
import { getMockInterviews, getMyInterviews } from "../controllers/interview.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const interviewRouter = express.Router();

//GET    /api/interviews/mock
interviewRouter.get("/mock", getMockInterviews);
//GET   /api/interviews/mine
interviewRouter.get("/mine", verifyJWT, getMyInterviews);


export default interviewRouter;
