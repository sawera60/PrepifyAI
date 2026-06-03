import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: ["mock", "custom"],
            default: "mock",
        },

        category: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Easy",
        },
        experinece: {
            type: String,
            enum: ["Junior", "Mid", "Senior"]
        },
        techStack: [
            {
                type: String,

            }
        ],
        generatedFrom: {
            type: String,
            enum: ["mock", "custom", "resume"]
        },

        questions: [
            {
                type: String,
            },
        ],

        isPublic: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Interview = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);

export default Interview;