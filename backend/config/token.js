import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        return token;

    } catch (error) {
        throw new Error("Error generating token");
    }
};