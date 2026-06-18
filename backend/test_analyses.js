import "dotenv/config";
import connectDB from "./config/db.js";
import { Analysis } from "./models/analysis.model.js";
import Interview from "./models/interview.model.js"; // Import missing schema!

async function test() {
    try {
        await connectDB();
        console.log("Connected to DB.");
        const analyses = await Analysis.find().populate("interviewId");
        console.log("Analyses count:", analyses.length);
        if (analyses.length > 0) {
            console.log("First analysis:", JSON.stringify(analyses[0], null, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
test();
