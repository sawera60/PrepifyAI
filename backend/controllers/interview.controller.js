import Interview from "../models/interview.model.js";
import { getAIResponse } from "../services/openrouter.js";
import { transcribeAudio } from "../services/deepgram.js";
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
        if (!req.file) {
            return res.status(400).json({ message: "No audio file uploaded" });
        }
        const audioBuffer = req.file.buffer;
        const transcript = await transcribeAudio(audioBuffer);

        if (!transcript || !transcript.trim()) {
            return res.status(400).json({ message: "Could not transcribe audio" });
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

        const interview = new Interview({
            title,
            category,
            difficulty,
            experience,
            techStack: Array.isArray(techStack) ? techStack : [techStack],
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
        console.error("Error creating custom interview:", error.message);
        return res.status(500).json({ message: "Internal server error" });
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
                content: `You are a helpful interview assistant.
Analyze the resume carefully.
- If the candidate has experience in MULTIPLE different fields, ask them which role they want to be interviewed for. Mention the fields you noticed.
- If the candidate has experience in ONE field only, don't ask — just confirm that field and say you're ready to generate an interview for them.
Be brief, warm, and conversational. 2-3 sentences max.`
            },
            {
                role: "user",
                content: `Here is my resume:\n\n${resumeText}`
            }
        ];

        const aiQuestion = await getAIResponse(messages);

        return res.status(200).json({
            resumeText,
            aiQuestion,
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

    const systemPrompt = `You are PrepifyAI, a friendly voice interview setup assistant. 
Your job is to gather interview preferences through natural conversation.
You need to collect: role/title, category (e.g. Web Development, Data Science), difficulty (Easy/Medium/Hard), experience level (Junior/Mid/Senior), and tech stack.

Rules:
- Ask ONE question at a time, conversationally
- Respond to what the user actually said — don't ignore their answers
- After 4-5 exchanges when you have all info, confirm briefly and end with [SETUP_COMPLETE]
- After [SETUP_COMPLETE] on the NEXT line output ONLY valid JSON: {"title":"...","category":"...","difficulty":"...","experience":"...","techStack":["..."]}
- Keep responses SHORT (1-2 sentences) since this is a voice interface`;

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
        return res.json({ reply: cleanReply || "Perfect! Setting up your interview now.", done: true, interviewData });
      }
    }

    res.json({ reply, done: false });
  } catch (err) {
    res.status(500).json({ message: "AI setup failed", error: err.message });
  }
};