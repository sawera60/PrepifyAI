import express from "express";
import { signIn, signUp } from "../controllers/auth.controller.js";

const router = express.Router();

// This handles:
router.post("/signup", signUp);  //POST /api/auth/signup 
router.post("/signin", signIn); //POST /api/auth/signin

export default router;
