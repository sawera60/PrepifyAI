import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

//Frontend click
// ↓
//google route
// ↓
//Google login page
// ↓
//Google sends user back
// ↓
//google/callback
// ↓
// Passport verifies user
//  ↓
// User created/found i n DB
//  ↓
// JWT generated
// ↓
// Cookie set
// ↓
//Redirect to dashboard
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                // Use GOOGLE_CALLBACK_URL if explicitly set (e.g. during local dev or if you want to pin it).
                // Otherwise fall back to the production backend URL built from env, or a localhost default.
                // ⚠️ Never use a bare relative path like "/api/..." — passport-google-oauth20 needs a full URL.
                callbackURL: process.env.GOOGLE_CALLBACK_URL
                    || (process.env.BACKEND_URL
                        ? `${process.env.BACKEND_URL}/api/auth/google/callback`
                        : "http://localhost:5000/api/auth/google/callback"),
                // Tell Passport to trust the X-Forwarded-Proto header set by Vercel's proxy.
                // This ensures the callback URL resolves as https:// in production.
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
                            authProvider: "google"
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
    console.warn("⚠️ Google OAuth credentials missing. Google Sign-In will not work.");
}

