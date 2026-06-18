import "dotenv/config";
import express from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./config/passport.js";
import connectDB from "./config/db.js";

// routes
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import sessionRouter from "./routes/session.routes.js";
import profileRouter from "./routes/profile.routes.js";
import paymentRouter from "./routes/payment.routes.js";

const app = express();
const port = process.env.PORT || 5000;

// Trust Vercel's proxy so secure cookies and https:// work correctly
app.set("trust proxy", 1);

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Passport (stateless JWT — no session)
app.use(passport.initialize());

// ─── DB Connection Middleware ────────────────────────────────────────────────
// On Vercel every cold-start needs a fresh DB connection.
// SKIP for GET /api/auth/google — that route just redirects to Google and does
// NOT touch the database. Blocking it on a DB connection causes crashes.
// All other routes (including the OAuth callback) DO need the DB.
app.use(async (req, res, next) => {
    // Pure OAuth redirect — no DB needed, skip
    if (req.method === "GET" && req.path === "/api/auth/google") {
        return next();
    }
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("❌ DB connection failed:", err.message);
        return res.status(500).json({ success: false, message: "Database unavailable. Please try again." });
    }
});
// ────────────────────────────────────────────────────────────────────────────

// Routes
app.use("/api/auth", userRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", profileRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
    res.send("PrepifyAI Backend is running!");
});

// Global error handler — catches anything that slips through
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack || err.message || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// ─── Local Dev Server ────────────────────────────────────────────────────────
// Vercel does NOT call this — it imports `app` directly.
// Locally, we connect to DB first then start listening.
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(port, "0.0.0.0", () => {
                console.log(`🚀 Server running on port ${port}`);
            });
        })
        .catch((err) => {
            console.error("❌ Database connection failed:", err.message);
            process.exit(1);
        });
}

export default app;