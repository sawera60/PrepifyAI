import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,

    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false,
    },

    profilePicture: {
        type: String,
        default: "",
    },
    authProvider: {
        type: String,
        enum: ["self", "google"],
        default: "self",
        required: true,
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    }
}, { timestamps: true });
export const User = mongoose.model("User", userSchema)
