import express from "express";
import { getMockInterviews, getMyInterviews } from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

//GET    /api/interviews/mock
interviewRouter.get("/mock", getMockInterviews);
//GET   /api/interviews/mine
interviewRouter.get("/mine", getMyInterviews)


export default interviewRouter;
