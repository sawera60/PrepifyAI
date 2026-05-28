import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cors());
app.listen(port, () => {
    connectDB();
    console.log("server is running on", port)
})

//openrouter_api_key= "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"