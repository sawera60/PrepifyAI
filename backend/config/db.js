import mongoose from "mongoose";
import dns from "dns";

// Only override DNS servers locally, never on Vercel or in production
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
        console.warn("Could not set custom DNS servers, using system defaults:", dnsErr.message);
    }
}

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected");
    } catch (error) {
        console.error("error while connecting", error.message);
        throw error;
    }
};
export default connectDB;