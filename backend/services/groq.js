import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getAIResponse = async (messages) => {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
        });
        return chatCompletion.choices[0]?.message?.content || "";
    } catch (err) {
        console.error("Groq API error:", err.message);
        throw err;
    }
};

export const getAIResponseStream = async (messages) => {
    try {
        const stream = await groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
        });
        return stream;
    } catch (err) {
        console.error("Groq API Stream error:", err.message);
        throw err;
    }
};
