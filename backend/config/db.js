import mongoose from "mongoose";
import dns from "dns";

// Only override DNS locally (Windows DNS fix). Never on Vercel/production.
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
        console.warn("Could not override DNS servers:", e.message);
    }
}

const connectDB = async () => {
    // Reuse existing connection if alive (critical for Vercel warm invocations)
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 8000, // Fail fast — don't hang Vercel for 30s
        socketTimeoutMS: 10000,
    });
    console.log("✅ Database connected");
};

export default connectDB;