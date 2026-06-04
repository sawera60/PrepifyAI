import "dotenv/config";
import express from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

import "./config/passport.js";
import connectDB from "./config/db.js";

// routes
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import sessionRouter from "./routes/session.routes.js";

const app = express();
const port = process.env.PORT || 8000;



//Middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// CORS (frontend connection)

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);


// Session (IMPORTANT for Passport Google OAuth)

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // true only in production (HTTPS)
        },
    })
);


// Passport

app.use(passport.initialize());
app.use(passport.session());



// Routes

app.use("/api/auth", userRouter);  // POST Api for signin signup and google auth
app.use("/api/interviews", interviewRouter); //GET Api for mock interview
app.use("/api/sessions", sessionRouter); //POST Api for sessions

app.get("/", (req, res) => {
    res.send("PrepifyAI Backend is running!");
});



// Server Start

const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${port}`);
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();