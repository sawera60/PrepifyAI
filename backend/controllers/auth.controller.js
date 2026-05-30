import { generateToken } from "../config/token.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

// SIGNUP
export const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check existing user
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Remove password before sending response
        const safeUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
        };

        return res.status(201).json({
            message: "User created successfully",
            user: safeUser,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// SIGNIN
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordMatch = await bcrypt.compare(password, findUser.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken(findUser._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const safeUser = {
            _id: findUser._id,
            firstName: findUser.firstName,
            lastName: findUser.lastName,
            email: findUser.email,
            profilePicture: findUser.profilePicture,
        };

        return res.status(200).json({
            message: "User signed in successfully",
            user: safeUser,
        });

    } catch (error) {
        return res.status(500).json({ message: "Error in sign in" });
    }
};