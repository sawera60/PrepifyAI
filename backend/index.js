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
const port = process.env.PORT || 8000;

// Trust proxy is required for express-session to set secure cookies on Vercel
app.set("trust proxy", 1);

//Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS (frontend connection)
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Passport (stateless — no session needed on Vercel)
app.use(passport.initialize());

// ✅ Per-request DB connection middleware (critical for Vercel serverless)
// On Vercel each request may hit a cold function — we must ensure the DB
// is connected before processing ANY route. The cached readyState check in
// db.js means this is a no-op on warm invocations (no performance cost).
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("❌ DB connection failed on request:", err.message);
        return res.status(500).json({ success: false, message: "Database connection failed" });
    }
});

// Routes
app.use("/api/auth", userRouter);  // POST Api for signin signup and google auth
app.use("/api/interviews", interviewRouter); //GET Api for mock interview
app.use("/api/sessions", sessionRouter); //POST Api for sessions
app.use("/api/users", profileRouter); //GET/PUT/DELETE Api for user profile & settings
app.use("/api/payment", paymentRouter); //POST Api for Stripe payments

app.get("/", (req, res) => {
    res.send("PrepifyAI Backend is running!");
});



// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack || err.message || err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// Local dev server start (skipped on Vercel — DB is handled per-request above)
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(port, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${port}`);
            });
        })
        .catch((err) => {
            console.error("❌ Database connection failed:", err.message);
            process.exit(1);
        });
}

export default app;