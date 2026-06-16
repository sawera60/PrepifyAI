import express from "express";
import passport from "passport";
import { signIn, signUp, refreshToken, logout } from "../controllers/auth.controller.js";
import { generateAccessToken, generateRefreshToken } from "../config/token.js";


const router = express.Router();

//Auth   // This handles:
router.post("/signup", signUp);  //POST /api/auth/signup 
router.post("/signin", signIn); //POST /api/auth/signin
router.post("/refresh", refreshToken);
router.post("/logout", logout);

//Google Auth 
// Step 1: Redirect to Google
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

// Step 2: Google callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login` : "http://localhost:5173/login",
        session: false,
    }),
    (req, res) => {
        // req.user comes from Passport strategy
        const accessToken = generateAccessToken(req.user._id);
        const refreshTokenValue = generateRefreshToken(req.user._id);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/dashboard` : "http://localhost:5173/dashboard");
    }
);

export default router;
