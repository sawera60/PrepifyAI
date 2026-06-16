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



// Routes

app.use("/api/auth", userRouter);  // POST Api for signin signup and google auth
app.use("/api/interviews", interviewRouter); //GET Api for mock interview
app.use("/api/sessions", sessionRouter); //POST Api for sessions
app.use("/api/users", profileRouter); //GET/PUT/DELETE Api for user profile & settings

app.get("/", (req, res) => {
    res.send("PrepifyAI Backend is running!");
});



// Server Start

const startServer = async () => {
    try {
        await connectDB();

        // Only call app.listen if not running on Vercel
        if (!process.env.VERCEL) {
            app.listen(port, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${port}`);
            });
        }
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();

export default app;