import express from "express";
import Stripe from "stripe";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-payment-intent
// Creates a Stripe PaymentIntent for $9.99 (Pro plan)
router.post("/create-payment-intent", verifyJWT, async (req, res) => {
    try {
        // Don't allow if user is already pro
        if (req.user.plan === "pro") {
            return res.status(400).json({ error: "You are already on the Pro plan." });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 999, // $9.99 in cents
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: req.user._id.toString(),
                plan: "pro",
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe PaymentIntent error:", error.message);
        res.status(500).json({ error: "Failed to create payment intent." });
    }
});

// POST /api/payment/upgrade
// Upgrades user plan to "pro" after successful payment
router.post("/upgrade", verifyJWT, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: "Payment intent ID is required." });
        }

        // Verify the payment was actually successful with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment has not been completed." });
        }

        // Verify the payment was for this user
        if (paymentIntent.metadata.userId !== req.user._id.toString()) {
            return res.status(403).json({ error: "Payment does not belong to this user." });
        }

        // Upgrade the user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { plan: "pro" },
            { new: true, select: "-password" }
        );

        res.json({
            success: true,
            message: "Upgraded to Pro!",
            plan: user.plan,
        });
    } catch (error) {
        console.error("Upgrade error:", error.message);
        res.status(500).json({ error: "Failed to upgrade plan." });
    }
});

// GET /api/payment/plan
// Returns current user's plan (quick check)
router.get("/plan", verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("plan");
        res.json({ plan: user.plan });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch plan." });
    }
});

export default router;
