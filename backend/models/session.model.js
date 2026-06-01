import mongoose from "mongoose";

//Stores interview session properly.

const transcriptSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const sessionSchema = new mongoose.Schema(
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

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },

        transcript: [transcriptSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
