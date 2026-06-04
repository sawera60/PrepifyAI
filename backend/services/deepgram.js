import { DeepgramClient } from "@deepgram/sdk";

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

export const transcribeAudio = async (audioBuffer) => {
    try {
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                language: "en",
            }
        );

        if (error) throw error;

        const transcript =
            result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

        return transcript || "";
    } catch (err) {
        console.error("Deepgram error:", err);
        return "";
    }
};