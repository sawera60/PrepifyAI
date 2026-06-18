import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile, changePassword, deleteAccount, updateProfilePicture } from "../controllers/user.controller.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// All routes require authentication
router.get("/profile", verifyJWT, getProfile);           // GET  /api/users/profile
router.put("/profile", verifyJWT, updateProfile);         // PUT  /api/users/profile
router.put("/change-password", verifyJWT, changePassword);// PUT  /api/users/change-password
router.delete("/account", verifyJWT, deleteAccount);      // DELETE /api/users/account
router.put("/profile-picture", verifyJWT, upload.single("image"), updateProfilePicture); // PUT /api/users/profile-picture

export default router;
