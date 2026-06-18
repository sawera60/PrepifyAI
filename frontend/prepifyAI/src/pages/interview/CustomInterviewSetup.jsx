import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import aiAvatar from "../../assets/robot2.png";
import userAvatar from "../../assets/user.jpeg";

const CustomInterviewSetup = () => {
  const navigate = useNavigate();

  const [conversationHistory, setConversationHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusText, setStatusText] = useState("Tap and hold to speak");
  const [error, setError] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const currentAudioRef = useRef(null);

  // ── 🔊 PLAY DEEPGRAM AUDIO ──
  const playAudio = (base64, fallbackText, onEndCallback = null) => {
    if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    if (base64) {
        setIsSpeaking(true);
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        currentAudioRef.current = audio;
        audio.onended = () => {
            setIsSpeaking(false);
            currentAudioRef.current = null;
            if (onEndCallback) onEndCallback();
        };
        audio.onerror = () => {
            console.warn("Audio playback failed, falling back to Web Speech");
            currentAudioRef.current = null;
            speakFallback(fallbackText, onEndCallback);
        };
        audio.play().catch(() => {
            currentAudioRef.current = null;
            speakFallback(fallbackText, onEndCallback);
        });
    } else {
        speakFallback(fallbackText, onEndCallback);
    }
  };

  // ── 🔊 WEB SPEECH FALLBACK ──
  const speakFallback = (text, onEndCallback = null) => {
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const preferred = ["Google UK English Female", "Microsoft Aria Online (Natural)", "Microsoft Zira - English (United States)", "Samantha", "Google US English Female"];
          const picked = preferred.map((name) => voices.find((v) => v.name === name)).find(Boolean);
          if (picked) utterance.voice = picked;
      };
      if (window.speechSynthesis.getVoices().length > 0) pickVoice();
      else window.speechSynthesis.onvoiceschanged = pickVoice;

      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      
      window.activeUtterance = utterance;
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        window.activeUtterance = null;
        if (onEndCallback) onEndCallback();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        window.activeUtterance = null;
      };
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // ── First question on mount ──
  useEffect(() => {
    const initChat = async () => {
      setIsProcessing(true);
      try {
        const res = await api.post("/interviews/custom/setup-chat", { messages: [] });
        const { reply, audio } = res.data;
        setConversationHistory([{ role: "assistant", content: reply }]);
        playAudio(audio, reply);
      } catch (err) {
        const fallback = "Hi! I'm your PrepifyAI assistant. What role are you preparing for?";
        setConversationHistory([{ role: "assistant", content: fallback }]);
        speakFallback(fallback);
      } finally {
        setIsProcessing(false);
      }
    };
    initChat();
  }, []);

  // ── TOGGLE RECORDING ──
  const toggleRecording = async () => {
    if (isListening) {
      // ── STOP ──
      if (mediaRecorderRef.current) {
        const unlock = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(unlock);

        mediaRecorderRef.current.onstop = handleAudioReady;
        mediaRecorderRef.current.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        setIsProcessing(true);
        setStatusText("Processing...");
      }
    } else {
      // ── START ──
      if (isProcessing || isCreating || isSpeaking) return;
      setError(""); // Clear any previous errors

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        audioChunksRef.current = [];

        // Explicitly set MIME type for cross-browser consistency
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        setIsListening(true);
        setStatusText("Listening...");
      } catch (err) {
        setError("Microphone access denied. Please allow mic permissions.");
      }
    }
  };

  // ── Send audio to Deepgram, then AI ──
  const handleAudioReady = async () => {
    try {
      const recorder = mediaRecorderRef.current;
      const blobType = recorder?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

      if (audioBlob.size < 100) {
        setStatusText("Too short — please hold and speak clearly");
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      const ext = blobType.includes("ogg") ? "ogg" : "webm";
      formData.append("audio", audioBlob, `recording.${ext}`);

      // Transcribe via Deepgram endpoint
      let transcriptRes;
      try {
        transcriptRes = await api.post("/interviews/transcribe", formData);
      } catch (transcribeErr) {
        const msg = transcribeErr?.response?.data?.message || transcribeErr?.message || "Transcription failed";
        console.error("Transcription error:", msg);
        setError(`Transcription error: ${msg}`);
        setIsProcessing(false);
        setStatusText("Tap and hold to speak");
        return;
      }

      const transcript = transcriptRes.data.transcript;
      if (!transcript?.trim()) {
        setStatusText("Didn't catch that — try again");
        setIsProcessing(false);
        return;
      }

      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: transcript },
      ];
      setConversationHistory(updatedHistory);

      // Ask AI for next question / completion
      await getAIResponse(updatedHistory);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || "Unknown error";
      console.error("handleAudioReady error:", err);
      setError(`Error: ${errMsg}`);
      setIsProcessing(false);
      setStatusText("Tap and hold to speak");
    }
  };

  // ── AI setup chat call ──
  const getAIResponse = async (history) => {
    try {
      const res = await api.post("/interviews/custom/setup-chat", { messages: history });
      const { reply, done, interviewData, audio } = res.data;

      setConversationHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      setTurnCount((c) => c + 1);

      if (done && interviewData) {
        playAudio(audio, reply, async () => {
          setIsCreating(true);
          setStatusText("Creating your interview...");
          await createInterview(interviewData);
        });
      } else {
        playAudio(audio, reply);
        setIsProcessing(false);
        setStatusText("Tap and hold to speak");
      }
    } catch (err) {
      setError("AI response failed. Please try again.");
      setIsProcessing(false);
      setStatusText("Tap and hold to speak");
    }
  };

  // ── Create interview ──
  const createInterview = async (data) => {
    try {
      await api.post("/interviews/custom/create", {
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        experience: data.experience,
        techStack: Array.isArray(data.techStack) ? data.techStack : [data.techStack],
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError("Failed to create interview. Please try again.");
      setIsCreating(false);
      setStatusText("Tap and hold to speak");
    }
  };

  // ── Mic button visual ──
  const micState = isCreating
    ? "creating"
    : isProcessing
    ? "processing"
    : isListening
    ? "listening"
    : "idle";

  return (
    <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-white/[0.08] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-sm flex-shrink-0">
          🤖
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-syne font-bold text-sm sm:text-base text-white truncate">
            Custom Interview Setup
          </h1>
          <p className="text-xs text-[#8B89A0] hidden sm:block">
            Voice setup — just speak your answers
          </p>
        </div>
        {/* Turn dots */}
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx < turnCount
                  ? "bg-[#6C63FF]"
                  : idx === turnCount
                  ? "bg-[#6C63FF] scale-125"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Two-panel setup area */}
      <div className="flex flex-col items-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 flex-1">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
          {/* AI Panel */}
          <div className={`relative bg-[#13151F] border rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 transition-all duration-300 ${isSpeaking ? "border-[#6C63FF]/60 shadow-[0_0_20px_rgba(108,99,255,0.15)]" : "border-white/[0.08]"}`}>
            {isSpeaking && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1 bg-[#6C63FF] rounded-full animate-bounce"
                    style={{ height: "10px", animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${isSpeaking ? "border-[#6C63FF]" : "border-[#6C63FF]/30"}`}>
              <img src={aiAvatar} alt="AI Assistant" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p className="font-syne font-bold text-xs sm:text-sm text-white">Setup Assistant</p>
              <p className="text-[10px] sm:text-xs text-[#8B89A0] mt-0.5">
                {isSpeaking ? "Speaking..." : isProcessing ? "Thinking..." : isCreating ? "Creating..." : "Ready"}
              </p>
            </div>
          </div>

          {/* User Panel */}
          <div className={`relative bg-[#13151F] border rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 transition-all duration-300 ${isListening ? "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : "border-white/[0.08]"}`}>
            {isListening && (
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs text-red-400">REC</span>
              </div>
            )}
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-300 ${isListening ? "border-red-500" : "border-white/10"}`}>
              <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p className="font-syne font-bold text-xs sm:text-sm text-white">You</p>
              <p className="text-[10px] sm:text-xs text-[#8B89A0] mt-0.5">
                {isListening ? "Recording..." : "Candidate"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-3 mt-12 w-full max-w-md">
          <button
            onClick={toggleRecording}
            disabled={micState === "processing" || micState === "creating" || (isSpeaking && !isListening)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all select-none
              ${micState === "listening"
                ? "bg-[#6C63FF] scale-110 shadow-[0_0_40px_rgba(108,99,255,0.6)]"
                : micState === "processing" || micState === "creating" || (isSpeaking && !isListening)
                ? "bg-[#6C63FF]/30 cursor-not-allowed"
                : "bg-[#13151F] border-2 border-[#6C63FF]/40 hover:border-[#6C63FF] hover:bg-[#6C63FF]/10"
              }`}
          >
            {/* Pulse ring when listening */}
            {micState === "listening" && (
              <span className="absolute inset-0 rounded-full bg-[#6C63FF]/30 animate-ping" />
            )}
            
            {micState === "listening" ? (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
            ) : (
                <svg
                  className={`w-10 h-10 transition-colors ${
                    micState === "processing" || micState === "creating" || (isSpeaking && !isListening) ? "text-[#6C63FF]/40" : "text-[#6C63FF]"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6.364 5.636a1 1 0 0 1 1.414 1.414A8.966 8.966 0 0 1 13 17.945V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.055A8.966 8.966 0 0 1 4.222 10.05a1 1 0 1 1 1.414-1.414 7 7 0 0 0 12.728 0z" />
                </svg>
            )}
          </button>
          <p className="text-sm text-[#8B89A0]">
             {isListening ? "Recording — click to stop" : isProcessing ? "Processing..." : isCreating ? "Creating..." : isSpeaking ? "AI is speaking..." : "Click mic to speak"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomInterviewSetup;