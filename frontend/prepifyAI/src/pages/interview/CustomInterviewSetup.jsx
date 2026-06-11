import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

// -----------------------------
// SETUP QUESTIONS FLOW
// The AI is not real here — we drive the conversation
// with predefined steps, collecting answers one by one.
// No backend AI call needed for setup — it's a guided form disguised as a chat.
// -----------------------------

const SETUP_STEPS = [
  {
    key: "title",
    question: "Hi! I'm your PrepifyAI assistant. 👋 What role are you preparing for? (e.g. Frontend Developer, Data Scientist, Product Manager)",
  },
  {
    key: "category",
    question: "Got it! What's the main category for this interview? (e.g. Web Development, Machine Learning, System Design)",
  },
  {
    key: "difficulty",
    question: "What difficulty level do you prefer? Type Easy, Medium, or Hard.",
    validate: (val) => ["easy", "medium", "hard"].includes(val.toLowerCase()),
    errorMsg: "Please type Easy, Medium, or Hard.",
    format: (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
  },
  {
    key: "experience",
    question: "What's your experience level? Type Junior, Mid, or Senior.",
    validate: (val) => ["junior", "mid", "senior"].includes(val.toLowerCase()),
    errorMsg: "Please type Junior, Mid, or Senior.",
    format: (val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
  },
  {
    key: "techStack",
    question: "Finally, what technologies should the interview focus on? (e.g. React, Node.js, MongoDB — separate with commas)",
  },
];

const CustomInterviewSetup = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speak helper
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      
      window.activeUtterance = utterance;
      utterance.onend = () => {
        window.activeUtterance = null;
      };
      utterance.onerror = () => {
        window.activeUtterance = null;
      };
      
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // Kick off with first question on mount
  useEffect(() => {
    const firstQuestion = SETUP_STEPS[0].question;
    setMessages([{ role: "assistant", content: firstQuestion }]);
    speakText(firstQuestion);
  }, []);

  // -----------------------------
  // HANDLE USER ANSWER
  // -----------------------------
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isCreating) return;

    const step = SETUP_STEPS[currentStep];
    const userInput = input.trim();
    setInput("");

    // Validate if step has validation
    if (step.validate && !step.validate(userInput)) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userInput },
        { role: "assistant", content: step.errorMsg },
      ]);
      speakText(step.errorMsg);
      return;
    }

    // Format if needed
    const formattedValue = step.format ? step.format(userInput) : userInput;

    const updatedAnswers = { ...answers, [step.key]: formattedValue };
    setAnswers(updatedAnswers);

    const nextStep = currentStep + 1;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);

    if (nextStep < SETUP_STEPS.length) {
      // Ask next question
      const nextQuestion = SETUP_STEPS[nextStep].question;
      setMessages((prev) => [...prev, { role: "assistant", content: nextQuestion }]);
      speakText(nextQuestion);
      setCurrentStep(nextStep);
    } else {
      // All answers collected — create interview
      const closingMsg = "Perfect! I have everything I need. Creating your custom interview now... 🚀";
      setMessages((prev) => [...prev, { role: "assistant", content: closingMsg }]);
      speakText(closingMsg);
      setIsCreating(true);
      await createInterview(updatedAnswers);
    }
  };

  // -----------------------------
  // CREATE INTERVIEW ON BACKEND
  // -----------------------------
  const createInterview = async (data) => {
    try {
      setError("");

      const techStackArray = data.techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.post("/interviews/custom/create", {
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        experience: data.experience,
        techStack: techStackArray,
      });

      const successMsg = `Your "${data.title}" interview is ready! Redirecting you to your interviews...`;
      setMessages((prev) => [...prev, { role: "assistant", content: successMsg }]);
      speakText(successMsg);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong creating your interview. Please try again.";
      setError(errMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
      setIsCreating(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-[#0B0D14] font-dm text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-white/[0.08] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-sm flex-shrink-0">
          🤖
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-syne font-bold text-sm sm:text-base text-white truncate">Custom Interview Setup</h1>
          <p className="text-xs text-[#8B89A0] hidden sm:block">Answer a few questions to personalize your interview</p>
        </div>
        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {SETUP_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${idx < currentStep
                ? "bg-[#6C63FF]"
                : idx === currentStep
                  ? "bg-[#6C63FF] scale-125"
                  : "bg-white/10"
                }`}
            />
          ))}
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                ? "bg-[#6C63FF] text-white rounded-br-sm"
                : "bg-[#13151F] border border-white/[0.08] text-gray-200 rounded-bl-sm"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isCreating && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs mr-2 mt-1">
              🤖
            </div>
            <div className="bg-[#13151F] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.08] p-4 max-w-2xl w-full mx-auto">
        {error && (
          <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isCreating}
            placeholder={isCreating ? "Creating your interview..." : "Type your answer..."}
            className="flex-1 bg-[#13151F] border border-white/[0.08] text-white placeholder-[#8B89A0] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#6C63FF]/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isCreating}
            className="px-5 py-3 bg-[#6C63FF] hover:bg-[#5B54E8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-[#8B89A0] mt-2 text-center">
          Step {Math.min(currentStep + 1, SETUP_STEPS.length)} of {SETUP_STEPS.length}
        </p>
      </div>
    </div>
  );
};

export default CustomInterviewSetup;
