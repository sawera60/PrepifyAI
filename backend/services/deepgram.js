import axios from "axios";

export const transcribeAudio = async (audioBuffer, mimeType = "audio/webm") => {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;

        if (!apiKey) {
            console.error("❌ DEEPGRAM_API_KEY is not set!");
            return "";
        }

        const baseMime = mimeType.split(";")[0].trim();
        const contentType = baseMime || "audio/webm";

        console.log(`🎙️ Transcribing — size: ${audioBuffer.length} bytes, Content-Type: ${contentType}`);

        const response = await axios.post(
            "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en&punctuate=true",
            audioBuffer,
            {
                headers: {
                    "Authorization": `Token ${apiKey}`,
                    "Content-Type": contentType,
                },
                maxBodyLength: Infinity,
                timeout: 30000,
            }
        );

        const transcript =
            response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

        console.log("✅ Deepgram transcript:", transcript || "(empty)");
        return transcript || "";
    } catch (err) {
        const errBody = err?.response?.data;
        console.error("❌ Deepgram error:", errBody || err?.message || err);
        return "";
    }
};