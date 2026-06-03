import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "15m" }
        );
        return token;
    } catch (error) {
        throw new Error("Error generating access token");
    }
};

export const generateRefreshToken = (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET_KEY || process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );
        return token;
    } catch (error) {
        throw new Error("Error generating refresh token");
    }
};