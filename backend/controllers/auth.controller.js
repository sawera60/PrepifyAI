import { generateToken } from "../config/token.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

export const signUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // 1. Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check existing user
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Password match check
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Create user FIRST
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        // 6. Generate token using created user id
        const token = generateToken(user._id);

        // 7. Set cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // 8. Send response
        return res.status(201).json({
            message: "User created successfully and assigned cookie",
            user,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};