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
                title: "React Developer",
                category: "Frontend",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What is the Virtual DOM and how does React use it to optimize performance?",
                    "Explain the difference between useEffect and useLayoutEffect.",
                    "How does state management work in React, and when would you use Context API vs Redux?",
                    "What are higher-order components (HOCs) and custom hooks? Give an example of each.",
                    "Explain React's reconciliation process.",
                    "How do you handle error boundaries in React?",
                    "What are React portals and when should you use them?",
                    "Describe the concept of strict mode in React."
                ],
            },
            {
                title: "Node.js Developer",
                category: "Backend",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "Explain the event loop in Node.js.",
                    "What is the difference between process.nextTick() and setImmediate()?",
                    "How does Express middleware work?",
                    "Explain the concept of streams in Node.js and their types.",
                    "How do you handle authentication and authorization using JWT?",
                    "What is a REST API and what are its core principles?",
                    "How can you prevent common security vulnerabilities like SQL injection and XSS in Node.js?",
                    "Describe how you would cluster a Node.js application for better performance.",
                    "What are memory leaks in Node.js and how do you profile them?"
                ],
            },
            {
                title: "UI/UX Designer",
                category: "Design",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What is the difference between UI and UX?",
                    "Can you walk me through your typical design process from concept to handoff?",
                    "How do you conduct user research and incorporate feedback into your designs?",
                    "What are wireframes, mockups, and prototypes? When do you use each?",
                    "Explain the concept of accessibility in design. How do you ensure your designs are accessible?",
                    "Describe a time you had to balance business goals with user needs."
                ],
            },
            {
                title: "Accountant",
                category: "Finance",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What are the three main financial statements and how do they connect?",
                    "Explain the difference between accounts receivable and accounts payable.",
                    "What is working capital and why is it important?",
                    "How do you handle depreciation and amortization?",
                    "Describe the matching principle in accounting."
                ],
            },
            {
                title: "PHP Developer",
                category: "Backend",
                type: "mock",
                difficulty: "Medium",
                isPublic: true,
                questions: [
                    "What are the different types of errors in PHP?",
                    "Explain the difference between include and require.",
                    "How does dependency injection work in PHP frameworks like Laravel?",
                    "What are PSR standards and why are they important?",
                    "Explain traits in PHP and how they differ from interfaces.",
                    "How do you prevent Cross-Site Request Forgery (CSRF) in a PHP application?",
                    "What is the difference between single quotes and double quotes in PHP?"
                ],
            },
            {
                title: "Machine Learning",
                category: "Data Science",
                type: "mock",
                difficulty: "Hard",
                isPublic: true,
                questions: [
                    "What is the difference between supervised, unsupervised, and reinforcement learning?",
                    "Explain overfitting and underfitting. How do you prevent them?",
                    "What are the differences between L1 (Lasso) and L2 (Ridge) regularization?",
                    "Describe the bias-variance tradeoff.",
                    "How do you evaluate a classification model vs a regression model?",
                    "Explain how a Random Forest algorithm works.",
                    "What is cross-validation and why is it necessary?",
                    "How do you handle missing or imbalanced data in a dataset?",
                    "Explain gradient descent and its variants (SGD, Mini-batch, etc.).",
                    "What is the curse of dimensionality?"
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