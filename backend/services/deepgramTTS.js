import axios from "axios";

/**
 * Strip markdown / formatting so TTS reads naturally.
 * Removes: **bold**, *italic*, ~~strike~~, `code`, ```blocks```,
 * [links](url), ![images](url), headers (#), bullets, numbered lists, etc.
 */
const stripMarkdown = (text) => {
    return text
        // Remove code blocks (```...```)
        .replace(/```[\s\S]*?```/g, "")
        // Remove inline code (`...`)
        .replace(/`([^`]*)`/g, "$1")
        // Remove images ![alt](url)
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Remove links [text](url) → keep text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Remove bold/italic markers (**, __, *, _)
        .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
        // Remove strikethrough ~~text~~
        .replace(/~~(.*?)~~/g, "$1")
        // Remove headers (# ## ### etc.)
        .replace(/^#{1,6}\s+/gm, "")
        // Remove horizontal rules (---, ***, ___)
        .replace(/^[\s]*([-*_]){3,}\s*$/gm, "")
        // Remove bullet points (- or * at start of line)
        .replace(/^\s*[-*+]\s+/gm, "")
        // Remove numbered list markers (1. 2. etc.)
        .replace(/^\s*\d+\.\s+/gm, "")
        // Remove blockquotes (>)
        .replace(/^\s*>\s?/gm, "")
        // Collapse multiple newlines
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const auraTextToSpeech = async (text) => {
    try {
        const cleanText = stripMarkdown(text);
        const response = await axios.post(
            "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
            { text: cleanText },
            {
                headers: {
                    "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
                timeout: 10000,
            }
        );

        return Buffer.from(response.data).toString("base64");
    } catch (err) {
        console.warn("Deepgram TTS failed:", err.message);
        return null;
    }
};