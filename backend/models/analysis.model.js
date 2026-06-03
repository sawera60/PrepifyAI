import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        feedback: {
            type: String,
            required: true,
        },
        strengths: {
            type: [String],
            default: [],
        },
        weaknesses: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);