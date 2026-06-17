import { DeepgramClient } from "@deepgram/sdk";

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

export const transcribeAudio = async (audioBuffer) => {
    try {
        // SDK v5: transcribeFile(uploadable, requestOptions)
        // The result is wrapped: result.data.results...
        const result = await deepgram.listen.v1.media.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                language: "en",
            }
        );

        // SDK v5 wraps the response in result.data
        const transcript =
            result?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript
            ?? result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

        console.log("Deepgram transcript:", transcript);
        return transcript || "";
    } catch (err) {
        console.error("Deepgram error:", err?.message || err);
        return "";
    }
};