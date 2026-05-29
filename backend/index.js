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

