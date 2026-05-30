import "dotenv/config";
import express from "express";
import passport from "passport";
import "./config/passport.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import router from "./routes/user.routes.js";
import session from "express-session";

const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false, }));
app.use(passport.initialize());
app.use(passport.session());


// POST Api for signin signup and google auth
app.use('/api/auth', router)



const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

startServer();