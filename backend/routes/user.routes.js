import express from "express";
import passport from "passport";
import { signIn, signUp } from "../controllers/auth.controller.js";
import { generateToken } from "../config/token.js";


const router = express.Router();

//Auth   // This handles:
router.post("/signup", signUp);  //POST /api/auth/signup 
router.post("/signin", signIn); //POST /api/auth/signin

//Google Auth 
// Step 1: Redirect to Google
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

// Step 2: Google callback
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:5173/signin",
        session: false,
    }),
    (req, res) => {
        // req.user comes from Passport strategy
        const token = generateToken(req.user._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect("http://localhost:5173/dashboard");
    }
);

export default router;
