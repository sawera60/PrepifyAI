import { DeepgramClient } from "@deepgram/sdk";

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

export const transcribeAudio = async (audioBuffer) => {
    try {
        const result = await deepgram.listen.v1.media.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                language: "en",
            }
        );

        const transcript =
            result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

        return transcript || "";
    } catch (err) {
        console.error("Deepgram error:", err);
        return "";
    }
};