import { useState, useContext  } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import contextApi from "../../context/contextApi.jsx";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";
import AnimatedBackground from "./components/AnimatedBackground";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    const { serverUrl } = useContext(contextApi);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(
                `/auth/signin`,
                formData
            );
            toast.success(res.data.message || "Logged in successfully");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Server error");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        window.location.href = `${serverUrl}/api/auth/google`;
    };
    return (
        <>


            <div className="font-dm min-h-screen bg-[#0B0D14] flex items-center justify-center px-4 py-8 relative overflow-hidden">
                
                <AnimatedBackground />

                <div className="relative z-20 w-full max-w-md bg-[#13151F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">


                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center flex-shrink-0">
                            <img src={logo} alt="logo" />
                        </div>
                        <span className="font-syne text-[15px] font-bold tracking-tight text-white">
                            Prepify<span className="text-[#6C63FF]">AI</span>
                        </span>
                    </div>


                    <div className="mb-5">
                        <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#9F9BFF] text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] inline-block" />
                            Welcome Back
                        </div>
                        <h2 className="font-syne text-2xl font-bold text-white tracking-tight leading-snug">
                            Sign in to your account
                        </h2>
                        <p className="text-[#8B89A0] text-sm mt-1.5 leading-relaxed">
                            Continue your interview prep and track your progress.
                        </p>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-3">

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-[11px] font-medium text-[#8B89A0] uppercase tracking-wider"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5870]">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="1" y="3" width="14" height="10" rx="2" />
                                        <path d="M1 6l7 4 7-4" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="usman@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1A1D2A] border border-white/[0.08] text-white text-sm placeholder-[#5A5870] rounded-lg pl-9 pr-3.5 py-2.5 outline-none transition-all duration-150 focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/30"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-[11px] font-medium text-[#8B89A0] uppercase tracking-wider"
                                >
                                    Password
                                </label>
                                <a
                                    href="/forgot-password"
                                    className="text-[11px] text-[#6C63FF] hover:text-[#9F9BFF] transition-colors duration-150"
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5870]">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="2" y="7" width="12" height="8" rx="1.5" />
                                        <path d="M5 7V5a3 3 0 016 0v2" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#1A1D2A] border border-white/[0.08] text-white text-sm placeholder-[#5A5870] rounded-lg pl-9 pr-3.5 py-2.5 outline-none transition-all duration-150 focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/30"
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/[0.06] my-1" />

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-medium text-sm rounded-lg py-2.5 px-4 transition-all duration-150 flex items-center justify-center gap-2 group"
                        >
                            Sign In
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="transition-transform duration-150 group-hover:translate-x-0.5"
                            >
                                <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                        </button>

                        {/* OR divider */}
                        <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-xs text-[#8B89A0]">OR</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Google Auth */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium text-sm rounded-lg py-2.5 px-4 transition-all duration-150 hover:bg-gray-100"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path
                                    fill="#EA4335"
                                    d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4.2 2l2.9-2.9C17.6 3.9 15 2.9 12 2.9 6.9 2.9 2.9 6.9 2.9 12s4 9.1 9.1 9.1c6 0 9.9-4.2 9.9-10.1 0-.7-.1-1.3-.2-1.9H12z"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Sign up link */}
                        <p className="text-center text-[#8B89A0] text-xs pt-1">
                            Don't have an account?{" "}
                            <Link
                                to="/"
                                className="text-[#6C63FF] hover:text-[#9F9BFF] font-medium transition-colors duration-150"
                            >
                                Sign up free
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
