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