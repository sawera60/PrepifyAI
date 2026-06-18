import Interview from "../models/interview.model.js";
import { getAIResponse } from "../services/groq.js";
import { transcribeAudio } from "../services/deepgram.js";
import { auraTextToSpeech } from "../services/deepgramTTS.js";
// pdf-parse is loaded dynamically to avoid pdfjs-dist crashing Vercel on startup

//MockInterview Controller
export const getMockInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ isPublic: true });
        res.status(200).json({
            success: true,
            interviews,
            message: "Interviews fetched successfully"
        })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Error while fetching mock interviews" })

    }
}

// POST /api/interviews/transcribe  — used by CustomInterviewSetup voice flow
export const transcribeVoice = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: "No audio file uploaded" });
        }
        const audioBuffer = req.file.buffer;
        const mimeType = req.file.mimetype || "audio/webm";
        console.log(`📥 Custom setup transcribe — size: ${audioBuffer.length} bytes, type: ${mimeType}`);

        if (audioBuffer.length < 100) {
            return res.status(400).json({ message: "Audio too short — please speak for at least 1 second" });
        }

        const transcript = await transcribeAudio(audioBuffer, mimeType);

        if (!transcript || !transcript.trim()) {
            return res.status(400).json({ message: "Could not transcribe audio. Please speak clearly and try again." });
        }

        return res.status(200).json({ transcript });
    } catch (error) {
        console.error("Transcribe error:", error.message);
        return res.status(500).json({ message: "Transcription failed" });
    }
};

//MyInterview Controller
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            createdBy: req.user._id,
        });

        res.status(200).json({
            success: true,
            interviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// POST /api/interviews/custom/create
export const createCustomInterview = async (req, res) => {
    try {
        const { title, category, difficulty, experience, techStack } = req.body;

        // Map AI generated values to strict Enums to prevent Mongoose Validation Errors
        let mappedDifficulty = "Medium";
        if (difficulty) {
            const d = difficulty.toLowerCase();
            if (d.includes("easy") || d.includes("beginner")) mappedDifficulty = "Easy";
            else if (d.includes("hard") || d.includes("expert") || d.includes("advanced")) mappedDifficulty = "Hard";
        }

        let mappedExperience = "Mid";
        if (experience) {
            const e = experience.toLowerCase();
            if (e.includes("junior") || e.includes("entry")) mappedExperience = "Junior";
            else if (e.includes("senior") || e.includes("lead") || e.includes("expert")) mappedExperience = "Senior";
        }

        const interview = new Interview({
            title: title || "Custom Interview",
            category: category || "General",
            difficulty: mappedDifficulty,
            experience: mappedExperience,
            techStack: Array.isArray(techStack) ? techStack : techStack ? [techStack] : [],
            type: "custom",
            generatedFrom: "custom",
            isPublic: false,
            createdBy: req.user._id,
        });

        await interview.save();

        return res.status(201).json({
            success: true,
            interviewId: interview._id,
            message: "Custom interview created successfully",
        });

    } catch (error) {
        console.error("Error creating custom interview FULL:", error);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

// POST /api/interviews/resume/upload
export const uploadResume = async (req, res) => {
    try {
        const pdfBuffer = req.file.buffer;

        // Dynamic import so pdfjs-dist doesn't crash the server at startup on Vercel
        const { default: pdfParse } = await import("pdf-parse-new");
        const parsed = await pdfParse(pdfBuffer);
        const resumeText = parsed.text;

        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(400).json({ message: "Could not extract text from resume." });
        }

        // Ask AI to analyze resume and ask which role
        const messages = [
            {
                role: "system",
                content: `You are a warm, friendly interview assistant reviewing a candidate's resume.
- If the candidate has experience in MULTIPLE different fields, ask them which role they'd like to practice for. Briefly mention the fields you noticed.
- If the candidate clearly focuses on ONE field, just confirm it and say you're ready to set up their interview.
Keep it to 1-2 short, conversational sentences. NEVER use markdown formatting — no asterisks, bold, bullets, or headers. Plain text only.`
            },
            {
                role: "user",
                content: `Here is my resume:\n\n${resumeText}`
            }
        ];

        const aiQuestion = await getAIResponse(messages);
        const audioBase64 = await auraTextToSpeech(aiQuestion);

        return res.status(200).json({
            resumeText,
            aiQuestion,
            audio: audioBase64,
        });

    } catch (error) {
        console.error("Resume upload error FULL:", error);
        return res.status(500).json({ message: error.message || "Failed to process resume." });
    }
};

// POST /api/interviews/resume/create
export const createResumeInterview = async (req, res) => {
    try {
        const { title, resumeText } = req.body;

        // Ask AI to extract category and techStack from resume + role
        const messages = [
            {
                role: "system",
                content: `Extract interview metadata from the resume and target role.
Return ONLY valid JSON, no markdown, no extra text:
{
  "category": "<main category>",
  "difficulty": "Easy" | "Medium" | "Hard",
  "experience": "Junior" | "Mid" | "Senior",
  "techStack": ["<tech1>", "<tech2>"]
}`
            },
            {
                role: "user",
                content: `Target role: ${title}\n\nResume:\n${resumeText}`
            }
        ];

        const raw = await getAIResponse(messages);
        let metadata = {};
        try {
            const firstBrace = raw.indexOf("{");
            const lastBrace = raw.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = raw.slice(firstBrace, lastBrace + 1);
                metadata = JSON.parse(jsonString);
            } else {
                throw new Error("No JSON object found in response");
            }
        } catch (parseError) {
            console.error("Failed to parse AI metadata JSON. Raw response was:", raw, parseError);
        }

        const interview = new Interview({
            title,
            category: metadata.category || "General",
            difficulty: metadata.difficulty || "Medium",
            experience: metadata.experience || "Mid",
            techStack: metadata.techStack || [],
            type: "custom",
            generatedFrom: "resume",
            isPublic: false,
            createdBy: req.user._id,
        });

        await interview.save();

        return res.status(201).json({
            success: true,
            interviewId: interview._id,
        });

    } catch (error) {
        console.error("Resume interview create error FULL:", error);
        return res.status(500).json({ message: error.message || "Failed to create interview." });
    }
};



//interview setup chat controller


// POST /interviews/custom/setup-chat
export const setupChat = async (req, res) => {
  try {
    const { messages } = req.body;

    const systemPrompt = `You are PrepifyAI, a warm and friendly voice assistant helping someone set up a practice interview.

Personality: You're like a supportive friend who happens to be great at interview prep. Be casual, encouraging, and human.

Your goal: Gather these 5 things through natural conversation (ask max 4-5 questions total):
1. What role/job title they're preparing for
2. Category (e.g. Web Dev, Data Science, DevOps)
3. Difficulty preference (Easy, Medium, or Hard)
4. Experience level (Junior, Mid, or Senior)
5. Tech stack they want to focus on

CRITICAL RULES:
- Your FIRST message must be a warm greeting like "Hey! How are you doing? Before I generate your interview, I'll ask you a few quick questions to personalize it for you."
- Ask ONE question at a time. Keep each response to 1-2 short sentences max.
- Be smart — infer what you can. If someone says "I'm a senior React developer", you already know role, experience, and part of the tech stack. Don't re-ask what's obvious.
- NEVER use markdown formatting. No asterisks, no bold, no bullet points, no numbered lists, no headers. Write plain conversational text only.
- After you have enough info (usually 3-5 exchanges), say something like "Thanks! I have everything I need. I'm generating your custom interview now." and end with [SETUP_COMPLETE]
- After [SETUP_COMPLETE] on the NEXT line, output ONLY valid JSON: {"title":"...","category":"...","difficulty":"...","experience":"...","techStack":["..."]}
- Do NOT stretch responses. If it can be said in one line, say it in one line.`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
    const response = await getAIResponse(fullMessages);
    const reply = response.trim();

    if (reply.includes("[SETUP_COMPLETE]")) {
      // Extract JSON after the token
      const jsonMatch = reply.match(/\[SETUP_COMPLETE\]\s*(\{[\s\S]+\})/);
      const cleanReply = reply.replace(/\[SETUP_COMPLETE\][\s\S]*/, "").trim();

      if (jsonMatch) {
        const interviewData = JSON.parse(jsonMatch[1]);
        const finalReply = cleanReply || "Perfect! Setting up your interview now.";
        const audioBase64 = await auraTextToSpeech(finalReply);
        return res.json({ reply: finalReply, done: true, interviewData, audio: audioBase64 });
      }
    }

    const audioBase64 = await auraTextToSpeech(reply);
    res.json({ reply, done: false, audio: audioBase64 });
  } catch (err) {
    res.status(500).json({ message: "AI setup failed", error: err.message });
  }
};