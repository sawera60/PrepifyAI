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
        dimensions: {
            communication: { type: Number, min: 0, max: 100 },
            technicalKnowledge: { type: Number, min: 0, max: 100 },
            confidence: { type: Number, min: 0, max: 100 },
            problemSolving: { type: Number, min: 0, max: 100 },
            clarity: { type: Number, min: 0, max: 100 },
        },
    },
    { timestamps: true }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);