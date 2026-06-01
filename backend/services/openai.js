import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// OPENAI.js:  Only talks to OpenAI and returns assistant text.
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// messages = full conversation history comes from interview
export const getOpenAIResponse = async (messages) => {
    const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
    });

    return response.choices[0].message.content;
};