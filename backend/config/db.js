import mongoose from "mongoose";
import dns from "dns";

// Set public DNS servers to resolve MongoDB SRV records reliably, especially on Windows environments
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
    console.warn("Could not set custom DNS servers, using system defaults:", dnsErr.message);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected");
    } catch (error) {
        console.error("error while connecting", error.message);
        throw error;
    }
};
export default connectDB;