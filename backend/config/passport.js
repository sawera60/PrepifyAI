import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                // GOOGLE_CALLBACK_URL must be set in Vercel env vars to your production backend URL.
                // Example: https://prepifyai-backend.vercel.app/api/auth/google/callback
                // Locally falls back to localhost. Never use a relative path here.
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
                // Trust Vercel's X-Forwarded-Proto so the callback resolves as https://
                proxy: true,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile?.emails?.[0]?.value;
                    if (!email) {
                        return done(new Error("No email returned from Google"), null);
                    }

                    let user = await User.findOne({ email });

                    if (!user) {
                        user = await User.create({
                            firstName: profile.name?.givenName || profile.displayName || "Google",
                            lastName: profile.name?.familyName || "User",
                            email,
                            password: null,
                            profilePicture: profile.photos?.[0]?.value || "",
                            authProvider: "google",
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing — Google Sign-In disabled.");
}
