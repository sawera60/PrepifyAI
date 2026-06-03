import "dotenv/config";
import Interview from "../models/interview.model.js";
import connectDB from "../config/db.js";

const seedInterviews = async () => {
    try {
        // 1. Connect DB
        await connectDB();

        // 2. Clear old data
        await Interview.deleteMany();
        console.log("Old interviews removed");

        // 3. Mock data
        const interviews = [
            {
                title: "Frontend React Interview",
                category: "Frontend",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What is Virtual DOM?",
                    "Explain useEffect hook.",
                    "What is state in React?",
                ],
            },
            {
                title: "Backend Node.js Interview",
                category: "Backend",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What is Express middleware?",
                    "What is JWT?",
                    "What is REST API?",
                ],
            },
            {
                title: "Behavioral Interview",
                category: "Behavioral",
                type: "mock",
                difficulty: "Easy",
                isPublic: true,
                questions: [
                    "Tell me about yourself.",
                    "Describe a challenge you faced.",
                ],
            },
            {
                title: "System Design Interview",
                category: "System Design",
                type: "mock",
                difficulty: "Hard",
                isPublic: true,
                questions: [
                    "Design a URL shortener.",
                    "How would you scale Instagram?",
                ],
            },
        ];

        // 4. Insert into DB
        await Interview.insertMany(interviews);
        console.log("Database seeded successfully");

        // 5. Exit
        process.exit();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedInterviews();