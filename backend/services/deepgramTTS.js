import axios from "axios";

export const auraTextToSpeech = async (text) => {
    try {
        const response = await axios.post(
            "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
            { text },
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