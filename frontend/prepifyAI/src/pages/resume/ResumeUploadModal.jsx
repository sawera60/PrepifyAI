import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const ResumeUploadModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setError("");
        } else {
            setError("Please upload a PDF file only.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type === "application/pdf") {
            setFile(dropped);
            setError("");
        } else {
            setError("Please upload a PDF file only.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await api.post("/interviews/resume/upload", formData);

            // Pass resumeText and aiQuestion to setup page via navigation state
            navigate("/resume/setup", {
                state: {
                    resumeText: res.data.resumeText,
                    aiQuestion: res.data.aiQuestion,
                },
            });

            onClose();

        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload resume.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="bg-[#13151F] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="font-syne font-bold text-white text-lg">Upload Resume</h2>
                        <p className="text-xs text-[#8B89A0] mt-0.5">PDF only — max 5MB</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-[#8B89A0] hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer mb-4 ${isDragging
                        ? "border-[#6C63FF] bg-[#6C63FF]/5"
                        : file
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-white/[0.08] hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5"
                        }`}
                    onClick={() => document.getElementById("resume-input").click()}
                >
                    <input
                        id="resume-input"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <p className="text-emerald-400 font-semibold text-sm">{file.name}</p>
                            <p className="text-xs text-[#8B89A0] mt-1">
                                {(file.size / 1024).toFixed(0)} KB — click to change
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-[#1A1D2A] border border-white/[0.06] flex items-center justify-center mb-3">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <p className="text-white font-semibold text-sm">Drop your PDF here</p>
                            <p className="text-xs text-[#8B89A0] mt-1">or click to browse</p>
                        </>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#8B89A0] hover:text-white font-medium rounded-xl text-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="flex-1 py-2.5 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all"
                    >
                        {isUploading ? "Processing..." : "Upload & Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeUploadModal;
