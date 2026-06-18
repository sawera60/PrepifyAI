import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

// GET /api/users/profile
export const getProfile = async (req, res) => {
    try {
        const user = req.user; // set by verifyJWT
        return res.status(200).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture,
                authProvider: user.authProvider,
                plan: user.plan,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching profile" });
    }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ message: "First name and last name are required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { firstName: firstName.trim(), lastName: lastName.trim() },
            { new: true, select: "-password" }
        );

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                authProvider: updatedUser.authProvider,
                plan: updatedUser.plan,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Error updating profile" });
    }
};

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.user._id);

        if (user.authProvider === "google") {
            return res.status(400).json({ message: "Google accounts cannot change password here" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error changing password" });
    }
};

// DELETE /api/users/account
export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        };
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        res.clearCookie("jwt", cookieOptions);

        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting account" });
    }
};

// PUT /api/users/profile-picture
export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "prepifyAI/avatars", transformation: [{ width: 400, height: 400, crop: "fill" }] },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary Error:", error);
                    return res.status(500).json({ message: "Error uploading image to Cloudinary" });
                }

                const updatedUser = await User.findByIdAndUpdate(
                    req.user._id,
                    { profilePicture: result.secure_url },
                    { new: true, select: "-password" }
                );

                return res.status(200).json({
                    message: "Profile picture updated successfully",
                    user: {
                        _id: updatedUser._id,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        profilePicture: updatedUser.profilePicture,
                        authProvider: updatedUser.authProvider,
                        plan: updatedUser.plan,
                    },
                });
            }
        );

        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error("Profile picture upload error:", error);
        return res.status(500).json({ message: "Error updating profile picture" });
    }
};
