import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Sidebar from "../../features/dashboard/components/Sidebar";
import DashboardHeader from "../../features/dashboard/components/DashboardHeader";
import api from "../../services/api";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Plan Data ────────────────────────────────────────────────────────────────
const plans = [
    {
        id: "free",
        name: "Free",
        badge: null,
        price: "0",
        priceNote: "Forever free",
        description: "Perfect for getting started with AI interview prep.",
        color: "border-white/[0.08]",
        accentColor: "#8B89A0",
        btnClass:
            "bg-[#1A1D2A] border border-white/[0.08] text-[#8B89A0] hover:text-white hover:border-white/20 cursor-default",
        btnLabel: "Current Plan",
        isCurrent: true,
        features: [
            { text: "5 mock interviews / month", included: true },
            { text: "Basic AI feedback", included: true },
            { text: "Standard question bank", included: true },
            { text: "Interview history (7 days)", included: true },
            { text: "Resume-based interviews", included: false },
            { text: "Detailed performance analytics", included: false },
            { text: "Custom interview topics", included: false },
            { text: "Priority support", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        badge: "Most Popular",
        price: "9.99",
        priceNote: "per month",
        description: "For serious candidates who want to ace every interview.",
        color: "border-[#6C63FF]/40",
        accentColor: "#6C63FF",
        btnClass:
            "bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white shadow-lg shadow-[#6C63FF]/25",
        btnLabel: "Upgrade to Pro",
        isCurrent: false,
        features: [
            { text: "Unlimited mock interviews", included: true },
            { text: "Advanced AI feedback", included: true },
            { text: "Premium question bank", included: true },
            { text: "Full interview history", included: true },
            { text: "Resume-based interviews", included: true },
            { text: "Detailed performance analytics", included: true },
            { text: "Custom interview topics", included: true },
            { text: "Priority support", included: true },
        ],
    },
];

// ─── Stripe CardElement Styling ───────────────────────────────────────────────
const cardElementOptions = {
    style: {
        base: {
            fontSize: "14px",
            color: "#ffffff",
            fontFamily: '"DM Sans", system-ui, sans-serif',
            "::placeholder": { color: "#5A5870" },
            iconColor: "#6C63FF",
        },
        invalid: {
            color: "#EF4444",
            iconColor: "#EF4444",
        },
    },
};

// ─── Stripe Payment Modal (Real) ──────────────────────────────────────────────
const StripePaymentForm = ({ onClose, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [step, setStep] = useState("form"); // form | processing | success | failed
    const [errorMsg, setErrorMsg] = useState("");
    const [cardComplete, setCardComplete] = useState(false);

    const handlePay = async () => {
        if (!stripe || !elements) return;
        if (!cardComplete) {
            setErrorMsg("Please enter your card details.");
            return;
        }

        setErrorMsg("");
        setStep("processing");

        try {
            // 1. Create PaymentIntent on backend
            const { data } = await api.post("/payment/create-payment-intent");
            const { clientSecret } = data;

            // 2. Confirm payment with Stripe
            const cardElement = elements.getElement(CardElement);
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                // Payment failed
                setErrorMsg(result.error.message);
                setStep("failed");
                return;
            }

            if (result.paymentIntent.status === "succeeded") {
                // 3. Upgrade user plan on backend (verified server-side)
                await api.post("/payment/upgrade", {
                    paymentIntentId: result.paymentIntent.id,
                });

                setStep("success");
                setTimeout(() => {
                    onSuccess();
                }, 2500);
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || "Payment failed. Please try again.";
            setErrorMsg(msg);
            setStep("failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={step === "form" ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-[#13151F] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div>
                        <h3 className="font-syne font-bold text-white text-base">
                            {step === "success" ? "Payment Successful!" : step === "failed" ? "Payment Failed" : "Complete Payment"}
                        </h3>
                        <p className="text-[#8B89A0] text-xs mt-0.5">
                            {step === "form" && "PrepifyAI Pro — $9.99 / month"}
                            {step === "processing" && "Please wait..."}
                            {step === "success" && "Welcome to PrepifyAI Pro!"}
                            {step === "failed" && "Your payment could not be processed"}
                        </p>
                    </div>
                    {step === "form" && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center text-[#8B89A0] hover:text-white transition-all"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ── FORM STEP ── */}
                {step === "form" && (
                    <div className="p-6 space-y-5">
                        {/* Card preview banner */}
                        <div
                            className="relative h-28 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
                            style={{
                                background: "linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-7 rounded bg-white/20 flex items-center justify-center">
                                    <div className="w-6 h-4 rounded bg-yellow-300/80" />
                                </div>
                                <span className="text-white/80 font-bold text-xs tracking-widest">PREPIFY PRO</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <p className="text-white/60 text-xs font-mono tracking-widest">•••• •••• •••• ••••</p>
                                <p className="text-white font-syne font-bold text-lg">$9.99</p>
                            </div>
                        </div>

                        {/* Test card hint */}
                        <div className="flex items-start gap-2 bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-xl px-3 py-2.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9F9BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <p className="text-[#9F9BFF] text-xs leading-relaxed">
                                <strong>Test mode:</strong> Use <code className="bg-[#6C63FF]/20 px-1 rounded font-mono">4242 4242 4242 4242</code>, any future expiry, any CVC.
                            </p>
                        </div>

                        {/* Stripe CardElement */}
                        <div>
                            <label className="block text-xs text-[#8B89A0] mb-2 font-medium">Card Details</label>
                            <div className="bg-[#1A1D2A] border border-white/[0.08] rounded-xl px-4 py-3.5 focus-within:border-[#6C63FF]/50 transition-all">
                                <CardElement
                                    options={cardElementOptions}
                                    onChange={(e) => {
                                        setCardComplete(e.complete);
                                        if (e.error) {
                                            setErrorMsg(e.error.message);
                                        } else {
                                            setErrorMsg("");
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {errorMsg && (
                            <p className="text-red-400 text-xs flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {errorMsg}
                            </p>
                        )}

                        {/* Pay Button */}
                        <button
                            onClick={handlePay}
                            disabled={!stripe || !cardComplete}
                            className={`w-full font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                !stripe || !cardComplete
                                    ? "bg-[#6C63FF]/30 text-white/50 cursor-not-allowed"
                                    : "bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white shadow-lg shadow-[#6C63FF]/25"
                            }`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Pay $9.99 / month
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-[#5A5870] text-xs">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Secured by Stripe — your card info never touches our servers
                        </div>
                    </div>
                )}

                {/* ── PROCESSING STEP ── */}
                {step === "processing" && (
                    <div className="px-6 py-16 flex flex-col items-center gap-5">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-2 border-[#6C63FF]/20" />
                            <div className="absolute inset-0 rounded-full border-2 border-[#6C63FF] border-t-transparent animate-spin" />
                            <div className="absolute inset-2 rounded-full border-2 border-[#4ECDC4]/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold text-sm">Processing Payment</p>
                            <p className="text-[#8B89A0] text-xs mt-1">Verifying with Stripe...</p>
                        </div>
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SUCCESS STEP ── */}
                {step === "success" && (
                    <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-150" />
                            <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-syne font-bold text-lg">You're now Pro!</p>
                            <p className="text-[#8B89A0] text-sm mt-1">All Pro features are now unlocked.</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[
                                <svg key="mic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
                                <svg key="doc" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                                <svg key="chart" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                                <svg key="bolt" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                            ].map((icon, i) => (
                                <span
                                    key={i}
                                    className="w-9 h-9 rounded-xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center text-[#6C63FF] animate-bounce"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    {icon}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── FAILED STEP ── */}
                {step === "failed" && (
                    <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl scale-150" />
                            <div className="relative w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-syne font-bold text-lg">Payment Failed</p>
                            <p className="text-[#8B89A0] text-sm mt-1">{errorMsg || "Your card was declined. Please try another card."}</p>
                        </div>
                        <button
                            onClick={() => {
                                setStep("form");
                                setErrorMsg("");
                            }}
                            className="mt-2 px-6 py-2.5 bg-[#1A1D2A] border border-white/[0.08] hover:border-white/20 text-white text-sm font-medium rounded-xl transition-all"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onClose}
                            className="text-[#5A5870] text-xs hover:text-[#8B89A0] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Payment Modal Wrapper (provides Stripe context) ──────────────────────────
const PaymentModal = ({ onClose, onSuccess }) => {
    return (
        <Elements stripe={stripePromise}>
            <StripePaymentForm onClose={onClose} onSuccess={onSuccess} />
        </Elements>
    );
};

// ─── Main Payment Page ────────────────────────────────────────────────────────
const PaymentPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentPlan, setCurrentPlan] = useState("free"); // "free" | "pro"
    const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
    const [loadingPlan, setLoadingPlan] = useState(true);

    const yearlyPrice = (9.99 * 12 * 0.7).toFixed(2); // 30% off yearly

    // Fetch the REAL plan from backend on mount (refresh-safe)
    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await api.get("/users/profile");
                setCurrentPlan(res.data.user.plan || "free");
            } catch (err) {
                console.error("Failed to fetch plan:", err);
                setCurrentPlan("free");
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchPlan();
    }, []);

    // After successful payment, refresh the plan from backend
    const handleSuccess = async () => {
        try {
            const res = await api.get("/users/profile");
            setCurrentPlan(res.data.user.plan || "free");
        } catch (err) {
            // Payment succeeded but profile fetch failed — set pro optimistically
            setCurrentPlan("pro");
        }
        setShowModal(false);
    };

    return (
        <div className="font-dm min-h-screen bg-[#0B0D14] flex">
            <Sidebar
                mobileOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <div className="flex-1 min-h-screen lg:ml-[264px]">
                <DashboardHeader onMenuToggle={() => setMobileMenuOpen(true)} />

                <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                    {/* ── Page Header ── */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#9F9BFF] text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] inline-block animate-pulse" />
                            Pricing
                        </div>
                        <h1 className="font-syne text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                            Payment & Plans
                        </h1>
                        <p className="text-[#8B89A0] text-sm">
                            Choose the plan that fits your goals. Upgrade or downgrade anytime.
                        </p>
                    </div>

                    {/* ── Loading State ── */}
                    {loadingPlan && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!loadingPlan && (
                        <>
                            {/* ── Current Plan Banner ── */}
                            {currentPlan === "pro" && (
                                <div className="mb-8 relative overflow-hidden rounded-2xl border border-[#6C63FF]/30 bg-gradient-to-r from-[#6C63FF]/10 via-[#13151F] to-[#4ECDC4]/10 p-5 flex items-center gap-4">
                                    <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#6C63FF] opacity-[0.07] blur-3xl" />
                                    <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center shrink-0">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm">You're on the Pro Plan</p>
                                        <p className="text-[#8B89A0] text-xs mt-0.5">All features unlocked.</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-[#9F9BFF] text-xs font-bold">
                                        Active
                                    </span>
                                </div>
                            )}

                            {/* ── Billing Toggle ── */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="flex items-center gap-1 bg-[#13151F] border border-white/[0.06] rounded-xl p-1">
                                    {["monthly", "yearly"].map((cycle) => (
                                        <button
                                            key={cycle}
                                            onClick={() => setBillingCycle(cycle)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${billingCycle === cycle
                                                ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"
                                                : "text-[#8B89A0] hover:text-white"
                                                }`}
                                        >
                                            {cycle === "monthly" ? "Monthly" : "Yearly"}
                                            {cycle === "yearly" && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                                    -30%
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Plan Cards ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-10">
                                {plans.map((plan) => {
                                    const isCurrentPlan = currentPlan === plan.id;
                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-2xl border ${isCurrentPlan && plan.id === "pro" ? "border-[#6C63FF]/60" : plan.color} bg-[#13151F] p-4 sm:p-6 flex flex-col transition-all duration-200 ${plan.id === "pro" ? "shadow-xl shadow-[#6C63FF]/10" : ""}`}
                                        >
                                            {/* Glow for pro */}
                                            {plan.id === "pro" && (
                                                <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#6C63FF] opacity-[0.06] blur-3xl" />
                                            )}

                                            {/* Badge */}
                                            {plan.badge && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] text-white text-[10px] sm:text-xs font-bold shadow-lg shadow-[#6C63FF]/30 flex items-center gap-1 whitespace-nowrap">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                                        {plan.badge}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="relative z-10">
                                                {/* Plan name */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-[#8B89A0] text-xs font-semibold uppercase tracking-widest mb-1">
                                                            {plan.name}
                                                        </p>
                                                        <div className="flex items-end gap-1.5">
                                                            <span className="font-syne text-2xl sm:text-3xl font-bold text-white">
                                                                ${billingCycle === "yearly" && plan.id === "pro" ? (parseFloat(yearlyPrice) / 12).toFixed(2) : plan.price}
                                                            </span>
                                                            {plan.price !== "0" && (
                                                                <span className="text-[#8B89A0] text-sm mb-1">/mo</span>
                                                            )}
                                                        </div>
                                                        {billingCycle === "yearly" && plan.id === "pro" && (
                                                            <p className="text-emerald-400 text-xs mt-0.5">
                                                                Billed as ${yearlyPrice}/year
                                                            </p>
                                                        )}
                                                        <p className="text-[#5A5870] text-xs mt-0.5">{plan.priceNote}</p>
                                                    </div>
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                        style={{ background: `${plan.accentColor}15`, border: `1px solid ${plan.accentColor}30` }}
                                                    >
                                                        {plan.id === "free" ? (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-[#8B89A0] text-xs mb-5">{plan.description}</p>

                                                {/* CTA */}
                                                <button
                                                    onClick={() => {
                                                        if (plan.id === "pro" && currentPlan !== "pro") setShowModal(true);
                                                    }}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-5 ${isCurrentPlan
                                                        ? "bg-[#1A1D2A] border border-white/[0.08] text-[#8B89A0] cursor-default"
                                                        : plan.id === "pro"
                                                            ? plan.btnClass
                                                            : "bg-[#1A1D2A] border border-white/[0.08] text-[#8B89A0] cursor-default"
                                                        }`}
                                                >
                                                    {isCurrentPlan ? (
                                                        <span className="flex items-center justify-center gap-1.5">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                            Current Plan
                                                        </span>
                                                    ) : plan.btnLabel}
                                                </button>

                                                {/* Divider */}
                                                <div className="h-px bg-white/[0.05] mb-4" />

                                                {/* Features */}
                                                <ul className="space-y-2.5">
                                                    {plan.features.map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-2.5">
                                                            {feature.included ? (
                                                                <div
                                                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                                                    style={{ background: `${plan.accentColor}20` }}
                                                                >
                                                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                                        <polyline points="2 6 5 9 10 3" stroke={plan.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                                                                    <svg width="6" height="6" viewBox="0 0 12 12" fill="none">
                                                                        <line x1="2" y1="2" x2="10" y2="10" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" />
                                                                        <line x1="10" y1="2" x2="2" y2="10" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <span className={`text-xs ${feature.included ? "text-[#C8C6E0]" : "text-[#5A5870] line-through"}`}>
                                                                {feature.text}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Feature Comparison ── */}
                            <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl overflow-hidden mb-8">
                                <div className="px-6 py-4 border-b border-white/[0.06]">
                                    <h2 className="font-syne font-bold text-white text-base">Feature Comparison</h2>
                                    <p className="text-[#8B89A0] text-xs mt-0.5">See exactly what's included in each plan</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[420px]">
                                        <thead>
                                            <tr className="border-b border-white/[0.04]">
                                                <th className="px-3 sm:px-6 py-3 text-left text-[#8B89A0] text-xs font-semibold uppercase tracking-wider">Feature</th>
                                                <th className="px-3 sm:px-6 py-3 text-center text-[#8B89A0] text-xs font-semibold uppercase tracking-wider">Free</th>
                                                <th className="px-3 sm:px-6 py-3 text-center text-[#9F9BFF] text-xs font-semibold uppercase tracking-wider">Pro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {[
                                                { feature: "Mock Interviews", free: "5 / month", pro: "Unlimited" },
                                                { feature: "AI Feedback", free: "Basic", pro: "Advanced" },
                                                { feature: "Question Bank", free: "Standard", pro: "Premium" },
                                                { feature: "Interview History", free: "7 days", pro: "Unlimited" },
                                                { feature: "Resume Analysis", free: false, pro: true },
                                                { feature: "Performance Analytics", free: false, pro: true },
                                                { feature: "Custom Topics", free: false, pro: true },
                                                { feature: "Priority Support", free: false, pro: true },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-3 text-[#C8C6E0] text-xs">{row.feature}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        {typeof row.free === "string" ? (
                                                            <span className="text-[#8B89A0] text-xs">{row.free}</span>
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="mx-auto">
                                                                <line x1="2" y1="2" x2="10" y2="10" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" />
                                                                <line x1="10" y1="2" x2="2" y2="10" stroke="#5A5870" strokeWidth="2" strokeLinecap="round" />
                                                            </svg>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 text-center">
                                                        {typeof row.pro === "string" ? (
                                                            <span className="text-[#9F9BFF] text-xs font-semibold">{row.pro}</span>
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="mx-auto">
                                                                <polyline points="2 6 5 9 10 3" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── FAQ ── */}
                            <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl p-6 mb-8">
                                <h2 className="font-syne font-bold text-white text-base mb-5">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {[
                                        {
                                            q: "Can I cancel anytime?",
                                            a: "Yes! You can cancel your Pro subscription at any time. You'll retain Pro access until the end of your billing period.",
                                        },
                                        {
                                            q: "Is my payment information secure?",
                                            a: "Absolutely. We use Stripe for payment processing — your card details never touch our servers.",
                                        },
                                        {
                                            q: "What happens when I upgrade?",
                                            a: "Your plan is upgraded instantly. All Pro features become available immediately after a successful payment.",
                                        },
                                        {
                                            q: "Do you offer refunds?",
                                            a: "We offer a 7-day money-back guarantee if you're not satisfied with the Pro plan.",
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="border-b border-white/[0.04] pb-4 last:border-0 last:pb-0">
                                            <p className="text-white text-sm font-medium mb-1.5">{item.q}</p>
                                            <p className="text-[#8B89A0] text-xs leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Bottom CTA ── */}
                            {currentPlan === "free" && (
                                <div className="relative overflow-hidden rounded-2xl border border-[#6C63FF]/30 bg-gradient-to-br from-[#6C63FF]/10 via-[#13151F] to-[#4ECDC4]/10 p-8 text-center">
                                    <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#6C63FF] opacity-[0.06] blur-3xl" />
                                    <div className="relative z-10">
                                        <div className="mb-3 flex justify-center">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                            </svg>
                                        </div>
                                        <h3 className="font-syne font-bold text-white text-xl mb-2">
                                            Ready to ace your interviews?
                                        </h3>
                                        <p className="text-[#8B89A0] text-sm mb-5 max-w-sm mx-auto">
                                            Join thousands of candidates who upgraded their prep with PrepifyAI Pro.
                                        </p>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-200 shadow-lg shadow-[#6C63FF]/25"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                            Upgrade to Pro — $9.99/mo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <PaymentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default PaymentPage;
