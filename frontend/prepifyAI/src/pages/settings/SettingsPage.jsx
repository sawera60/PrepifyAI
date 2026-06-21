import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../features/dashboard/components/Sidebar";
import DashboardHeader from "../../features/dashboard/components/DashboardHeader";
import api from "../../services/api";
import { toast } from "react-toastify";
import useUserStore from "../../features/store/userStore";

// ─── Section Tab IDs ───────────────────────────────────────────────────────────
const TABS = [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "security", label: "Security", icon: "lock" },
    { id: "account", label: "Account", icon: "shield" },
];

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
    const icons = {
        user: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        lock: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        shield: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        eye: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),
        eyeOff: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
        ),
        check: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        mail: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
            </svg>
        ),
        trash: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        ),
        logout: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        ),
        google: (
            <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4.2 2l2.9-2.9C17.6 3.9 15 2.9 12 2.9 6.9 2.9 2.9 6.9 2.9 12s4 9.1 9.1 9.1c6 0 9.9-4.2 9.9-10.1 0-.7-.1-1.3-.2-1.9H12z" />
            </svg>
        ),
        crown: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M2 20h20" />
                <path d="M5 20V10l7-7 7 7v10" />
                <path d="M12 3l2 4H10l2-4z" />
            </svg>
        ),
    };
    return icons[name] || null;
};

// ─── Reusable Input ───────────────────────────────────────────────────────────
const Input = ({ label, id, type = "text", value, onChange, placeholder, disabled, icon, rightEl, hint }) => (
    <div className="flex flex-col gap-1.5">
        {label && (
            <label htmlFor={id} className="text-[11px] font-medium text-[#8B89A0] uppercase tracking-wider">
                {label}
            </label>
        )}
        <div className="relative">
            {icon && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5870]">
                    <Icon name={icon} size={14} />
                </span>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full bg-[#1A1D2A] border border-white/[0.08] text-white text-sm placeholder-[#5A5870] rounded-lg ${icon ? "pl-9" : "pl-3.5"} ${rightEl ? "pr-10" : "pr-3.5"} py-2.5 outline-none transition-all duration-150 focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/30 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {rightEl && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {rightEl}
                </span>
            )}
        </div>
        {hint && <p className="text-[#5A5870] text-xs">{hint}</p>}
    </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, description, children }) => (
    <div className="bg-[#13151F] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-syne font-bold text-white text-base">{title}</h2>
            {description && <p className="text-[#8B89A0] text-xs mt-0.5">{description}</p>}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ onClose, onConfirm, loading }) => {
    const [confirmText, setConfirmText] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-[#13151F] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                            <Icon name="trash" size={15} />
                        </div>
                        <h3 className="font-syne font-bold text-white text-base">Delete Account</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center text-[#8B89A0] hover:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <span className="text-red-400 text-sm mt-0.5">⚠️</span>
                        <p className="text-red-300 text-xs leading-relaxed">
                            This action is <strong>permanent and irreversible</strong>. All your data, interview history, and settings will be permanently deleted.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-[#8B89A0] uppercase tracking-wider">
                            Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                        </label>
                        <input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="w-full bg-[#1A1D2A] border border-white/[0.08] text-white text-sm placeholder-[#5A5870] rounded-lg px-3.5 py-2.5 outline-none transition-all duration-150 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#1A1D2A] border border-white/[0.08] text-[#8B89A0] hover:text-white text-sm font-medium transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={confirmText !== "DELETE" || loading}
                            className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Icon name="trash" size={14} />
                                    Delete Account
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Password Strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
    if (!password) return null;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["#EF4444", "#F59E0B", "#6C63FF", "#10B981"];
    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < score ? colors[score - 1] : "#1A1D2A" }}
                    />
                ))}
            </div>
            <p className="text-xs" style={{ color: score > 0 ? colors[score - 1] : "#5A5870" }}>
                {score > 0 ? labels[score - 1] : ""}
            </p>
        </div>
    );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
const SettingsPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const { fetchUser } = useUserStore();

    // Profile state
    const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", authProvider: "self", plan: "free", createdAt: "" });
    const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
    const [profileLoading, setProfileLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);

    // Password state
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [pwShow, setPwShow] = useState({ current: false, new: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);

    // Account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Avatar state
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setFetchingProfile(true);
                const res = await api.get("/users/profile");
                const u = res.data.user;
                setProfile(u);
                setProfileForm({ firstName: u.firstName, lastName: u.lastName });
            } catch {
                toast.error("Failed to load profile. Please login again.");
                navigate("/login");
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // ── Profile Save ──
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
            return toast.error("First and last name are required");
        }
        try {
            setProfileLoading(true);
            const res = await api.put("/users/profile", profileForm);
            const u = res.data.user;
            setProfile((prev) => ({ ...prev, ...u }));
            setProfileForm({ firstName: u.firstName, lastName: u.lastName });
            toast.success("Profile updated successfully!");
        } catch {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Avatar Upload ──
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local preview immediately
        const localUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, profilePicture: localUrl }));

        const formData = new FormData();
        formData.append("image", file);

        try {
            setAvatarLoading(true);
            const res = await api.put("/users/profile-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfile((prev) => ({ ...prev, profilePicture: res.data.user.profilePicture }));
            await fetchUser(); // Update global state
            toast.success("Profile picture updated!");
        } catch {
            toast.error(err.response?.data?.message || "Failed to upload image");
        } finally {
            setAvatarLoading(false);
        }
    };

    // ── Password Change ──
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword) {
            return toast.error("All fields are required");
        }
        if (pwForm.newPassword !== pwForm.confirmNewPassword) {
            return toast.error("New passwords do not match");
        }
        try {
            setPwLoading(true);
            await api.put("/users/change-password", pwForm);
            toast.success("Password changed successfully!");
            setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        } catch {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    // ── Logout ──
    const handleLogout = async () => {
        try {
            setLogoutLoading(true);
            await api.post("/auth/logout");
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            toast.error("Failed to logout");
        } finally {
            setLogoutLoading(false);
        }
    };

    // ── Delete Account ──
    const handleDeleteAccount = async () => {
        try {
            setDeleteLoading(true);
            await api.delete("/users/account");
            toast.success("Account deleted successfully");
            navigate("/");
        } catch {
            toast.error(err.response?.data?.message || "Failed to delete account");
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    // ── Avatar initials ──
    const initials = profile.firstName && profile.lastName
        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
        : "U";

    // ── Member since ──
    const memberSince = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
        : "";

    return (
        <div className="font-dm min-h-screen bg-[#0B0D14] flex">
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <div className="flex-1 min-h-screen lg:ml-[264px]">
                <DashboardHeader onMenuToggle={() => setMobileMenuOpen(true)} />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

                    {/* ── Page Header ── */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 bg-[#6C63FF]/10 text-[#9F9BFF] text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] inline-block animate-pulse" />
                            Configuration
                        </div>
                        <h1 className="font-syne text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                            Settings
                        </h1>
                        <p className="text-[#8B89A0] text-sm">
                            Manage your account preferences, security, and profile information.
                        </p>
                    </div>

                    {/* ── Profile Hero Card ── */}
                    {fetchingProfile ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#13151F] via-[#13151F] to-[#1A1D2A] p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                            {/* Glow */}
                            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#6C63FF] opacity-[0.06] blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#4ECDC4] opacity-[0.05] blur-3xl" />

                            {/* Avatar */}
                            <div className="relative shrink-0 group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="profilePictureUpload"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                <label htmlFor="profilePictureUpload" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4ECDC4] flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg shadow-[#6C63FF]/20 cursor-pointer overflow-hidden relative">
                                    {profile.profilePicture ? (
                                        <img src={profile.profilePicture} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                                    ) : initials}
                                    
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Icon name="user" size={16} className="text-white" />
                                    </div>

                                    {/* Loading overlay */}
                                    {avatarLoading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    )}
                                </label>
                                {profile.plan === "pro" && (
                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#5B53EE] flex items-center justify-center text-[10px] shadow-lg">
                                        👑
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 text-center sm:text-left relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                    <h2 className="font-syne font-bold text-white text-lg">
                                        {profile.firstName} {profile.lastName}
                                    </h2>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${profile.plan === "pro" ? "bg-[#6C63FF]/20 text-[#9F9BFF] border border-[#6C63FF]/30" : "bg-white/[0.06] text-[#8B89A0] border border-white/[0.08]"}`}>
                                        {profile.plan === "pro" ? "👑 Pro" : "Free"}
                                    </span>
                                </div>
                                <p className="text-[#8B89A0] text-sm mb-3">{profile.email}</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#5A5870]">
                                    <span className="flex items-center gap-1.5">
                                        <Icon name={profile.authProvider === "google" ? "google" : "mail"} size={12} />
                                        {profile.authProvider === "google" ? "Google Account" : "Email Account"}
                                    </span>
                                    {memberSince && (
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-[#5A5870]" />
                                            Member since {memberSince}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Upgrade badge */}
                            {profile.plan === "free" && (
                                <button
                                    onClick={() => navigate("/payment")}
                                    className="shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] hover:from-[#5B53EE] hover:to-[#4B44DD] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-[#6C63FF]/20 relative z-10"
                                >
                                    <span>👑</span> Upgrade to Pro
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Tab Navigation ── */}
                    <div className="flex gap-1 bg-[#13151F] border border-white/[0.06] rounded-xl p-1 mb-6">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/20"
                                    : "text-[#8B89A0] hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <Icon name={tab.icon} size={15} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Profile Tab ── */}
                    {activeTab === "profile" && !fetchingProfile && (
                        <div className="space-y-5">
                            <SectionCard
                                title="Personal Information"
                                description="Update your name and public profile details."
                            >
                                <form onSubmit={handleProfileSave} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            id="firstName"
                                            value={profileForm.firstName}
                                            onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                                            placeholder="John"
                                        />
                                        <Input
                                            label="Last Name"
                                            id="lastName"
                                            value={profileForm.lastName}
                                            onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    <Input
                                        label="Email Address"
                                        id="email"
                                        value={profile.email}
                                        icon="mail"
                                        disabled
                                        hint="Email cannot be changed. Contact support if needed."
                                    />
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={profileLoading}
                                            className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#6C63FF]/20"
                                        >
                                            {profileLoading ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Icon name="check" size={14} />
                                            )}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>

                            {/* Account Overview */}
                            <SectionCard title="Account Overview" description="A summary of your current plan and usage.">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {[
                                        { label: "Current Plan", value: profile.plan === "pro" ? "Pro 👑" : "Free", accent: profile.plan === "pro" },
                                        { label: "Auth Method", value: profile.authProvider === "google" ? "Google OAuth" : "Email & Password" },
                                        { label: "Member Since", value: memberSince || "—" },
                                    ].map((item, i) => (
                                        <div key={i} className={`rounded-xl px-4 py-3 border ${item.accent ? "bg-[#6C63FF]/10 border-[#6C63FF]/20" : "bg-[#1A1D2A] border-white/[0.06]"}`}>
                                            <p className="text-[10px] text-[#8B89A0] uppercase tracking-widest font-semibold mb-1">{item.label}</p>
                                            <p className={`text-sm font-semibold ${item.accent ? "text-[#9F9BFF]" : "text-white"}`}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}

                    {/* ── Security Tab ── */}
                    {activeTab === "security" && !fetchingProfile && (
                        <div className="space-y-5">
                            {profile.authProvider === "google" ? (
                                <SectionCard title="Password Management" description="Manage your account password.">
                                    <div className="flex items-start gap-4 bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-xl px-4 py-4">
                                        <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center shrink-0">
                                            <Icon name="google" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold mb-1">Google Account Connected</p>
                                            <p className="text-[#8B89A0] text-xs leading-relaxed">
                                                Your account uses Google OAuth for authentication. Password management is handled through your Google account settings.
                                            </p>
                                        </div>
                                    </div>
                                </SectionCard>
                            ) : (
                                <SectionCard title="Change Password" description="Update your password to keep your account secure.">
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        {/* Current Password */}
                                        <Input
                                            label="Current Password"
                                            id="currentPassword"
                                            type={pwShow.current ? "text" : "password"}
                                            value={pwForm.currentPassword}
                                            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                            placeholder="Enter current password"
                                            icon="lock"
                                            rightEl={
                                                <button type="button" onClick={() => setPwShow((s) => ({ ...s, current: !s.current }))} className="text-[#5A5870] hover:text-[#8B89A0] transition-colors">
                                                    <Icon name={pwShow.current ? "eyeOff" : "eye"} size={14} />
                                                </button>
                                            }
                                        />

                                        <div className="h-px bg-white/[0.04]" />

                                        {/* New Password */}
                                        <div>
                                            <Input
                                                label="New Password"
                                                id="newPassword"
                                                type={pwShow.new ? "text" : "password"}
                                                value={pwForm.newPassword}
                                                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                                                placeholder="Minimum 6 characters"
                                                icon="lock"
                                                rightEl={
                                                    <button type="button" onClick={() => setPwShow((s) => ({ ...s, new: !s.new }))} className="text-[#5A5870] hover:text-[#8B89A0] transition-colors">
                                                        <Icon name={pwShow.new ? "eyeOff" : "eye"} size={14} />
                                                    </button>
                                                }
                                            />
                                            <PasswordStrength password={pwForm.newPassword} />
                                        </div>

                                        {/* Confirm Password */}
                                        <Input
                                            label="Confirm New Password"
                                            id="confirmNewPassword"
                                            type={pwShow.confirm ? "text" : "password"}
                                            value={pwForm.confirmNewPassword}
                                            onChange={(e) => setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
                                            placeholder="Repeat new password"
                                            icon="lock"
                                            rightEl={
                                                <button type="button" onClick={() => setPwShow((s) => ({ ...s, confirm: !s.confirm }))} className="text-[#5A5870] hover:text-[#8B89A0] transition-colors">
                                                    <Icon name={pwShow.confirm ? "eyeOff" : "eye"} size={14} />
                                                </button>
                                            }
                                        />

                                        {/* Match indicator */}
                                        {pwForm.newPassword && pwForm.confirmNewPassword && (
                                            <div className={`flex items-center gap-1.5 text-xs ${pwForm.newPassword === pwForm.confirmNewPassword ? "text-emerald-400" : "text-red-400"}`}>
                                                {pwForm.newPassword === pwForm.confirmNewPassword ? (
                                                    <><Icon name="check" size={12} /> Passwords match</>
                                                ) : (
                                                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> Passwords don't match</>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={pwLoading}
                                                className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5B53EE] active:bg-[#4B44DD] text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#6C63FF]/20"
                                            >
                                                {pwLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Icon name="lock" size={14} />
                                                )}
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </SectionCard>
                            )}

                            {/* Security tips */}
                            <SectionCard title="Security Tips" description="Keep your account safe with these best practices.">
                                <ul className="space-y-3">
                                    {[
                                        { icon: "🔐", tip: "Use a unique password that you don't use on other sites." },
                                        { icon: "🔄", tip: "Change your password regularly, at least every 3–6 months." },
                                        { icon: "📵", tip: "Never share your password with anyone, including support staff." },
                                        { icon: "🛡️", tip: "Use a password manager to generate and store secure passwords." },
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                                            <span className="text-[#8B89A0] text-xs leading-relaxed">{item.tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </SectionCard>
                        </div>
                    )}

                    {/* ── Account Tab ── */}
                    {activeTab === "account" && !fetchingProfile && (
                        <div className="space-y-5">
                            {/* Logout */}
                            <SectionCard title="Session Management" description="Manage your active sessions and sign out.">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-white text-sm font-medium mb-1">Sign out of PrepifyAI</p>
                                        <p className="text-[#8B89A0] text-xs">You will be redirected to the login page after signing out.</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logoutLoading}
                                        className="flex items-center gap-2 bg-[#1A1D2A] border border-white/[0.08] hover:border-white/20 hover:text-white text-[#8B89A0] text-sm font-medium rounded-xl px-5 py-2.5 transition-all duration-200 shrink-0 disabled:opacity-60"
                                    >
                                        {logoutLoading ? (
                                            <div className="w-4 h-4 border-2 border-[#8B89A0]/30 border-t-[#8B89A0] rounded-full animate-spin" />
                                        ) : (
                                            <Icon name="logout" size={15} />
                                        )}
                                        Sign Out
                                    </button>
                                </div>
                            </SectionCard>

                            {/* Current Plan */}
                            <SectionCard title="Subscription" description="Manage your current plan and billing.">
                                <div className={`relative overflow-hidden rounded-xl border p-5 flex items-center gap-4 ${profile.plan === "pro" ? "border-[#6C63FF]/30 bg-gradient-to-r from-[#6C63FF]/10 via-transparent to-[#4ECDC4]/10" : "border-white/[0.06] bg-[#1A1D2A]"}`}>
                                    {profile.plan === "pro" && <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#6C63FF] opacity-[0.07] blur-3xl" />}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${profile.plan === "pro" ? "bg-[#6C63FF]/20 border border-[#6C63FF]/30" : "bg-white/[0.06] border border-white/[0.08]"}`}>
                                        {profile.plan === "pro" ? "👑" : "🆓"}
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className={`text-sm font-semibold ${profile.plan === "pro" ? "text-[#9F9BFF]" : "text-white"}`}>
                                            {profile.plan === "pro" ? "Pro Plan — Active" : "Free Plan"}
                                        </p>
                                        <p className="text-[#8B89A0] text-xs mt-0.5">
                                            {profile.plan === "pro" ? "All features unlocked. Billed monthly." : "Upgrade to unlock unlimited interviews and more."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/payment")}
                                        className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${profile.plan === "pro" ? "bg-[#1A1D2A] border border-white/[0.08] text-[#8B89A0] hover:text-white" : "bg-gradient-to-r from-[#6C63FF] to-[#5B53EE] text-white shadow-lg shadow-[#6C63FF]/20 hover:from-[#5B53EE] hover:to-[#4B44DD]"}`}
                                    >
                                        {profile.plan === "pro" ? "Manage" : "Upgrade"}
                                    </button>
                                </div>
                            </SectionCard>

                            {/* Danger Zone */}
                            <div className="rounded-2xl border border-red-500/20 overflow-hidden">
                                <div className="px-6 py-4 border-b border-red-500/10 bg-red-500/[0.03]">
                                    <h2 className="font-syne font-bold text-red-400 text-base">Danger Zone</h2>
                                    <p className="text-[#8B89A0] text-xs mt-0.5">These actions are permanent and cannot be undone.</p>
                                </div>
                                <div className="p-6 bg-[#13151F]">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-white text-sm font-medium mb-1">Delete Account</p>
                                            <p className="text-[#8B89A0] text-xs leading-relaxed max-w-sm">
                                                Permanently delete your account and all associated data. This action cannot be reversed.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="flex items-center gap-2 shrink-0 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl px-5 py-2.5 transition-all duration-200"
                                        >
                                            <Icon name="trash" size={15} />
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
};

export default SettingsPage;
